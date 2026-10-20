import { Router } from 'express'
import {
  getAllProducts,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { authenticateAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', getAllProducts)
router.get('/admin', authenticateAdmin, getAllProductsAdmin)
router.post('/', authenticateAdmin, createProduct)
router.put('/:id', authenticateAdmin, updateProduct)
router.delete('/:id', authenticateAdmin, deleteProduct)

export default router
