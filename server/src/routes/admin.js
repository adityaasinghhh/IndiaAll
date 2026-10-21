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
import chatRoutes from './chat.js'

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

// ── Chatbot administration ────────────────────────────────────

// ChatFaq CRUD
router.get('/chat-faq', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const language = req.query.language // 'en' | 'es' | 'pt' | 'all'
    let query = { active: true }
    if (language && language !== 'all') {
      query.language = language
    }
    const entries = await ChatFaq.find(query).sort({ language: 1, question: 1 })
    res.json(entries)
  } catch (err) {
    console.error('admin chat-faq list error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/chat-faq', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, language } = req.body
    if (!question || !answer || !language) {
      return res.status(400).json({ message: 'Question, answer and language are required' })
    }
    const normalized = normaliseForMatching(question)
    const existing = await ChatFaq.findOne({
      language,
      active: true,
      question: new RegExp(`^${escapeRegex(normalized)}$`, 'i'),
    })
    if (existing) {
      existing.answer = answer
      existing.question = question
      existing.updatedAt = Date.now()
      await existing.save()
      res.json(existing)
    } else {
      const entry = new ChatFaq({ question, answer, language, active: true })
      await entry.save()
      res.status(201).json(entry)
    }
  } catch (err) {
    console.error('admin chat-faq create/update error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

router.delete('/chat-faq/:id', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params
    await ChatFaq.findByIdAndUpdate(id, { active: false, updatedAt: Date.now() })
    res.json({ success: true })
  } catch (err) {
    console.error('admin chat-faq delete error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ChatUnanswered CRUD
router.get('/chat-unanswered', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const status = req.query.status || 'new'
    let query = {}
    if (status !== 'all') {
      query.status = status
    }
    const entries = await ChatUnanswered.find(query).sort({ lastSeen: -1 }).limit(200)
    res.json(entries)
  } catch (err) {
    console.error('admin chat-unanswered list error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/chat-unanswered/:id/resolve', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params
    await ChatUnanswered.findByIdAndUpdate(id, { status: 'resolved', lastSeen: Date.now() })
    res.json({ success: true })
  } catch (err) {
    console.error('admin mark-resolved error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/chat-unanswered/create-faq', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { id, question, language, answer } = req.body
    if (!question || !language) {
      return res.status(400).json({ message: 'Question and language are required' })
    }
    const normalized = normaliseForMatching(question)
    const existing = await ChatFaq.findOne({
      language,
      active: true,
      question: new RegExp(`^${escapeRegex(normalized)}$`, 'i'),
    })
    if (existing) {
      existing.answer = answer || existing.answer
      existing.question = question
      existing.updatedAt = Date.now()
      await existing.save()
      res.json(existing)
    } else {
      const entry = new ChatFaq({ question, answer: answer || ' ', language, active: true })
      await entry.save()
      res.status(201).json(entry)
    }
  } catch (err) {
    console.error('admin create-faq from unanswered error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── Helper functions ──────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&')
}

// Normalise a string for matching: lowercase, trim, collapse whitespace,
// strip diacritics, remove punctuation – used for both FAQ matching
// and unanswered question deduplication.
function normaliseForMatching(text) {
  if (typeof text !== 'string') return ''
  let result = text.toLowerCase().trim()
  // Collapse multiple whitespace
  result = result.replace(/\s+/g, ' ')
  // Strip diacritics (accent characters) manually – no ICU dependency
  const diacritics =
    'ÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÖÖÐÝáéíóúàèìòùâêîôûãõööðý'
  const equivalents =
    'AEIOUAEIOUAEIOUaoiuAEIOUaeiou'
  let resultNoDiac = ''
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    const index = diacritics.indexOf(char)
    if (index !== -1) {
      resultNoDiac += equivalents[index]
    } else {
      resultNoDiac += char
    }
  }
  result = resultNoDiac
  // Remove punctuation – keep alphanumeric and spaces only
  result = result.replace(/[^\w\s]/g, ' ')
  // Collapse whitespace again
  result = result.replace(/\s+/g, ' ').trim()
  return result
}

// Import models at the bottom to avoid circular references
import ChatFaq from '../models/chat/ChatFaq.js'
import ChatUnanswered from '../models/chat/ChatUnanswered.js'

export default router