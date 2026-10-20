import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import Customer from '../models/Customer.js'
import Admin from '../models/Admin.js'

export async function authenticateCustomer(req, res, next) {
  try {
    const token = req.cookies.customer_access_token
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    const customer = await Customer.findById(decoded.userId)
    if (!customer || customer.suspended) {
      return res.status(401).json({ message: 'Account not found or suspended' })
    }
    req.customer = customer
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export async function authenticateAdmin(req, res, next) {
  try {
    const token = req.cookies.admin_access_token
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    const admin = await Admin.findById(decoded.adminId)
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' })
    }
    // Tokens issued before a logout / password change carry an older
    // sessionVersion and must be rejected even if otherwise unexpired.
    if (Number(decoded.v || 0) !== admin.sessionVersion) {
      return res.status(401).json({ message: 'Session has been invalidated' })
    }
    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}
