import { Router } from 'express'
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerification,
  requestCustomerPasswordOtp,
  deleteAccount,
} from '../controllers/authController.js'
import { authenticateCustomer } from '../middleware/auth.js'
import { authLimiter, loginLimiter } from '../middleware/rateLimiter.js'
import { validateRegistration, validateLogin } from '../middleware/validate.js'

const router = Router()

router.post('/register', authLimiter, validateRegistration, register)
router.post('/login', loginLimiter, validateLogin, login)
router.post('/logout', authenticateCustomer, logout)
router.get('/me', authenticateCustomer, getMe)
router.put('/profile', authenticateCustomer, updateProfile)
router.put('/change-password', authenticateCustomer, changePassword)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)
router.post('/verify-email', verifyEmail)
router.post('/resend-verify-email', resendEmailVerification)
router.post('/change-password/request-otp', authenticateCustomer, requestCustomerPasswordOtp)
router.delete('/account', authenticateCustomer, deleteAccount)

export default router
