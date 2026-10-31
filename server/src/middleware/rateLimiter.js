import rateLimit from 'express-rate-limit'

// Rate limits protect production traffic; integration tests hammer these
// endpoints from a fixed IP and must not be throttled.
const skipInTest = () => process.env.NODE_ENV === 'test'

export const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: skipInTest,
  message: { message: 'Too many enquiries from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const bulkOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: skipInTest,
  message: { message: 'Too many bulk order requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: skipInTest,
  message: { message: 'Too many login attempts. Account locked for 2 hours.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  message: { message: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const mfaEnrollmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  skip: skipInTest,
  message: { message: 'Too many MFA enrollment attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const mfaVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  message: { message: 'Too many MFA verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skip: skipInTest,
  message: { message: 'Too many token refresh attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
