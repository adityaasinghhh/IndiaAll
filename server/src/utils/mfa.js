import crypto from 'crypto'
import speakeasy from 'speakeasy'

/**
 * Multi-Factor Authentication utilities.
 *
 * Provides standards-compliant TOTP (RFC 6238) support, encrypted at-rest
 * storage of TOTP secrets, and one-time recovery codes.
 *
 * All secret material is encrypted before being written to MongoDB. The
 * encryption key must be provided via the MFA_ENCRYPTION_KEY environment
 * variable (32 random bytes, base64-encoded). Without it, MFA enrollment
 * is disabled and the server fails safely.
 */

/* ------------------------------------------------------------------ */
/*  Encryption helpers (AES-256-GCM)                                  */
/* ------------------------------------------------------------------ */

function getEncryptionKey() {
  const raw = process.env.MFA_ENCRYPTION_KEY
  if (!raw) return null
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) return null
  return key
}

const encryptionKey = getEncryptionKey()

export function mfaEncryptionAvailable() {
  return encryptionKey !== null
}

/**
 * Encrypt a UTF-8 string using AES-256-GCM. Returns base64(iv || tag ||
 * ciphertext). Throws if no encryption key is configured.
 */
export function encryptSecret(plaintext) {
  if (!encryptionKey) {
    throw new Error('MFA encryption key is not configured')
  }
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv)
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

/**
 * Decrypt a value produced by encryptSecret(). Returns the original string
 * or throws on tampering / wrong key.
 */
export function decryptSecret(ciphertextB64) {
  if (!encryptionKey) {
    throw new Error('MFA encryption key is not configured')
  }
  const data = Buffer.from(ciphertextB64, 'base64')
  const iv = data.subarray(0, 12)
  const tag = data.subarray(12, 28)
  const encrypted = data.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8')
}

/* ------------------------------------------------------------------ */
/*  TOTP helpers (RFC 6238)                                           */
/* ------------------------------------------------------------------ */

export const TOTP_WINDOW = 1 // accept current +/− one 30s step (±30s)

export function generateTotpSecret() {
  return speakeasy.generateSecret({ length: 32 }).base32
}

export function generateTotpUri(secret, email, issuer = 'INDIA ALL') {
  return speakeasy.otpauthURL({
    secret,
    label: `${issuer}:${email}`,
    issuer,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  })
}

/**
 * Verify a TOTP code against a secret. Returns { ok, reason }.
 */
export function verifyTotpCode(secret, token) {
  if (!secret || typeof token !== 'string' || !/^\d{6}$/.test(token)) {
    return { ok: false, reason: 'invalid' }
  }
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: TOTP_WINDOW,
  })
  return verified ? { ok: true } : { ok: false, reason: 'invalid' }
}

/* ------------------------------------------------------------------ */
/*  Recovery codes                                                    */
/* ------------------------------------------------------------------ */

export const RECOVERY_CODE_COUNT = 10
export const RECOVERY_CODE_LENGTH = 12 // e.g. ABCD-EFGH-IJKL

function generateRecoveryCode() {
  const bytes = crypto.randomBytes(RECOVERY_CODE_LENGTH / 2)
  return bytes.toString('hex').toUpperCase().match(/.{1,4}/g).join('-')
}

export function generateRecoveryCodes() {
  return Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode)
}

/**
 * Hash a recovery code for storage (SHA-256). Plain codes are never
 * persisted after generation.
 */
export function hashRecoveryCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export function verifyRecoveryCode(code, hash) {
  if (!code || typeof code !== 'string') return false
  return hashRecoveryCode(code) === hash
}

/* ------------------------------------------------------------------ */
/*  MFA challenge binding (ephemeral, in-memory style via DB)         */
/* ------------------------------------------------------------------ */

/**
 * Build a short-lived MFA challenge document that is stored on the user
 * record and consumed atomically. Used to bind an MFA step to a specific
 * authentication attempt (prevents replay across sessions).
 */
export function buildMfaChallenge() {
  const challengeId = crypto.randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
  return { challengeId, expiresAt, consumed: false }
}

/* ------------------------------------------------------------------ */
/*  MFA challenge bind / consume / clear                              */
/* ------------------------------------------------------------------ */

/**
 * Bind an MFA challenge to the user document and persist it. Returns the
 * challengeId to send to the client.
 */
export async function bindMfaChallenge(user) {
  const challenge = buildMfaChallenge()
  user.mfaChallenge = challenge
  await user.save()
  return challenge.challengeId
}

/**
 * Consume an MFA challenge atomically. Returns the user document if the
 * challenge is valid and unexpired, otherwise null.
 */
export async function consumeMfaChallenge(Model, userId, challengeId) {
  const user = await Model.findById(userId)
  if (!user) return null
  const mc = user.mfaChallenge
  if (!mc || !mc.challengeId || mc.consumed) return null
  if (mc.challengeId !== challengeId) return null
  if (mc.expiresAt && new Date(mc.expiresAt).getTime() < Date.now()) return null

  const updateResult = await Model.updateOne(
    { _id: userId, 'mfaChallenge.challengeId': challengeId, 'mfaChallenge.consumed': false },
    { $set: { 'mfaChallenge.consumed': true } },
  )
  if (updateResult.matchedCount === 0) return null

  user.mfaChallenge.consumed = true
  return user
}

/**
 * Clear the MFA challenge after successful MFA completion.
 */
export async function clearMfaChallenge(Model, userId) {
  await Model.updateOne({ _id: userId }, { $set: { mfaChallenge: undefined } })
}

/**
 * Verify an MFA challenge: either TOTP or recovery code. Consumes the
 * challenge and (on success) marks the recovery code as used.
 * Returns { ok: true, user } or { ok: false, reason }.
 */
export async function verifyMfaChallenge(Model, userId, challengeId, token) {
  const user = await consumeMfaChallenge(Model, userId, challengeId)
  if (!user) {
    return { ok: false, reason: 'invalid_or_expired_challenge' }
  }

  let verified = false
  if (user.twoFactorSecret && user.twoFactorEnabled) {
    try {
      const secret = decryptSecret(user.twoFactorSecret)
      const result = verifyTotpCode(secret, token)
      if (result.ok) verified = true
    } catch {
      // decryption failure -> not verified
    }
  }
  if (!verified && token) {
    const codeHash = hashRecoveryCode(token)
    const codeEntry = (user.recoveryCodes || []).find(
      (c) => c.hash === codeHash && !c.used,
    )
    if (codeEntry) {
      codeEntry.used = true
      codeEntry.usedAt = new Date()
      verified = true
    }
  }

  await user.save()

  if (!verified) {
    return { ok: false, reason: 'invalid_code' }
  }

  await clearMfaChallenge(Model, userId)
  return { ok: true, user }
}

/**
 * Issue an MFA challenge for a user whose password has been verified.
 * Returns a challengeId that the client must present with the MFA code.
 */
export async function issueMfaChallenge(user) {
  const challengeId = await bindMfaChallenge(user)
  return { challengeId, userId: user._id }
}
