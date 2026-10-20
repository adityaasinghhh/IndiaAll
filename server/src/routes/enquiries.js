import { Router } from 'express'
import {
  createEnquiry,
  getMyEnquiries,
  getEnquiryById,
  getAllEnquiries,
  updateEnquiryStatus,
  replyToEnquiry,
  deleteEnquiry,
  exportEnquiriesCSV,
} from '../controllers/enquiryController.js'
import { authenticateCustomer, authenticateAdmin } from '../middleware/auth.js'
import { enquiryLimiter } from '../middleware/rateLimiter.js'
import { validateEnquiry, sanitizeEnquiry } from '../middleware/validate.js'

const router = Router()

// Public route — guests and logged-in customers
router.post('/', enquiryLimiter, sanitizeEnquiry, validateEnquiry, createEnquiry)

// Customer routes
router.get('/my', authenticateCustomer, getMyEnquiries)
router.get('/my/:id', authenticateCustomer, getEnquiryById)

// Admin routes
router.get('/', authenticateAdmin, getAllEnquiries)
router.put('/:id/status', authenticateAdmin, updateEnquiryStatus)
router.post('/:id/reply', authenticateAdmin, replyToEnquiry)
router.delete('/:id', authenticateAdmin, deleteEnquiry)
router.get('/export/csv', authenticateAdmin, exportEnquiriesCSV)

export default router
