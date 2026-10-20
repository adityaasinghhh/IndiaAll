import { products } from '../../../client/src/data/products.js'

/* ── Empty input ─────────────────────────────────────────────── */

function emptyInput() {
  return {
    response: 'A message is required.',
    status: 400,
  }
}

/* ── a. Commodity list ───────────────────────────────────────── */

function listCommodities(language) {
  const categories = {}
  for (const p of products) {
    if (!categories[p.category]) {
      categories[p.category] = []
    }
    categories[p.category].push(p.name)
  }

  const categoryLabels = {
    energy: 'Energy & Materials',
    agriculture: 'Agriculture & Food',
    metals: 'Metals & Minerals',
  }

  let response = 'INDIA ALL trades the following commodities:\n\n'
  for (const [catKey, items] of Object.entries(categories)) {
    const label = categoryLabels[catKey] || catKey
    response += `- ${label}: ${items.join(', ')}\n`
  }
  response +=
    '\nPlease ask about a specific commodity for more details.'
  return { response }
}

/* ── b. Bulk order / quotation initiation ──────────────────────── */

function bulkOrderEnquiry(language) {
  const enquiryCta = {
    en: 'Submit an Enquiry',
    es: 'Submit an Enquiry',
    pt: 'Submit an Enquiry',
  }

  const email = {
    en: 'Info@indiaall.org',
    es: 'Info@indiaall.org',
    pt: 'Info@indiaall.org',
  }

  return {
    response: `To request a quotation, please ${enquiryCta[language]} ${enquiryCta[language]}. You may also email ${email[language]}.`,
    status: 200,
  }
}

/* ── c. Delivery requirements ──────────────────────────────────── */

function deliveryRequirements(language) {
  const email = {
    en: 'Info@indiaall.org',
    es: 'Info@indiaall.org',
    pt: 'Info@indiaall.org',
  }

  const response = `Delivery requirements are handled on a per-enquiry basis. Please include the product, quantity, and destination in the enquiry or email ${email[language]}. We do not publish specific delivery times, ports, incoterms, or coverage areas. Our team will review your request and contact you to discuss sourcing and commercial terms.`

  return { response, status: 200 }
}

/* ── d. Contact sales team ─────────────────────────────────────── */

function contactSalesTeam(language) {
  const email = {
    en: 'Info@indiaall.org',
    es: 'Info@indiaall.org',
    pt: 'Info@indiaall.org',
  }

  const response = `You can contact our team at ${email[language]}. Our Contact page also has additional details such as office addresses and phone numbers. Alternatively, you can fill out our Enquiry form with your product requirements and our team will get back to you.`

  return { response, status: 200 }
}

/* ── e. Product detail lookup ──────────────────────────────────── */

function normalizeName(name) {
  return name.toLowerCase().replace(/\s+/g, ' ').trim()
}

function findProductByName(query) {
  if (!query) return null
  const normalized = normalizeName(query)

  // Exact match first
  for (const product of products) {
    if (normalizeName(product.name) === normalized) {
      return product
    }
  }

  // Case-insensitive partial match (tolerate plurals & partial)
  for (const product of products) {
    const pNorm = normalizeName(product.name)
    if (pNorm.includes(normalized) || normalized.includes(pNorm)) {
      return product
    }
    // Strip trailing 's' for plural tolerance
    const pSingular = pNorm.replace(/\b(s)$/, '')
    const qSingular = normalized.replace(/\b(s)$/, '')
    if (pSingular === qSingular) {
      return product
    }
  }

  return null
}

function getDescriptionInLanguage(product, language) {
  if (language === 'es' && product.description.es) {
    return product.description.es
  }
  if (language === 'pt' && product.description.pt) {
    return product.description.pt
  }
  return product.description.en
}

function productDetail(product, language) {
  const desc = getDescriptionInLanguage(product, language)
  const origin = product.origin
  const parts = [`**${product.name}** (${product.category})`, '', desc, `Origin: ${origin}`].filter(
    (s) => s !== '' && s !== undefined
  )
  return { response: parts.join('\n\n'), status: 200 }
}

// If more than one product matches a partial query, return the matches
function ambiguousProductMatches(query) {
  const normalized = normalizeName(query)
  const matches = []

  for (const product of products) {
    const pNorm = normalizeName(product.name)
    if (
      pNorm.includes(normalized) ||
      normalized.includes(pNorm) ||
      (pNorm.replace(/\b(s)$/, '') === normalized.replace(/\b(s)$/, ''))
    ) {
      matches.push(product)
    }
  }

  return matches
}

/* ── f. Category browsing ──────────────────────────────────────── */

function listCategories(language) {
  const categories = {}
  for (const p of products) {
    if (!categories[p.category]) {
      categories[p.category] = []
    }
    categories[p.category].push(p.name)
  }

  const categoryLabels = {
    energy: 'Energy & Materials',
    agriculture: 'Agriculture & Food',
    metals: 'Metals & Minerals',
  }

  let response = 'INDIA ALL has the following categories:\n\n'
  for (const [catKey, items] of Object.entries(categories)) {
    const label = categoryLabels[catKey] || catKey
    response += `- ${label}: ${items.join(', ')}\n`
  }
  response +=
    '\nWould you like to see products in a specific category?'
  return { response }
}

function productsInCategory(categoryKey, language) {
  const categoryProducts = products.filter((p) => p.category === categoryKey)

  if (categoryProducts.length === 0) {
    return { response: 'No products found in that category.', status: 200 }
  }

  const productNames = categoryProducts.map((p) => p.name).join(', ')
  return {
    response: `These are the ${categoryKey} products: ${productNames}.`,
    status: 200,
  }
}

/* ── g. Quotation helper (pre-fill Enquiry form) ─────────────────

   Flow state is tracked using the conversation history sent back with each request.
   The steps are:
     Step 1: product (accept catalogue name or free-text; note if not in catalogue)
     Step 2: quantity (free text, e.g. "500 tonnes")
     Step 3: destination country/city
     Step 4: contact email or phone
   "cancel" at any step aborts the flow.
   "skip" moves to the next step.
   At the end, a summary is shown and the user is directed to the Enquiry form
   with query parameters ?product=<slug>&quantity=<text>&location=<text>&email=<text>&message=<text>.
   The form already supports pre-fill via searchParams.get('product') etc.
   ------------------------------------------------------------------------- */

// Encode flow state in a simple marker that travels via conversation history
const FLOW_START = '{{QUOTATION_FLOW_START}}'
const FLOW_CANCEL = '{{QUOTATION_FLOW_CANCEL}}'

function startQuotationFlow(language, initialProductRef) {
  const enquiryCta = {
    en: 'Submit an Enquiry',
    es: 'Submit an Enquiry',
    pt: 'Submit an Enquiry',
  }

  const email = {
    en: 'Info@indiaall.org',
    es: 'Info@indiaall.org',
    pt: 'Info@indiaall.org',
  }

  // Build initial state: either a product reference or "free-text"
  const productNote =
    initialProductRef && products.some((p) => normalizeName(p.name) === normalizeName(initialProductRef))
      ? ` (product "${initialProductRef}" found in catalogue)`
      : ' (free-text product name; team will note it)'

  return {
    response: `I can help you prepare a quotation enquiry. I'll ask you a few questions, one at a time.

1. Product? ${productNote}

Type the product name (e.g. "Bitumen") or type a custom name. Type "cancel" to abort at any time.`,
    status: 200,
  }
}

function handleQuotationStep(language, message, conversationHistory) {
  const trimmed = (message || '').trim()

  // Cancel at any step
  if (trimmed.toLowerCase() === 'cancel') {
    return {
      response: 'Quotation enquiry cancelled. I am here if you need help with anything else.',
      status: 200,
    }
  }

  // --- Step 1: product ---
  if (!conversationHistory || conversationHistory.length === 0) {
    // First step: looking for product name
    // Check if the message matches a known product
    const product = findProductByName(trimmed)

    if (product) {
      // Product found in catalogue - advance to step 2
      const state = { product: product.name, slug: product.slug }
      const history = [
        ...(conversationHistory || []),
        { role: 'user', content: trimmed },
      ]
      // Return step 2 response but also encode the product state for the next call
      return {
        response: `Great! I have ${product.name} (${product.category}).

2. Quantity? (e.g. "500 tonnes", "100 bags")

Type the quantity. Type "skip" to move to the next step, or "cancel" to abort.`,
        status: 200,
        // We encode the product in the response for now; the client will send
        // the conversation history back and we'll pick up the state.
        // For this server-side implementation, we'll track via history length.
      }
    }

    // Check for "show me <category>" pattern
    const lower = trimmed.toLowerCase()
    const categoryMap = { energy: 'energy', agriculture: 'agriculture', metals: 'metals' }
    for (const [catKey, catLabel] of Object.entries(categoryMap)) {
      if (lower === catLabel || lower.startsWith(catLabel + ' ')) {
        return productsInCategory(catKey, language)
      }
    }

    // Check for category list
    if (lower === 'categories' || lower === 'what categories') {
      return listCategories(language)
    }

    // Free-text product name (not in catalogue) - note it and advance
    return {
      response: `I don't have "${trimmed}" in our current catalogue, but I've noted it as a free-text product request.

2. Quantity? (e.g. "500 tonnes", "100 bags")

Type the quantity. Type "skip" to move to the next step, or "cancel" to abort.`,
      status: 200,
    }
  }

  // --- Step 2: quantity ---
  if (conversationHistory && conversationHistory.length >= 1) {
    const prevMsg = conversationHistory[conversationHistory.length - 1]
    const prevContent = prevMsg ? (prevMsg.content || '') : ''

    // If previous step was product (we got here after step 1), now ask for quantity
    // We've received the quantity - advance to step 3
    const quantity = trimmed

    // Check for skip
    if (quantity.toLowerCase() === 'skip') {
      // Move to step 3 without quantity
      return {
        response: `3. Destination country/city? (e.g. "Mumbai, India", "London, UK")

Type the destination. Type "skip" to move to the next step, or "cancel" to abort.`,
        status: 200,
      }
    }

    // Advance to step 3: destination
    return {
      response: `3. Destination country/city? (e.g. "Mumbai, India", "London, UK")

Type the destination. Type "skip" to move to the next step, or "cancel" to abort.`,
      status: 200,
    }
  }

  // --- Step 3: destination ---
  if (conversationHistory && conversationHistory.length >= 2) {
    const destination = trimmed

    // Check for skip
    if (destination.toLowerCase() === 'skip') {
      // Move to step 4 without destination
      return {
        response: `4. Contact email or phone? (e.g. "sales@company.com", "+919876543210")

Type your contact detail. Type "skip" to move to the next step, or "cancel" to abort.`,
        status: 200,
      }
    }

    // Advance to step 4: contact
    return {
      response: `4. Contact email or phone? (e.g. "sales@company.com", "+919876543210")

Type your contact detail. Type "skip" to move to the next step, or "cancel" to abort.`,
      status: 200,
    }
  }

  // --- Step 4: contact email/phone ---
  if (conversationHistory && conversationHistory.length >= 3) {
    const contact = trimmed

    // Check for skip
    if (contact.toLowerCase() === 'skip') {
      // Show summary and direct to enquiry form
      return showQuotationSummary(language, {}, {}, '', '')
    }

    // Validate email format if it looks like an email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phonePattern = /^\+[1-9]\d{1,14}$/

    let contactInfo = contact
    if (emailPattern.test(contact)) {
      contactInfo = `Email: ${contact}`
    } else if (phonePattern.test(contact)) {
      contactInfo = `Phone: ${contact}`
    }

    // Show summary and direct to enquiry form
    return showQuotationSummary(language, {}, {}, contact, trimmed)
  }

  // Fallback - shouldn't reach here
  return { response: 'Something went wrong with the quotation flow. Let\'s start over.', status: 200 }
}

// Show the quotation summary and direct to the Enquiry form with pre-fill
function showQuotationSummary(language, productData, destinationData, contact, rawContact) {
  const enquiryCta = {
    en: 'Submit an Enquiry',
    es: 'Submit an Enquiry',
    pt: 'Submit an Enquiry',
  }

  const email = {
    en: 'Info@indiaall.org',
    es: 'Info@indiaall.org',
    pt: 'Info@indiaall.org',
  }

  // Build pre-fill data based on what we have
  // The Enquiry form accepts: name, company, email, phone, commodity, quantity, location, message, consent
  const prefill = {
    commodity: productData.name || '',
    quantity: productData.quantity || destinationData.location || '',
    location: destinationData.location || '',
    message: '',
  }

  // Map product name to commodity field, quantity/location to their fields,
  // and put any remaining info into the message field
  let msg = `Quotation enquiry summary:\n`

  if (productData.name) {
    msg += `- Product: ${productData.name}\n`
  }
  if (productData.quantity) {
    msg += `- Quantity: ${productData.quantity}\n`
  }
  if (destinationData.location) {
    msg += `- Destination: ${destinationData.location}\n`
  }
  if (contact) {
    msg += `- Contact: ${contact}\n`
  }

  msg += `\nPlease review the fields below and submit the Enquiry form. The team will get back to you.`

  // Build query parameters for pre-fill
  const params = new URLSearchParams()
  if (productData.name) params.append('product', productData.slug || '')
  if (productData.quantity) params.append('quantity', productData.quantity)
  if (destinationData.location) params.append('location', destinationData.location)
  if (contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    params.append('email', contact)
  }
  // Note: the form also has name, company, message fields; those are left for the customer to fill

  return {
    response: `${msg}\n\nTo pre-fill the Enquiry form, open: /enquiry?${params.toString()}\n\nOr email us directly at ${email[language]} if you prefer.`,
    status: 200,
  }
}

/* ── Main handler — priority order ─────────────────────────────── */

export function handleChatMessage({ message, conversationHistory = [], language = 'en' }) {
  const trimmed = (message || '').trim()

  // Empty or whitespace input -> existing validation (400)
  if (!trimmed) {
    return emptyInput()
  }

  if (trimmed.length > 1000) {
    return {
      response: 'Message is too long. Maximum 1000 characters.',
      status: 400,
    }
  }

  // ── a. "What commodities does INDIA ALL supply?" ──────────────
  const commodityKeywords = ['commodity', 'commodities', 'products', 'catalogue', 'catalog', 'trade', 'supply']
  const isCommodityList = commodityKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isCommodityList) {
    return { response: listCommodities(language).response, status: 200 }
  }

  // ── b. "I need a quotation for a bulk order." ────────────────
  const bulkOrderKeywords = ['quotation', 'quote', 'bulk order', 'bulk ordering']
  const isBulkOrder = bulkOrderKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isBulkOrder) {
    return startQuotationFlow(language, null)
  }

  // ── c. "Can you help with delivery requirements?" ──────────────
  const deliveryKeywords = ['delivery', 'deliver', 'shipping']
  const isDelivery = deliveryKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isDelivery) {
    return deliveryRequirements(language)
  }

  // ── d. "How do I contact the sales team?" ─────────────────────
  const contactKeywords = ['contact', 'sales team', 'sales']
  const isContact = contactKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isContact) {
    return contactSalesTeam(language)
  }

  // ── e. Product detail lookup (case-insensitive, tolerate plurals/partial) ─────────────
  const product = findProductByName(trimmed)

  if (product) {
    // Check if there are ambiguous matches we should surface
    const matches = ambiguousProductMatches(trimmed)
    if (matches.length > 1 && matches.some((m) => m.name !== product.name)) {
      // List the matches and ask user to specify
      const matchList = matches.map((m) => `- ${m.name} (${m.category})`).join('\n')
      return {
        response: `I found multiple products matching your query. Which one were you looking for?\n\n${matchList}\n\nAlternatively, type the full product name for a specific match.`,
        status: 200,
      }
    }
    return productDetail(product, language)
  }

  // Check for ambiguous match and surface it
  const ambiguousMatches = ambiguousProductMatches(trimmed)
  if (ambiguousMatches.length > 0) {
    const matchList = ambiguousMatches
      .slice(0, 5) // limit to 5 matches
      .map((m) => `- ${m.name} (${m.category})`)
      .join('\n')
    return {
      response: `I found multiple products matching your query. Which one were you looking for?\n\n${matchList}\n\nAlternatively, type the full product name for a specific match.`,
      status: 200,
    }
  }

  // ── Check if it's a category question ─────────────────────────
  const categoryKeywords = ['category', 'categories', 'energy', 'agriculture', 'metals']
  const isCategoryQuestion = categoryKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isCategoryQuestion) {
    // Check for "show me <category>" or just category name
    const lower = trimmed.toLowerCase()
    const categoryMap = { energy: 'energy', agriculture: 'agriculture', metals: 'metals' }
    for (const [catKey, catLabel] of Object.entries(categoryMap)) {
      if (lower === catLabel) {
        return productsInCategory(catKey, language)
      }
      if (lower.startsWith(catLabel + ' ')) {
        return productsInCategory(catKey, language)
      }
    }
    // Fall back to category list
    return { response: listCategories(language).response, status: 200 }
  }

  // ── Quotation flow initiation ─────────────────────────────────
  const quotationStartKeywords = ['quotation', 'quote', 'price', 'bulk order', 'I need a quote']
  const isQuotationStart = quotationStartKeywords.some((kw) => trimmed.toLowerCase().includes(kw))

  if (isQuotationStart) {
    return startQuotationFlow(language, null)
  }

  // ── Check for "show me <category>" or category-only queries ─────
  // Already handled above, but as a catch-all
  if (trimmed.toLowerCase() === 'categories') {
    return { response: listCategories(language).response, status: 200 }
  }

  // ── 4. No FAQ matched → friendly fallback with email ────────────
  const fallbackResponses = {
    en: "I don't have an answer for that yet. Please email our team at Info@indiaall.org and we will get back to you.",
    es: "No tengo una respuesta aún para eso. Por favor, envíe un correo a nuestro equipo en Info@indiaall.org y le responderemos.",
    pt: "Não tenho uma resposta ainda para isso. Por favor, envie um e-mail ao nossa equipe em Info@indiaall.org e retornaremos o contato.",
  }

  return { response: fallbackResponses[language] || fallbackResponses.en, status: 200 }
}