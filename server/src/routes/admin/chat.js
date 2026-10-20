const router = require('express').Router()
const ChatFaq = require('../models/chat/ChatFaq.js')
const ChatUnanswered = require('../models/chat/ChatUnanswered.js')
const { authenticateAdmin, requireRole } = require('../middleware/auth.js')

// ── ChatFaq CRUD – admin only ─────────────────────────────────

// GET /api/admin/chat-faq — list all active FAQ entries (per language)
// Optional language query param: 'en' | 'es' | 'pt' | 'all'
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

// POST /api/admin/chat-faq — create or update an FAQ entry
router.post('/chat-faq', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { question, answer, language } = req.body
    if (!question || !answer || !language) {
      return res.status(400).json({ message: 'Question, answer and language are required' })
    }
    const normalized = normaliseForMatching(question)
    // Check if an active entry with same normalized question+language exists
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

// DELETE /api/admin/chat-faq/:id — soft-delete (set active=false)
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

// ── ChatUnanswered CRUD – admin only ──────────────────────────

// GET /api/admin/chat-unanswered — list unanswered questions
router.get('/chat-unanswered', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const status = req.query.status || 'new' // 'new' | 'resolved' | 'all'
    let query = {}
    if (status !== 'all') {
      query.status = status
    }
    const entries = await ChatUnanswered.find(query)
      .sort({ lastSeen: -1 })
      .limit(200)
    res.json(entries)
  } catch (err) {
    console.error('admin chat-unanswered list error:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/admin/chat-unanswered/:id/resolve — mark as resolved
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

// POST /api/admin/chat-unanswered/create-faq — create FAQ from this question
router.post('/chat-unanswered/create-faq', authenticateAdmin, requireRole('admin'), async (req, res) => {
  try {
    const { id, question, language, answer } = req.body
    if (!question || !language) {
      return res.status(400).json({ message: 'Question and language are required' })
    }
    const normalized = normaliseForMatching(question)
    // Check if an active FAQ with same normalized question+language exists
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

module.exports = router