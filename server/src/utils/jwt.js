import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config/env.js'

export function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  })
}

export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  })
}

export function generateAdminAccessToken(adminId, sessionVersion = 0) {
  return jwt.sign({ adminId, v: sessionVersion }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  })
}

export function generateAdminRefreshToken(adminId) {
  // A unique jti guarantees every issued token is distinct even when several
  // are minted within the same second for the same admin — otherwise token
  // rotation would be a no-op and old tokens could not be distinguished.
  return jwt.sign({ adminId, jti: crypto.randomUUID() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret)
}
