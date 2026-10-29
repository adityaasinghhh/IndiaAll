export function validateEnquiry(req, res, next) {
  const errors = []
  const {
    name, company, email, phone, commodity, quantity, deliveryLocation, country, enquiryType, consent,
  } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required (min 2 characters)')
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    errors.push('Company is required (min 2 characters)')
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required')
  }
  if (phone && (typeof phone !== 'string' || phone.trim().length < 6)) {
    errors.push('Phone number must be at least 6 characters when provided')
  }
  if (!commodity || typeof commodity !== 'string') {
    errors.push('Commodity is required')
  }
  if (quantity !== undefined && quantity !== null && quantity !== '' && typeof quantity !== 'string') {
    errors.push('Quantity must be text')
  }
  if (country !== undefined && country !== null && country !== '' && typeof country !== 'string') {
    errors.push('Country must be text')
  }
  if (enquiryType !== undefined && enquiryType !== null && enquiryType !== '' && typeof enquiryType !== 'string') {
    errors.push('Enquiry type must be text')
  }
  if ((!deliveryLocation || typeof deliveryLocation !== 'string' || deliveryLocation.trim().length < 2) &&
      (!country || typeof country !== 'string' || country.trim().length < 2)) {
    errors.push('Delivery country or location is required')
  }
  if (consent !== true) {
    errors.push('Consent is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  next()
}

export function sanitizeEnquiry(req, res, next) {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str
    return str.replace(/[<>]/g, '').trim()
  }

  const fields = [
    'name', 'company', 'email', 'phone', 'commodity', 'quantity',
    'deliveryLocation', 'country', 'enquiryType', 'message',
  ]
  fields.forEach((field) => {
    if (req.body[field]) {
      req.body[field] = sanitize(req.body[field])
    }
  })
  next()
}

export function sanitizeBulkOrder(req, res, next) {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str
    return str.replace(/[<>]/g, '').trim()
  }

  const fields = [
    'fullName', 'company', 'email', 'phone', 'country', 'commodity',
    'otherCommodity', 'quantity', 'destination', 'message', 'packaging',
    'grade', 'deliveryTimeframe', 'incoterms', 'targetPrice', 'reference',
  ]
  fields.forEach((field) => {
    if (req.body[field]) {
      req.body[field] = sanitize(req.body[field])
    }
  })
  next()
}

export function validateBulkOrder(req, res, next) {
  const errors = []
  const {
    fullName, company, email, country, commodity, quantity, unit, destination, consent,
  } = req.body

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name is required (min 2 characters)')
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    errors.push('Company name is required (min 2 characters)')
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid business email is required')
  }
  if (!country || typeof country !== 'string' || country.trim().length < 2) {
    errors.push('Country is required')
  }
  if (!commodity || typeof commodity !== 'string') {
    errors.push('Commodity is required')
  }
  if (!quantity || typeof quantity !== 'string' || quantity.trim().length < 1) {
    errors.push('Required quantity is required')
  }
  if (!unit || typeof unit !== 'string') {
    errors.push('Unit of measurement is required')
  }
  if (!destination || typeof destination !== 'string' || destination.trim().length < 2) {
    errors.push('Destination country or delivery location is required')
  }
  if (consent !== true) {
    errors.push('Consent is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  next()
}

export function validateRegistration(req, res, next) {
  const errors = []
  const { name, company, country, phone, email, password } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name is required (min 2 characters)')
  }
  if (!company || typeof company !== 'string' || company.trim().length < 2) {
    errors.push('Company is required (min 2 characters)')
  }
  if (!country || typeof country !== 'string' || country.trim().length < 2) {
    errors.push('Country is required')
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
    errors.push('Valid phone number is required')
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required')
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push('Password must be at least 8 characters')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  next()
}

export function validateLogin(req, res, next) {
  const errors = []
  const { email, password } = req.body || {}

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required')
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors })
  }
  next()
}
