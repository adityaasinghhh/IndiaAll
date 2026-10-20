import crypto from 'crypto'

export function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}

export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 60 * 60 * 1000
  return { token, expires }
}

export function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + 24 * 60 * 60 * 1000
  return { token, expires }
}

export function isTokenExpired(expires) {
  return expires < Date.now()
}
