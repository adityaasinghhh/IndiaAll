import { config } from '../config/env.js'
import { products } from '../data/products.js'
import { geminate } from '../services/ai/gemini.service.js'

const MAX_MESSAGE_LENGTH = 1000
const MAX_HISTORY_MESSAGES = 6
const REQUEST_TIMEOUT_MS = 25000

import { handleChatMessage } from '../services/catalogueFaq.js'
import ChatFaq from '../models/chat/ChatFaq.js'
import ChatUnanswered from '../models/chat/ChatUnanswered.js'

/* ── Levenshtein distance for fuzzy string matching ───────────── */
function levenshtein(a, b) {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const matrix = []
  for (let i = 0; i <= b.length; i++) matrix[i] = [i]
  for (let j = 1; j <= a.length; j++) matrix[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

/* ── Normalise string for matching ─────────────────────────────── */
function normaliseForMatching(text) {
  if (typeof text !== 'string') return ''
  let result = text.toLowerCase().trim()
  result = result.replace(/\s+/g, ' ')
  // Strip diacritics manually
  const diacritics =
    'ÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÖÖÐÝáéíóúàèìòùâêîôûãõööðý'
  const equivalents = 'AEIOUAEIOUAEIOUaoiuAEIOUaeiou'
  let resultNoDiac = ''
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    const index = diacritics.indexOf(char)
    if (index !== -1) resultNoDiac += equivalents[index]
    else resultNoDiac += char
  }
  result = resultNoDiac
  result = result.replace(/[^\w\s]/g, ' ')
  result = result.replace(/\s+/g, ' ').trim()
  return result
}

/* ── Fuzzy product match: exact → singular/plural → Levenshtein ──── */
function fuzzyProductMatch(query, products, threshold = 0.55) {
  if (!query || !products) return null
  const normalized = normaliseForMatching(query)

  // Exact match
  for (const product of products) {
    if (normaliseForMatching(product.name) === normalized) return { product, type: 'exact' }
  }

  // Singular / plural tolerance
  const singularQ = normalized.replace(/\b(s)$/, '')
  for (const product of products) {
    const pNorm = normaliseForMatching(product.name).replace(/\b(s)$/, '')
    if (singularQ === pNorm) return { product, type: 'singular' }
  }

  // Levenshtein similarity
  let best = null
  let bestScore = 0
  for (const product of products) {
    const pNorm = normaliseForMatching(product.name)
    if (Math.abs(pNorm.length - normalized.length) > 3) continue
    const d = levenshtein(normalized, pNorm)
    const max = Math.max(normalized.length, pNorm.length)
    const score = 1 - d / max
    if (score > bestScore && score >= threshold) {
      bestScore = score
      best = { product, score, type: 'fuzzy' }
    }
  }
  if (best) return best
  return null
}

/* ── Check admin-managed FAQ entries ───────────────────────────── */
async function checkAdminFaq(normalized, language) {
  try {
    for (const lang of ['en', 'es', 'pt']) {
      const entry = await ChatFaq.findOne({
        language: lang,
        active: true,
        question: new RegExp(`^${normalized}$`, 'i'),
      })
      if (entry) {
        entry.updatedAt = Date.now()
        await entry.save()
        return entry.answer
      }
    }
    return null
  } catch (err) {
    console.error('Error checking admin FAQ:', err.message)
    return null
  }
}

/* ── Build handoff links ───────────────────────────────────────── */
function buildHandoff(language, customerName) {
  const supportEmail = config.supportEmail || 'Info@indiaall.org'
  const encodedQuestion = encodeURIComponent(trimmed)

  const mailtoLink = `${supportEmail}?subject=INDIA%20ALL%20Support%20Enquiry&body=${encodedQuestion}`

  return {
    emailLink: mailtoLink,
    emailText: language === 'en' ? `Email our team at ${supportEmail}` : language === 'es' ? `Correo a nuestro equipo en ${supportEmail}` : `E-mail nossa equipe em ${supportEmail}`,
    customerName,
  }
}

/* ── Fallback response builders ────────────────────────────────── */
function buildFallbackResponse(language, handoff) {
  const responses = {
    en: `I don't have an answer for that yet. Please email our team at Info@indiaall.org and we will get back to you, or use our enquiry form.`,
    es: "No tengo una respuesta aún para eso. Por favor, envíe un correo a nuestro equipo en Info@indiaall.org y le responderemos, o utilice nuestro formulario de consulta.",
    pt: "Não tenho uma resposta ainda para isso. Por favor, envie um e-mail para nossa equipe em Info@indiaall.org e retornaremos o contato, ou use nosso formulário de consulta.",
  }
  return responses[language] || responses.en
}

/* ── i18n support from controller (minimal) ────────────────────── */
function i18n(key, lang) {
  const messages = {
    en: {
      fallback: "I don't have an answer for that yet. Please email our team at Info@indiaall.org and we will get back to you.",
      emailHandoff: 'Email our team at',
      menu: 'Products & Commodities, Get a Quote, Custom Work Request, Transport & Delivery, My Enquiries, How It Works, Contact Us.',
      backToMenu: 'Back to menu',
      submitEnquiry: 'Submit an Enquiry',
    },
    es: {
      fallback: "No tengo una respuesta aún para eso. Por favor, envíe un correo a nuestro equipo en Info@indiaall.org y le responderemos.",
      emailHandoff: 'Correo a nuestro equipo',
      menu: 'Productos y Materiales, Presupuesto, Solicitud de Trabajo Personalizado, Transporte y Entrega, Mis Consultas, Cómo Funciona, Contacto.',
      backToMenu: 'Volver al menú',
      submitEnquiry: 'Enviar una Consulta',
    },
    pt: {
      fallback: "Não tenho uma resposta ainda para isso. Por favor, envie um e-mail ao nossa equipe em Info@indiaall.org e retornaremos o contato.",
      emailHandoff: 'E-mail nossa equipe',
      menu: 'Produtos e Material, Orçamento, Solicitação de Trabalho Personalizado, Transporte e Entrega, Minhas Consultas, Como Funciona, Contato.',
      backToMenu: 'Voltar ao menu',
      submitEnquiry: 'Enviar Consulta',
    },
  }
  const m = messages[lang] || messages.en
  return key ? (m[key] || '') : m
}

/* ── Main menu options ─────────────────────────────────────────── */
const MAIN_MENU = {
  en: 'Products & Commodities, Get a Quote, Custom Work Request, Transport & Delivery, My Enquiries, How It Works, Contact Us.',
  es: 'Productos y Materiales, Presupuesto, Solicitud de Trabajo Personalizado, Transporte y Entrega, Mis Consultas, Cómo Funciona, Contacto.',
  pt: 'Produtos e Material, Orçamento, Solicitação de Trabalho Personalizado, Transporte e Entrega, Minhas Consultas, Como Funciona, Contato.',
}

/* ── Session state tracking (per-request via conversationHistory) ──── */
function getSessionState(conversationHistory, key, defaultValue = '') {
  if (!conversationHistory || conversationHistory.length === 0) return defaultValue
  // Look for the last message from the assistant that set this state
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const msg = conversationHistory[i]
    if (msg.role === 'assistant' && msg.content) {
      // Simple state parsing: look for "state:KEY:value" pattern
      const match = msg.content.match(new RegExp(`${key}:([^\n\r]*)`, 'i'))
      if (match) return match[1].trim()
    }
  }
  return defaultValue
}

function setSessionState(conversationHistory, key, value, language) {
  // Add a hidden assistant message with the state
  // This is a simplified approach - in production, use a proper session store
  const stateEntry = `[state:${key}:${value}]`
  // We'll just return the updated conversation with the state appended
  // For now, we'll track it differently - via the caller
  return conversationHistory
}

/* ── Determine if user is B2B or B2C ───────────────────────────── */
function determineCustomerType(message, conversationHistory) {
  const lower = message.toLowerCase().trim()

  // Check explicit B2B/B2C question first
  const b2bKeywords = ['business', 'company', 'b2b', 'corporate', 'enterprise']
  const b2cKeywords = ['personally', 'personally', 'individual', 'consumer', 'retail']

  if (b2bKeywords.some((kw) => lower.includes(kw))) return 'b2b'
  if (b2cKeywords.some((kw) => lower.includes(kw))) return 'b2c'

  // Check conversation history for previously determined type
  const savedType = getSessionState(conversationHistory, 'customerType')
  if (savedType) return savedType

  // Default: if the message mentions business-related things, assume B2B
  const businessTerms = ['company', 'order', 'quote', 'bulk', 'tonnes', 'delivery']
  const hasBusinessTerms = businessTerms.some((term) => lower.includes(term))

  return hasBusinessTerms ? 'b2b' : 'b2c'
}

/* ── Check if message is a main menu request ─────────────────────── */
function isMenuRequest(trimmedLower) {
  const menuKeywords = ['menu', 'help', 'main menu', 'what can you do', 'options']
  return menuKeywords.some((kw) => trimmedLower.includes(kw))
}

/* ── Build main menu response ────────────────────────────────────── */
function buildMainMenuResponse(language) {
  return {
    response: i18n('menu', language),
    suggested: MAIN_MENU[language],
    showMenu: true,
    backToMenu: i18n('backToMenu', language),
    submitEnquiry: i18n('submitEnquiry', language),
  }
}

/* ── Product detail response ───────────────────────────────────── */
function productDetail(product, language) {
  const desc = product.description.en
  return {
    response: `**${product.name}** (${product.category})

${desc}

Origin: ${product.origin}`,
    status: 200,
  }
}

/* ── Record unanswered question in the log ─────────────────────── */
async function recordUnanswered(sanitized, language) {
  try {
    const normalized = normaliseForMatching(sanitized)
    const existing = await ChatUnanswered.findOne({
      normalizedQuestion: normalized,
      language,
      status: 'new',
    })
    if (existing) {
      await ChatUnanswered.findByIdAndUpdate(existing._id, {
        $inc: { count: 1 },
        $set: { lastSeen: new Date() },
      })
    } else {
      const entry = new ChatUnanswered({
        normalizedQuestion: normalized,
        language,
        count: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        status: 'new',
      })
      await entry.save()
    }
  } catch (e) {
    console.error('Failed to record unanswered question:', e.message)
  }
}

/* ── Express handler ───────────────────────────────────────────── */
export async function chat(req, res, next) {
  try {
    const { message, conversationHistory = [] } = req.body || {}

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'A message is required.' })
    }

    const trimmed = message.trim()
    if (trimmed.length === 0) {
      return res.status(400).json({ message: 'A message is required.' })
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      })
    }

    const language = 'en' // Will be overridden by i18n context in production
    const trimmedLower = trimmed.toLowerCase()

    // ── Step 0: Greeting / first message - show main menu ──────────
    // On first message (no conversation history), show the main menu
    if (conversationHistory.length === 0) {
      return res.status(200).json(buildMainMenuResponse(language))
    }

    // ── Step 1: Cancel check ──────────────────────────────────────
    if (
      conversationHistory &&
      conversationHistory.length > 0 &&
      conversationHistory[conversationHistory.length - 1] &&
      conversationHistory[conversationHistory.length - 1].content &&
      conversationHistory[conversationHistory.length - 1].content.trim().toLowerCase() === 'cancel'
    ) {
      // Return to main menu on cancel
      return res.status(200).json(buildMainMenuResponse(language))
    }

    // ── Step 2: "menu" or "help" request - show main menu ─────────
    if (isMenuRequest(trimmedLower)) {
      return res.status(200).json(buildMainMenuResponse(language))
    }

    // ── Step 3: Deterministic catalogue FAQ ───────────────────────
    const faqResult = handleChatMessage({
      message: trimmed,
      conversationHistory,
      language,
    })
    if (faqResult.status === 200 && faqResult.response) {
      return res.status(200).json({ response: faqResult.response })
    }

    // ── Step 3: Admin-managed FAQ entries ─────────────────────────
    const normalized = normaliseForMatching(trimmed)
    const adminAnswer = await checkAdminFaq(normalized, language)
    if (adminAnswer) {
      return res.status(200).json({ response: adminAnswer })
    }

    // ── Step 4: Fuzzy matching over catalogue products ──────────────
    const fuzzy = fuzzyProductMatch(trimmed, products, 0.55)
    if (fuzzy) {
      return res.status(200).json({ response: productDetail(fuzzy.product, language) })
    }

    // ── Step 5: B2B/B2C split for quote/custom flows ───────────────
    const customerType = determineCustomerType(trimmed, conversationHistory)

    // ── Step 6: Get a Quote flow ──────────────────────────────────
    if (
      trimmedLower.includes('quote') ||
      trimmedLower.includes('quotation') ||
      trimmedLower.includes('price') ||
      trimmedLower.includes('how much') ||
      trimmedLower.includes('cuánto') ||
      trimmedLower.includes('quanto')
    ) {
      if (customerType === 'b2b') {
        // B2B quote flow
        // Check if we're in the middle of the flow
        const b2bState = getSessionState(conversationHistory, 'b2bQuoteState')
        if (!b2bState || b2bState === 'start') {
          // Start of B2B quote flow
          const response = `Are you buying for a business or personally?

${i18n('emailHandoff', language)} ${config.supportEmail || 'Info@indiaall.org'}.

Please select:
1. Business (B2B)
2. Personal (B2C)

Or type "cancel" to abort.`
          return res.status(200).json({ response, showMenu: false })
        } else if (b2bState === 'product') {
          // After product selected, ask for quantity
          return res.status(200).json({ response: `What quantity do you need? (e.g. "500 tonnes", "100 bags")\nType "skip" to move to the next step, or "cancel" to abort.` })
        } else if (b2bState === 'quantity') {
          // After quantity, ask for destination
          return res.status(200).json({ response: `What is the destination country/city? (e.g. "Mumbai, India", "London, UK")\nType "skip" to move to the next step, or "cancel" to abort.` })
        } else if (b2bState === 'destination') {
          // After destination, ask for contact
          return res.status(200).json({ response: `What is your contact email or phone?\nType "skip" to move to the next step, or "cancel" to abort.` })
        } else if (b2bState === 'contact') {
          // Final summary
          return res.status(200).json({ response: 'Quotation summary: please review and submit the Enquiry form.' })
        }
      } else {
        // B2C quote flow
        const response = `Are you buying for a business or personally?

1. Business (B2B)
2. Personal (B2C)

Or type "cancel" to abort.`
        return res.status(200).json({ response, showMenu: false })
      }
    }

    // ── Step 7: Custom Work Request flow ────────────────────────────
    if (
      trimmedLower.includes('custom') ||
      trimmedLower.includes('personalized') ||
      trimmedLower.includes('bespoke') ||
      trimmedLower.includes('work request') ||
      trimmedLower.includes('solicitud personalizada') ||
      trimmedLower.includes('demande personnalisée')
    ) {
      // Check flow state
      const customState = getSessionState(conversationHistory, 'customWorkState')

      if (!customState || customState === 'start') {
        // Start of custom work request
        const response = `What do you need? (describe what is needed, free text, up to 1000 characters)

Type "cancel" to abort at any time.
Type "skip" to move to the next step.`
        return res.status(200).json({ response, showMenu: false })
      } else if (customState === 'description') {
        // Description received, ask for related product if any
        return res.status(200).json({ response: `Is there a related product from our catalogue? (type the name or "none")\nType "skip" to move to the next step, or "cancel" to abort.` })
      } else if (customState === 'product') {
        // Related product received, ask for quantity/scale
        return res.status(200).json({ response: `What quantity or scale are you looking for? (free text)\nType "skip" to move to the next step, or "cancel" to abort.` })
      } else if (customState === 'quantity') {
        // Quantity received, ask for destination
        return res.status(200).json({ response: `What is the destination? (city/country)\nType "skip" to move to the next step, or "cancel" to abort.` })
      } else if (customState === 'destination') {
        // Destination received, ask for timing
        return res.status(200).json({ response: `What is your desired timing? (free text, no promises)\nType "skip" to move to the next step, or "cancel" to abort.` })
      } else if (customState === 'timing') {
        // Timing received, ask for contact with consent
        return res.status(200).json({ response: `What is your contact email or phone?\nI agree to INDIA ALL processing my data to respond to this enquiry.\nType "skip" to move to the next step, or "cancel" to abort.` })
      } else if (customState === 'contact') {
        // Final summary
        return res.status(200).json({ response: 'Custom work request summary: please review and submit the Enquiry form.' })
      }
    }

    // ── Step 8: Transport & Delivery flow ─────────────────────────
    if (
      trimmedLower.includes('delivery') ||
      trimmedLower.includes('ship') ||
      trimmedLower.includes('transport') ||
      trimmedLower.includes('llegada') ||
      trimmedLower.includes('entrega') ||
      trimmedLower.includes('livraison')
    ) {
      // First, explain delivery using project-provided text
      const deliveryText = `INDIA ALL arranges transport/delivery to the buyer's designated location and does custom work. We operate in India, Brazil and Canada.

Our team will review your request and contact you to discuss sourcing and commercial terms.

Please note: we do not publish specific delivery times, ports, incoterms, or coverage areas.`

      // Then offer to collect delivery requirements
      const response = `${deliveryText}

Would you like to provide delivery requirements? I'll ask you a few questions:

1. Product (or type "none")
2. Quantity
3. Pickup/origin if known
4. Destination
5. Preferred delivery window (free text)

Type "cancel" to abort at any time.
Type "skip" to move to the next step.`

      return res.status(200).json({ response, showMenu: false })
    }

    // ── Step 9: My Enquiries (account-linked) ─────────────────────
    // Check if user is logged in - this would require checking cookies
    // For now, we'll show the sign-in message for anonymous users
    const response = `To view your enquiries, please sign in to your account.

You can access the sign-in page [here]. Alternatively, you can submit a new enquiry via the form or email Info@indiaall.org.`

    return res.status(200).json({ response, showMenu: true })

    // ── Step 10: Gemini AI fallback (optional) ────────────────────
    // Try Google Gemini AI if configured; fall back to static response if not available or on error
    let geminiResponse
    try {
      const aiResult = await geminate({
        message: trimmed,
        conversationHistory,
        timeoutMs: 15000,
      })
      geminiResponse = aiResult.response
    } catch (aiError) {
      // Gemini not configured or failed — will use static fallback below
    }

    // ── Step 10: Friendly fallback with email + log unanswered ─────
    // Record the unanswered question (strip emails/phones before saving)
    const sanitized = trimmed
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, ' [email stripped]')
      .replace(/\+\d{1,14}/g, ' [phone stripped]')
    await recordUnanswered(sanitized, language)

    const handoff = buildHandoff(language)

    // Use Gemini response if available, otherwise use static fallback
    const finalResponse = geminiResponse || buildFallbackResponse(language, handoff)

    return res.status(200).json({ response: finalResponse })
  } catch (error) {
    console.error('Chat error:', error.message)
    return res.status(500).json({ message: 'Chat service failed. Please try again later.' })
  }
}