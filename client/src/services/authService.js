import { api } from './api.js'

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerifyEmail: (data) => api.post('/auth/resend-verify-email', data),
  requestCustomerPasswordOtp: () => api.post('/auth/change-password/request-otp'),
  deleteAccount: (data) => api.delete('/auth/account', data),

  // MFA (customer)
  mfaEnrollStart: () => api.post('/auth/mfa/enroll/start'),
  mfaEnrollConfirm: (data) => api.post('/auth/mfa/enroll/confirm', data),
  mfaStatus: () => api.get('/auth/mfa/status'),
  mfaDisable: (data) => api.post('/auth/mfa/disable', data),
  mfaRegenerateRecoveryCodes: (data) => api.post('/auth/mfa/recovery-codes', data),
  verifyMfaLogin: (data) => api.post('/auth/mfa/verify-login', data),
}
