import Product from '../models/Product.js'
import { sanitizeString } from '../utils/validators.js'
import { searchFilter } from '../utils/search.js'
import {
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} from './adminController.js'

export async function getAllProducts(req, res, next) {
  try {
    const products = await Product.find({ visible: true }).sort({ order: 1 })
    res.json({ products })
  } catch (error) {
    next(error)
  }
}

export async function getAllProductsAdmin(req, res, next) {
  try {
    const searchClause = searchFilter(req.query.search, ['name', 'slug'])
    const query = {}
    if (req.query.category) query.category = req.query.category
    if (searchClause) query.$or = searchClause.$or

    const products = await Product.find(query).sort({ order: 1 }).limit(500)
    res.json({ products })
  } catch (error) {
    next(error)
  }
}

/**
 * The admin-only create/update/delete handlers live in adminController so the
 * /admin/products and /products admin routes share one validated implementation.
 */
export const createProduct = createProductAdmin
export const updateProduct = updateProductAdmin
export const deleteProduct = deleteProductAdmin
