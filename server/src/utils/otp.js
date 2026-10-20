import crypto from 'crypto'

/**
 * Email OTP utilities.
 *
 * OTPs are 8-digit, cryptographically random codes. Only a keyed SHA-256
 * hash of the code is ever stored; the plain code is emailed and never
 * persisted. Purposes group the codes by their flow:
 *   - 'email-verification' (customer email verification)
 *   - 'admin-login'        (administrator sign-in)
 *   - 'password'            (customer / admin password recovery or change)
 */

export const OTP_PURPOSES = {
  EMAIL_VERIFICATION: 'email-verification',
  ADMIN_LOGIN: 'admin-login',
  PASSWORD: 'password',
}

export const OTP_TTL_MS = 5 * 60 * 1000 // codes expire after 5 minutes
export const MAX_OTP_ATTEMPTS = 5 // verification attempts per code
export const RESEND_COOLDOWN_MS = 60 * 1000 // one new code every 60 seconds

export function generateOtpCode() {
  // 10000000..99999999 -> always an 8-digit code.
  return String(crypto.randomInt(10000000, 100000000))
}

export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

export function isOtpExpired(expiresAt) {
  const expiry = expiresAt ? new Date(expiresAt).getTime() : NaN
  return Number.isNaN(expiry) || expiry < Date.now()
}

export function isResendAllowed(lastIssuedAt, now = Date.now()) {
  const issued = lastIssuedAt ? new Date(lastIssuedAt).getTime() : NaN
  return Number.isNaN(issued) || now - issued >= RESEND_COOLDOWN_MS
}

/**
 * Validate a pending OTP document. Returns { ok, reason }.
 */
export function validateOtp(doc, purpose) {
  if (!doc || doc.purpose !== purpose || doc.consumed) {
    return { ok: false, reason: 'missing' }
  }
  if (isOtpExpired(doc.expiresAt)) {
    return { ok: false, reason: 'expired' }
  }
  if (doc.attempts >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: 'locked' }
  }
  return { ok: true }
}
