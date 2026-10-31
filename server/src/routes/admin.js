import { Router } from 'express'
import {
  adminLogin,
  verifyAdminLoginOtp,
  requestAdminPasswordOtp,
  adminLogout,
  getAdminSession,
  refreshAdminToken,
  updateAdminProfile,
  changeAdminPassword,
  getDashboard,
  getReports,
  getBulkOrders,
  getBulkOrderById,
  updateBulkOrderStatus,
  addBulkOrderNote,
  exportBulkOrdersCSV,
  getProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
  exportProductsCSV,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  deleteCustomer,
  exportCustomersCSV,
  getAuditLogs,
  createAdmin,
} from '../controllers/adminController.js'
import { authenticateAdmin, requireRole } from '../middleware/auth.js'
import { loginLimiter, otpLimiter, refreshLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Session lifecycle
router.post('/login', loginLimiter, adminLogin)
router.post('/otp-verify', otpLimiter, verifyAdminLoginOtp)
router.post('/password/otp-request', authenticateAdmin, requestAdminPasswordOtp)
router.post('/refresh', refreshLimiter, refreshAdminToken)
router.post('/logout', authenticateAdmin, adminLogout)
router.get('/session', authenticateAdmin, getAdminSession)

// Dashboard & reports
router.get('/dashboard', authenticateAdmin, getDashboard)
router.get('/reports', authenticateAdmin, getReports)

// Bulk order management
router.get('/orders', authenticateAdmin, getBulkOrders)
router.get('/orders/export/csv', authenticateAdmin, exportBulkOrdersCSV)
router.get('/orders/:id', authenticateAdmin, getBulkOrderById)
router.put('/orders/:id/status', authenticateAdmin, updateBulkOrderStatus)
router.post('/orders/:id/notes', authenticateAdmin, addBulkOrderNote)

// Product management
router.get('/products', authenticateAdmin, getProductsAdmin)
router.get('/products/export/csv', authenticateAdmin, exportProductsCSV)
router.post('/products', authenticateAdmin, requireRole('owner', 'editor'), createProductAdmin)
router.put('/products/:id', authenticateAdmin, requireRole('owner', 'editor'), updateProductAdmin)
router.delete('/products/:id', authenticateAdmin, requireRole('owner'), deleteProductAdmin)

// Customer management
router.get('/customers', authenticateAdmin, getCustomers)
router.get('/customers/export/csv', authenticateAdmin, exportCustomersCSV)
router.get('/customers/:id', authenticateAdmin, getCustomerById)
router.put('/customers/:id/status', authenticateAdmin, requireRole('owner', 'editor'), updateCustomerStatus)
router.delete('/customers/:id', authenticateAdmin, requireRole('owner'), deleteCustomer)

// Audit logs
router.get('/audit-logs', authenticateAdmin, getAuditLogs)

// Admin profile & password
router.put('/profile', authenticateAdmin, updateAdminProfile)
router.put('/password', authenticateAdmin, changeAdminPassword)

// Admin management (owner only)
router.post('/create-admin', authenticateAdmin, requireRole('owner'))

export default router