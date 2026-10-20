import { Router } from 'express'
import {
  enrollTotpStart,
  enrollTotpConfirm,
  getMfaStatus,
  disableMfa,
  regenerateRecoveryCodes,
} from '../controllers/mfaController.js'
import {
  adminEnrollTotpStart,
  adminEnrollTotpConfirm,
  adminGetMfaStatus,
  adminDisableMfa,
  adminRegenerateRecoveryCodes,
} from '../controllers/mfaController.js'
import { verifyMfaLogin } from '../controllers/authController.js'
import { verifyAdminMfa } from '../controllers/adminController.js'
import { authenticateCustomer } from '../middleware/auth.js'
import { authenticateAdmin } from '../middleware/auth.js'
import { mfaEnrollmentLimiter, mfaVerifyLimiter } from '../middleware/rateLimiter.js'

// ---------------------------------------------------------------------------
// Customer MFA routes (mounted at /api/v1/auth)
// ---------------------------------------------------------------------------

const customerRouter = Router()

customerRouter.post('/mfa/enroll/start', authenticateCustomer, mfaEnrollmentLimiter, enrollTotpStart)
customerRouter.post('/mfa/enroll/confirm', authenticateCustomer, mfaEnrollmentLimiter, enrollTotpConfirm)
customerRouter.get('/mfa/status', authenticateCustomer, getMfaStatus)
customerRouter.post('/mfa/disable', authenticateCustomer, mfaVerifyLimiter, disableMfa)
customerRouter.post('/mfa/recovery-codes', authenticateCustomer, mfaVerifyLimiter, regenerateRecoveryCodes)
customerRouter.post('/mfa/verify-login', mfaVerifyLimiter, verifyMfaLogin)

// ---------------------------------------------------------------------------
// Admin MFA routes (mounted at /api/v1/admin)
// ---------------------------------------------------------------------------

const adminRouter = Router()

adminRouter.post('/mfa/enroll/start', authenticateAdmin, mfaEnrollmentLimiter, adminEnrollTotpStart)
adminRouter.post('/mfa/enroll/confirm', authenticateAdmin, mfaEnrollmentLimiter, adminEnrollTotpConfirm)
adminRouter.get('/mfa/status', authenticateAdmin, adminGetMfaStatus)
adminRouter.post('/mfa/disable', authenticateAdmin, mfaVerifyLimiter, adminDisableMfa)
adminRouter.post('/mfa/recovery-codes', authenticateAdmin, mfaVerifyLimiter, adminRegenerateRecoveryCodes)
adminRouter.post('/mfa/verify-login', authenticateAdmin, mfaVerifyLimiter, verifyAdminMfa)

export { customerRouter, adminRouter }
