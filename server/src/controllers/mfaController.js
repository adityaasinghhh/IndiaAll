import Customer from '../models/Customer.js'
import Admin from '../models/Admin.js'
import {
  encryptSecret,
  decryptSecret,
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  generateRecoveryCodes,
  hashRecoveryCode,
  buildMfaChallenge,
  bindMfaChallenge,
  consumeMfaChallenge,
  clearMfaChallenge,
  verifyMfaChallenge,
  mfaEncryptionAvailable,
} from '../utils/mfa.js'
import { generateOtpCode, hashOtp, OTP_PURPOSES, validateOtp } from '../utils/otp.js'
import { transporter } from '../config/email.js'
import { emailOtpEmail } from '../utils/emailTemplates.js'
import { config } from '../config/env.js'
import { isValidEmail } from '../utils/validators.js'

const testMode = () => config.nodeEnv === 'test'

/**
 * POST /api/v1/auth/mfa/enroll-start
 * Begin TOTP enrollment for the authenticated customer.
 */
export async function enrollTotpStart(req, res, next) {
  try {
    if (!mfaEncryptionAvailable()) {
      return res.status(503).json({ message: 'MFA is not configured on this server.' })
    }

    const customer = req.customer
    if (customer.twoFactorEnabled) {
      return res.status(409).json({ message: 'TOTP is already enabled for this account.' })
    }

    const secret = generateTotpSecret()
    const encrypted = encryptSecret(secret)

    // Store the encrypted secret temporarily (not yet enabled).
    customer.twoFactorSecret = encrypted
    customer.twoFactorEnabled = false
    await customer.save()

    const otpauthUrl = generateTotpUri(secret, customer.email)

    res.json({
      message: 'TOTP enrollment started. Scan the QR code with your authenticator app, then confirm with a 6-digit code.',
      secret: testMode() ? secret : undefined, // test only
      otpauthUrl,
      qrDataUrl: `data:image/svg+xml;base64,${Buffer.from(otpauthUrl).toString('base64')}`,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/mfa/enroll-confirm
 * Confirm TOTP enrollment with a valid 6-digit code and generate recovery codes.
 */
export async function enrollTotpConfirm(req, res, next) {
  try {
    const customer = req.customer
    const { token } = req.body || {}

    if (!customer.twoFactorSecret) {
      return res.status(400).json({ message: 'No enrollment in progress.' })
    }

    const secret = decryptSecret(customer.twoFactorSecret)
    const result = verifyTotpCode(secret, token)
    if (!result.ok) {
      return res.status(401).json({ message: 'Invalid verification code.' })
    }

    // Enable MFA and generate recovery codes.
    const recoveryCodes = generateRecoveryCodes()
    customer.twoFactorEnabled = true
    customer.twoFactorEnrolledAt = new Date()
    customer.recoveryCodes = recoveryCodes.map((code) => ({ hash: hashRecoveryCode(code) }))
    await customer.save()

    // Test mode: return recovery codes so tests can use them.
    const response = {
      message: 'TOTP enrolled successfully. Save your recovery codes — they are shown only once.',
      recoveryCodes: testMode() ? recoveryCodes : undefined,
    }

    res.json(response)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/auth/mfa/status
 * Return MFA enrollment status for the authenticated customer.
 */
export async function getMfaStatus(req, res, next) {
  try {
    const customer = req.customer
    res.json({
      twoFactorEnabled: customer.twoFactorEnabled || false,
      enrolledAt: customer.twoFactorEnrolledAt,
      recoveryCodesRemaining: (customer.recoveryCodes || []).filter((c) => !c.used).length,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/mfa/disable
 * Disable MFA. Requires reauthentication (current password + valid TOTP or recovery code).
 */
export async function disableMfa(req, res, next) {
  try {
    const customer = req.customer
    const { currentPassword, token } = req.body || {}

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }

    const isMatch = await customer.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Verify TOTP or recovery code.
    let verified = false
    if (customer.twoFactorSecret && customer.twoFactorEnabled && token) {
      const secret = decryptSecret(customer.twoFactorSecret)
      const result = verifyTotpCode(secret, token)
      if (result.ok) verified = true
    }
    if (!verified && token) {
      const codeHash = hashRecoveryCode(token)
      const codeEntry = (customer.recoveryCodes || []).find(
        (c) => c.hash === codeHash && !c.used,
      )
      if (codeEntry) {
        codeEntry.used = true
        codeEntry.usedAt = new Date()
        verified = true
      }
    }
    if (!verified) {
      return res.status(401).json({ message: 'A valid verification code or recovery code is required.' })
    }

    customer.twoFactorEnabled = false
    customer.twoFactorSecret = undefined
    customer.twoFactorEnrolledAt = undefined
    customer.recoveryCodes = []
    customer.refreshTokens = []
    await customer.save()

    res.clearCookie('customer_access_token')
    res.clearCookie('customer_refresh_token')
    res.json({ message: 'MFA disabled. Please log in again.' })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/auth/mfa/recovery-codes
 * Regenerate recovery codes (invalidates all existing unused codes).
 * Requires recent authentication (current password + MFA).
 */
export async function regenerateRecoveryCodes(req, res, next) {
  try {
    const customer = req.customer
    const { currentPassword, token } = req.body || {}

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }

    const isMatch = await customer.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Require MFA verification if MFA is enabled.
    if (customer.twoFactorEnabled) {
      if (!token) {
        return res.status(400).json({ message: 'A verification code is required.' })
      }
      let verified = false
      if (customer.twoFactorSecret) {
        const secret = decryptSecret(customer.twoFactorSecret)
        const result = verifyTotpCode(secret, token)
        if (result.ok) verified = true
      }
      if (!verified) {
        const codeHash = hashRecoveryCode(token)
        const codeEntry = (customer.recoveryCodes || []).find(
          (c) => c.hash === codeHash && !c.used,
        )
        if (codeEntry) {
          codeEntry.used = true
          codeEntry.usedAt = new Date()
          verified = true
        }
      }
      if (!verified) {
        return res.status(401).json({ message: 'Invalid verification code or recovery code.' })
      }
    }

    const recoveryCodes = generateRecoveryCodes()
    customer.recoveryCodes = recoveryCodes.map((code) => ({ hash: hashRecoveryCode(code) }))
    await customer.save()

    res.json({
      message: 'Recovery codes regenerated. Previous codes are invalid.',
      recoveryCodes: testMode() ? recoveryCodes : undefined,
    })
  } catch (error) {
    next(error)
  }
}

/* ------------------------------------------------------------------ */
/*  Admin MFA                                                         */
/* ------------------------------------------------------------------ */

/**
 * POST /api/v1/admin/mfa/enroll-start
 */
export async function adminEnrollTotpStart(req, res, next) {
  try {
    if (!mfaEncryptionAvailable()) {
      return res.status(503).json({ message: 'MFA is not configured on this server.' })
    }

    const admin = req.admin
    if (admin.twoFactorEnabled) {
      return res.status(409).json({ message: 'TOTP is already enabled for this account.' })
    }

    const secret = generateTotpSecret()
    const encrypted = encryptSecret(secret)

    admin.twoFactorSecret = encrypted
    admin.twoFactorEnabled = false
    await admin.save()

    const otpauthUrl = generateTotpUri(secret, admin.email)

    res.json({
      message: 'TOTP enrollment started. Scan the QR code with your authenticator app, then confirm with a 6-digit code.',
      secret: testMode() ? secret : undefined,
      otpauthUrl,
      qrDataUrl: `data:image/svg+xml;base64,${Buffer.from(otpauthUrl).toString('base64')}`,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/mfa/enroll-confirm
 */
export async function adminEnrollTotpConfirm(req, res, next) {
  try {
    const admin = req.admin
    const { token } = req.body || {}

    if (!admin.twoFactorSecret) {
      return res.status(400).json({ message: 'No enrollment in progress.' })
    }

    const secret = decryptSecret(admin.twoFactorSecret)
    const result = verifyTotpCode(secret, token)
    if (!result.ok) {
      return res.status(401).json({ message: 'Invalid verification code.' })
    }

    const recoveryCodes = generateRecoveryCodes()
    admin.twoFactorEnabled = true
    admin.twoFactorEnrolledAt = new Date()
    admin.recoveryCodes = recoveryCodes.map((code) => ({ hash: hashRecoveryCode(code) }))
    await admin.save()

    res.json({
      message: 'TOTP enrolled successfully. Save your recovery codes — they are shown only once.',
      recoveryCodes: testMode() ? recoveryCodes : undefined,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/v1/admin/mfa/status
 */
export async function adminGetMfaStatus(req, res, next) {
  try {
    const admin = req.admin
    res.json({
      twoFactorEnabled: admin.twoFactorEnabled || false,
      enrolledAt: admin.twoFactorEnrolledAt,
      recoveryCodesRemaining: (admin.recoveryCodes || []).filter((c) => !c.used).length,
      mfaRequired: true, // admins always require MFA
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/mfa/disable
 */
export async function adminDisableMfa(req, res, next) {
  try {
    const admin = req.admin
    const { currentPassword, token } = req.body || {}

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }

    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    let verified = false
    if (admin.twoFactorSecret && admin.twoFactorEnabled && token) {
      const secret = decryptSecret(admin.twoFactorSecret)
      const result = verifyTotpCode(secret, token)
      if (result.ok) verified = true
    }
    if (!verified && token) {
      const codeHash = hashRecoveryCode(token)
      const codeEntry = (admin.recoveryCodes || []).find(
        (c) => c.hash === codeHash && !c.used,
      )
      if (codeEntry) {
        codeEntry.used = true
        codeEntry.usedAt = new Date()
        verified = true
      }
    }
    if (!verified) {
      return res.status(401).json({ message: 'A valid verification code or recovery code is required.' })
    }

    admin.twoFactorEnabled = false
    admin.twoFactorSecret = undefined
    admin.twoFactorEnrolledAt = undefined
    admin.recoveryCodes = []
    admin.sessionVersion += 1
    admin.refreshTokens = []
    await admin.save()

    res.clearCookie('admin_access_token')
    res.clearCookie('admin_refresh_token')
    res.json({ message: 'MFA disabled. Please log in again.' })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/v1/admin/mfa/recovery-codes
 */
export async function adminRegenerateRecoveryCodes(req, res, next) {
  try {
    const admin = req.admin
    const { currentPassword, token } = req.body || {}

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }

    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    if (admin.twoFactorEnabled) {
      if (!token) {
        return res.status(400).json({ message: 'A verification code is required.' })
      }
      let verified = false
      if (admin.twoFactorSecret) {
        const secret = decryptSecret(admin.twoFactorSecret)
        const result = verifyTotpCode(secret, token)
        if (result.ok) verified = true
      }
      if (!verified) {
        const codeHash = hashRecoveryCode(token)
        const codeEntry = (admin.recoveryCodes || []).find(
          (c) => c.hash === codeHash && !c.used,
        )
        if (codeEntry) {
          codeEntry.used = true
          codeEntry.usedAt = new Date()
          verified = true
        }
      }
      if (!verified) {
        return res.status(401).json({ message: 'Invalid verification code or recovery code.' })
      }
    }

    const recoveryCodes = generateRecoveryCodes()
    admin.recoveryCodes = recoveryCodes.map((code) => ({ hash: hashRecoveryCode(code) }))
    await admin.save()

    res.json({
      message: 'Recovery codes regenerated. Previous codes are invalid.',
      recoveryCodes: testMode() ? recoveryCodes : undefined,
    })
  } catch (error) {
    next(error)
  }
}

/* ------------------------------------------------------------------ */
/*  MFA login challenge                                               */
/* ------------------------------------------------------------------ */

/*
 * issueMfaChallenge and verifyMfaChallenge are imported from ../utils/mfa.js.
 * They are used by the verifyMfaLogin and verifyAdminMfa route handlers.
 */
