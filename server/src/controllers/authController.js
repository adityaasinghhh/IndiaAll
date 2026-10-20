import Customer from '../models/Customer.js'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js'
import {
  generateOtpCode,
  hashOtp,
  isResendAllowed,
  OTP_PURPOSES,
  validateOtp,
} from '../utils/otp.js'
import { emailOtpEmail } from '../utils/emailTemplates.js'
import { transporter } from '../config/email.js'
import { config } from '../config/env.js'
import { isValidEmail, isValidPhone, sanitizeString } from '../utils/validators.js'
import {
  issueMfaChallenge,
  verifyMfaChallenge,
  mfaEncryptionAvailable,
} from '../utils/mfa.js'

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const testMode = () => config.nodeEnv === 'test'

function subjectFor(purpose) {
  if (purpose === OTP_PURPOSES.ADMIN_LOGIN) return 'Your administrator sign-in code'
  if (purpose === OTP_PURPOSES.PASSWORD) return 'Your INDIA ALL password code'
  return 'Your email verification code'
}

/**
 * Issue a fresh one-time code for the customer's flow, email it, and return
 * the plain code only when running automated tests (never in production).
 */
async function sendOtpEmail(customer, purpose) {
  const code = generateOtpCode()

  customer.otp = {
    purpose,
    hash: hashOtp(code),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    consumed: false,
    issuedAt: new Date(),
  }
  await customer.save()

  let delivered = true
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: customer.email,
      subject: subjectFor(purpose),
      html: emailOtpEmail(customer.name, code, purpose),
    })
  } catch (error) {
    console.error('Failed to send OTP email:', error.message)
    delivered = false
  }

  return { code, delivered }
}

export async function register(req, res, next) {
  try {
    const { name, company, country, phone, email, password } = req.body

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() })
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const customer = await Customer.create({
      name: sanitizeString(name),
      company: sanitizeString(company),
      country: sanitizeString(country),
      phone: sanitizeString(phone),
      email: email.toLowerCase(),
      password,
      consentGiven: true,
      consentTimestamp: new Date(),
    })

    // Registration never authenticates: the customer only receives an email
    // code and must verify it before an account can be used.
    const { code } = await sendOtpEmail(customer, OTP_PURPOSES.EMAIL_VERIFICATION)

    res.status(201).json({
      message: 'Registration successful. Please verify your email.',
      customer: customer.toSafeJSON(),
      // Test builds only; never present outside test mode.
      ...(testMode() && code ? { otpCode: code } : {}),
    })
  } catch (error) {
    next(error)
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { userId, otp } = req.body || {}

    if (!userId || typeof otp !== 'string' || otp.length < 1) {
      return res.status(400).json({ message: 'A verification code is required' })
    }

    const customer = await Customer.findById(userId)
    if (!customer) {
      return res.status(400).json({ message: 'Invalid verification request' })
    }

    const doc = customer.otp
    const state = validateOtp(doc, OTP_PURPOSES.EMAIL_VERIFICATION)
    if (!state.ok) {
      return res.status(400).json({ message: 'Invalid or expired verification code' })
    }
    if (hashOtp(otp) !== doc.hash) {
      await Customer.updateOne({ _id: customer._id }, { $inc: { 'otp.attempts': 1 } })
      return res.status(401).json({ message: 'The verification code is incorrect' })
    }
    await Customer.updateOne(
      { _id: customer._id, 'otp.hash': hashOtp(otp), 'otp.consumed': false },
      { $set: { 'otp.consumed': true, isEmailVerified: true } },
    )

    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    next(error)
  }
}

export async function resendEmailVerification(req, res, next) {
  try {
    const { email } = req.body || {}

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' })
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() })
    if (customer) {
      const doc = customer.otp
      // Only issue a new code when the previous one is unknown, was consumed,
      // or was sent more than the cooldown ago.
      const pendingDoc = doc && !doc.consumed ? doc : null
      if (!pendingDoc || isResendAllowed(pendingDoc.issuedAt)) {
        await sendOtpEmail(customer, OTP_PURPOSES.EMAIL_VERIFICATION)
      }
    }

    // Generic response: never reveal whether the account exists.
    res.json({ message: 'If an account exists with that email, a verification code has been sent.' })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    const customer = await Customer.findOne({ email: email.toLowerCase() })
    if (!customer) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (customer.isLocked()) {
      return res.status(423).json({ message: 'Account is temporarily locked. Please try again later.' })
    }

    const isMatch = await customer.comparePassword(password)
    if (!isMatch) {
      await customer.incrementLoginAttempts()
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (customer.suspended) {
      return res.status(403).json({ message: 'Account has been suspended' })
    }

    if (!customer.isEmailVerified) {
      return res.status(403).json({ message: 'Email not verified. Check your email for the verification code.' })
    }

    customer.loginAttempts = 0
    customer.lockUntil = undefined

    // If MFA is enabled, issue an MFA challenge instead of full login.
    if (customer.twoFactorEnabled && mfaEncryptionAvailable()) {
      const { challengeId, userId } = await issueMfaChallenge(customer)
      return res.status(200).json({
        message: 'MFA verification required.',
        requiresMfa: true,
        userId,
        challengeId,
      })
    }

    const accessToken = generateAccessToken(customer._id)
    const refreshToken = generateRefreshToken(customer._id)

    customer.refreshTokens.push({ token: refreshToken })
    if (customer.refreshTokens.length > 5) {
      customer.refreshTokens = customer.refreshTokens.slice(-5)
    }
    await customer.save()

    res.cookie('customer_access_token', accessToken, cookieOptions)
    res.cookie('customer_refresh_token', refreshToken, refreshCookieOptions)

    res.json({
      message: 'Login successful',
      customer: customer.toSafeJSON(),
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.customer_refresh_token
    if (refreshToken && req.customer) {
      await Customer.findByIdAndUpdate(req.customer._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      })
    }

    res.clearCookie('customer_access_token')
    res.clearCookie('customer_refresh_token')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export async function verifyMfaLogin(req, res, next) {
  try {
    const { userId, challengeId, token } = req.body || {}

    if (!userId || !challengeId || typeof token !== 'string') {
      return res.status(400).json({ message: 'User ID, challenge ID, and verification code are required.' })
    }

    const result = await verifyMfaChallenge(Customer, userId, challengeId, token)
    if (!result.ok) {
      if (result.reason === 'invalid_or_expired_challenge') {
        return res.status(400).json({ message: 'MFA challenge is invalid or has expired.' })
      }
      return res.status(401).json({ message: 'Invalid verification code.' })
    }

    const customer = result.user

    const accessToken = generateAccessToken(customer._id)
    const refreshToken = generateRefreshToken(customer._id)

    customer.refreshTokens.push({ token: refreshToken })
    if (customer.refreshTokens.length > 5) {
      customer.refreshTokens = customer.refreshTokens.slice(-5)
    }
    await customer.save()

    res.cookie('customer_access_token', accessToken, cookieOptions)
    res.cookie('customer_refresh_token', refreshToken, refreshCookieOptions)

    res.json({
      message: 'Login successful',
      customer: customer.toSafeJSON(),
    })
  } catch (error) {
    next(error)
  }
}

export async function getMe(req, res, next) {
  try {
    res.json({ customer: req.customer.toSafeJSON() })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, company, country, phone } = req.body
    const customer = req.customer

    if (name) customer.name = sanitizeString(name)
    if (company) customer.company = sanitizeString(company)
    if (country) customer.country = sanitizeString(country)
    if (phone) customer.phone = sanitizeString(phone)

    await customer.save()
    res.json({ message: 'Profile updated', customer: customer.toSafeJSON() })
  } catch (error) {
    next(error)
  }
}

export async function requestCustomerPasswordOtp(req, res, next) {
  try {
    const customer = req.customer

    const code = await sendOtpEmail(customer, OTP_PURPOSES.PASSWORD)

    res.json({
      message: 'A verification code has been sent to your email.',
      // Test builds only; never present outside test mode.
      ...(testMode() && code ? { otpCode: code } : {}),
    })
  } catch (error) {
    next(error)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, otp } = req.body
    const customer = req.customer

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }
    if (!otp || typeof otp !== 'string' || otp.length < 1) {
      return res.status(400).json({ message: 'A verification code is required' })
    }

    const isMatch = await customer.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const doc = customer.otp
    const state = validateOtp(doc, OTP_PURPOSES.PASSWORD)
    if (!state.ok) {
      return res.status(400).json({ message: 'A valid verification code is required' })
    }

    const expectedHash = hashOtp(otp)
    if (doc.hash !== expectedHash) {
      // Increment the failed-attempt counter atomically.
      await Customer.updateOne({ _id: customer._id }, { $inc: { 'otp.attempts': 1 } })
      return res.status(401).json({ message: 'The verification code is incorrect' })
    }

    // Atomic single-use consumption of the OTP, then set the new password
    // (save() runs the bcrypt pre-save hook). Mirror the consumed flag on the
    // in-memory document so save() doesn't revert it.
    const updateResult = await Customer.updateOne(
      { _id: customer._id, 'otp.hash': expectedHash, 'otp.consumed': false },
      { $set: { 'otp.consumed': true } },
    )
    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: 'A valid verification code is required' })
    }

    customer.otp.consumed = true
    customer.password = newPassword
    customer.refreshTokens = []
    await customer.save()

    res.clearCookie('customer_access_token')
    res.clearCookie('customer_refresh_token')
    res.json({ message: 'Password changed successfully. Please log in again.' })
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {}

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' })
    }

    const customer = await Customer.findOne({ email: email.toLowerCase() })
    if (customer) {
      // Issue a one-time password code, throttled by the same cooldown used
      // for verification codes. The response stays generic so the endpoint
      // can never be used to enumerate accounts. A consumed code no longer
      // counts as pending, so a fresh password code can be issued.
      const doc = customer.otp
      const pendingDoc = doc && !doc.consumed ? doc : null
      if (!pendingDoc || isResendAllowed(pendingDoc.issuedAt)) {
        const { code, delivered } = await sendOtpEmail(customer, OTP_PURPOSES.PASSWORD)
        // Safe failure: never confirm a delivery that did not happen.
        if (!delivered) {
          return res.status(502).json({ message: 'Failed to send the verification code. Please try again later.' })
        }
        return res.json({
          message: 'If an account exists with that email, a password code has been sent.',
          ...(testMode() && code ? { otpCode: code } : {}),
        })
      }
    }

    res.json({ message: 'If an account exists with that email, a password code has been sent.' })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { userId, email, otp, newPassword } = req.body || {}

    if (typeof otp !== 'string' || otp.length < 1) {
      return res.status(400).json({ message: 'A verification code is required' })
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'A valid reset request is required' })
    }

    let customer
    if (userId) {
      customer = await Customer.findById(userId)
    } else {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'A valid email is required' })
      }
      customer = await Customer.findOne({ email: email.toLowerCase() })
    }
    if (!customer) {
      return res.status(400).json({ message: 'Invalid or expired reset request' })
    }

    const doc = customer.otp
    const state = validateOtp(doc, OTP_PURPOSES.PASSWORD)
    if (!state.ok) {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }
    if (hashOtp(otp) !== doc.hash) {
      await Customer.updateOne({ _id: customer._id }, { $inc: { 'otp.attempts': 1 } })
      return res.status(401).json({ message: 'The reset code is incorrect' })
    }

    // Atomic single-use consumption of the OTP, then set the new password
    // (save() runs the bcrypt pre-save hook). The updateOne consumed flag is
    // mirrored on the in-memory document so save() doesn't revert it.
    const updateResult = await Customer.updateOne(
      { _id: customer._id, 'otp.hash': hashOtp(otp), 'otp.consumed': false },
      { $set: { 'otp.consumed': true } },
    )
    if (updateResult.matchedCount === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }

    customer.otp.consumed = true
    customer.password = newPassword
    customer.refreshTokens = []
    await customer.save()

    res.json({ message: 'Password reset successful. Please log in.' })
  } catch (error) {
    next(error)
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body
    const customer = req.customer

    const isMatch = await customer.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is incorrect' })
    }

    await Customer.findByIdAndDelete(customer._id)
    res.clearCookie('customer_access_token')
    res.clearCookie('customer_refresh_token')
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    next(error)
  }
}
