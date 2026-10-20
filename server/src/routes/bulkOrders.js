import { Router } from 'express'
import {
  createBulkOrder,
  getAllBulkOrders,
  updateBulkOrderStatus,
} from '../controllers/bulkOrderController.js'
import { authenticateAdmin } from '../middleware/auth.js'
import { bulkOrderLimiter } from '../middleware/rateLimiter.js'
import { validateBulkOrder, sanitizeBulkOrder } from '../middleware/validate.js'

const router = Router()

// Public route — guests and logged-in customers
router.post('/', bulkOrderLimiter, sanitizeBulkOrder, validateBulkOrder, createBulkOrder)

// Admin routes
router.get('/', authenticateAdmin, getAllBulkOrders)
router.put('/:id/status', authenticateAdmin, updateBulkOrderStatus)

export default router
