import Admin from '../models/Admin.js'
import Customer from '../models/Customer.js'
import Enquiry from '../models/Enquiry.js'
import BulkOrder, { BULK_ORDER_STATUSES } from '../models/BulkOrder.js'
import Product from '../models/Product.js'
import AuditLog from '../models/AuditLog.js'
import { generateAdminAccessToken, generateAdminRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import { generateOtpCode, hashOtp, isOtpExpired, OTP_PURPOSES, validateOtp } from '../utils/otp.js'
import { config } from '../config/env.js'
import { isValidEmail, sanitizeString } from '../utils/validators.js'
import { parsePagination } from '../utils/pagination.js'
import { escapeRegExp, searchFilter } from '../utils/search.js'
import { buildCsv } from '../utils/csv.js'
import { transporter } from '../config/email.js'
import { emailOtpEmail } from '../utils/emailTemplates.js'
import {
  verifyTotpCode,
  decryptSecret,
  hashRecoveryCode,
  issueMfaChallenge,
  verifyMfaChallenge,
  mfaEncryptionAvailable,
} from '../utils/mfa.js'

export const ENQUIRY_STATUSES = ['new', 'in_review', 'quoted', 'closed']

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
}

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const testMode = () => config.nodeEnv === 'test'

function publicAdmin(admin) {
  return { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
}

function subjectFor(purpose) {
  if (purpose === OTP_PURPOSES.ADMIN_LOGIN) return 'Your administrator sign-in code'
  if (purpose === OTP_PURPOSES.PASSWORD) return 'Your INDIA ALL password code'
  return 'Your email verification code'
}

/**
 * Build a Mongo date filter from untrusted ?from / ?to query params.
 * Invalid values are ignored so a bad request can never break a report.
 */
function dateRangeFilter(fromRaw, toRaw, field = 'createdAt') {
  const filter = {}
  const from = fromRaw ? new Date(fromRaw) : null
  const to = toRaw ? new Date(toRaw) : null

  if (from && !Number.isNaN(from.getTime())) filter.$gte = from
  if (to && !Number.isNaN(to.getTime())) filter.$lte = new Date(to.getTime() + 24 * 60 * 60 * 1000 - 1)

  return Object.keys(filter).length > 0 ? { [field]: filter } : {}
}

async function logAction(req, action, targetType, targetId, details) {
  try {
    await AuditLog.create({
      admin: req.admin._id,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })
  } catch (error) {
    console.error('Failed to write audit log:', error.message)
  }
}

// ---------------------------------------------------------------------------
// Authentication / session
// ---------------------------------------------------------------------------

/**
 * Issue the one-time password code used by the logged-in password change
 * flow. The code is emailed to the administrator's registered address.
 */
export async function requestAdminPasswordOtp(req, res, next) {
  try {
    const admin = req.admin

    const code = await sendPasswordOtpForAdmin(admin)

    res.json({
      message: 'A verification code has been sent to your email.',
      // Test builds only; never present outside test mode.
      ...(testMode() && code ? { otpCode: code } : {}),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Issue a fresh one-time code for the logged-in administrator password
 * change flow.
 */
async function sendPasswordOtpForAdmin(admin) {
  const code = generateOtpCode()

  admin.otp = {
    purpose: OTP_PURPOSES.PASSWORD,
    hash: hashOtp(code),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    consumed: false,
    issuedAt: new Date(),
  }
  await admin.save()

  return testMode() ? code : undefined
}

/**
 * Issue a fresh one-time code for an administrator sign-in.
 */
async function sendAdminLoginOtp(admin) {
  const code = generateOtpCode()

  admin.otp = {
    purpose: OTP_PURPOSES.ADMIN_LOGIN,
    hash: hashOtp(code),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    attempts: 0,
    consumed: false,
    issuedAt: new Date(),
  }
  await admin.save()

  let delivered = true
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: admin.email,
      subject: subjectFor(OTP_PURPOSES.ADMIN_LOGIN),
      html: emailOtpEmail(admin.name, code, OTP_PURPOSES.ADMIN_LOGIN),
    })
    console.log(`[Admin OTP] Email sent to ${admin.email}`)
  } catch (error) {
    console.error('Failed to send admin OTP email:', error.message)
    delivered = false
  }

  console.log(`[Admin OTP] Admin: ${admin.email}, delivered: ${delivered}`)

  return { code, delivered }
}

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {}

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' })
    }
    if (!password || typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ message: 'Password is required' })
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() })
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (admin.isLocked()) {
      return res.status(423).json({ message: 'Account is temporarily locked' })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      await admin.incrementLoginAttempts()
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (admin.suspended) {
      return res.status(403).json({ message: 'Account has been suspended' })
    }

    // Password is correct. Decide the second factor:
    // - If the admin has TOTP enrolled, issue an MFA challenge (TOTP or recovery code).
    // - Otherwise, fall back to email OTP.
    if (admin.twoFactorEnabled && mfaEncryptionAvailable()) {
      const { challengeId, userId } = await issueMfaChallenge(admin)
      return res.status(200).json({
        message: 'MFA verification required.',
        requiresMfa: true,
        userId,
        challengeId,
      })
    }

    // The password is correct, so issue a one-time sign-in code. Access is
    // only granted after that code is verified — no session cookies are
    // issued here.
    const { code, delivered } = await sendAdminLoginOtp(admin)

    if (!delivered) {
      return res.status(502).json({
        message: 'Failed to send verification email. Please try again later.',
      })
    }

    res.status(200).json({
      message: 'A verification code was sent. Enter it to finish signing in.',
      requiresOtp: true,
      adminId: admin._id,
      // Test builds only; never present outside test mode.
      ...(testMode() && code ? { otpCode: code } : {}),
    })
  } catch (error) {
    next(error)
  }
}

export async function verifyAdminLoginOtp(req, res, next) {
  try {
    const { adminId, otp } = req.body || {}

    if (!adminId || typeof otp !== 'string' || otp.length < 1) {
      return res.status(400).json({ message: 'A verification code is required' })
    }

    const admin = await Admin.findById(adminId)
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const doc = admin.otp
    const state = validateOtp(doc, OTP_PURPOSES.ADMIN_LOGIN)
    if (!state.ok) {
      return res.status(400).json({ message: 'Invalid or expired verification code' })
    }

    const expectedHash = hashOtp(otp)
    if (doc.hash !== expectedHash) {
      // Increment the failed-attempt counter atomically.
      await Admin.updateOne({ _id: admin._id }, { $inc: { 'otp.attempts': 1 } })
      return res.status(401).json({ message: 'The verification code is incorrect' })
    }

    // Single-use consumption: the atomic update only matches while the code
    // has not been consumed yet.
    const verified = await Admin.findOneAndUpdate(
      { _id: admin._id, 'otp.hash': expectedHash, 'otp.consumed': false },
      { $set: { 'otp.consumed': true } },
      { new: true },
    )
    if (!verified) {
      return res.status(400).json({ message: 'Invalid or expired verification code' })
    }

    const accessToken = generateAdminAccessToken(verified._id, verified.sessionVersion)
    const refreshToken = generateAdminRefreshToken(verified._id)

    verified.refreshTokens.push({ token: refreshToken })
    if (verified.refreshTokens.length > 5) {
      verified.refreshTokens = verified.refreshTokens.slice(-5)
    }
    verified.loginAttempts = 0
    verified.lockUntil = undefined
    await verified.save()

    res.cookie('admin_access_token', accessToken, cookieOptions)
    res.cookie('admin_refresh_token', refreshToken, refreshCookieOptions)

    res.json({ message: 'Login successful', admin: publicAdmin(verified) })
  } catch (error) {
    next(error)
  }
}

export async function verifyAdminMfa(req, res, next) {
  try {
    const { userId, challengeId, token } = req.body || {}

    if (!userId || !challengeId || typeof token !== 'string') {
      return res.status(400).json({ message: 'User ID, challenge ID, and verification code are required.' })
    }

    const result = await verifyMfaChallenge(Admin, userId, challengeId, token)
    if (!result.ok) {
      if (result.reason === 'invalid_or_expired_challenge') {
        return res.status(400).json({ message: 'MFA challenge is invalid or has expired.' })
      }
      return res.status(401).json({ message: 'Invalid verification code.' })
    }

    const admin = result.user

    const accessToken = generateAdminAccessToken(admin._id, admin.sessionVersion)
    const refreshToken = generateAdminRefreshToken(admin._id)

    admin.refreshTokens.push({ token: refreshToken })
    if (admin.refreshTokens.length > 5) {
      admin.refreshTokens = admin.refreshTokens.slice(-5)
    }
    admin.loginAttempts = 0
    admin.lockUntil = undefined
    await admin.save()

    res.cookie('admin_access_token', accessToken, cookieOptions)
    res.cookie('admin_refresh_token', refreshToken, refreshCookieOptions)

    res.json({ message: 'Login successful', admin: publicAdmin(admin) })
  } catch (error) {
    next(error)
  }
}

export async function getAdminSession(req, res, next) {
  try {
    // req.admin is attached by authenticateAdmin; reaching here means the
    // access token is valid and the admin exists.
    res.json({ admin: publicAdmin(req.admin) })
  } catch (error) {
    next(error)
  }
}

export async function refreshAdminToken(req, res, next) {
  try {
    const refreshToken = req.cookies.admin_refresh_token
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' })
    }

    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    const admin = await Admin.findById(decoded.adminId)
    if (!admin || !admin.refreshTokens.some((entry) => entry.token === refreshToken)) {
      return res.status(401).json({ message: 'Refresh token is no longer valid' })
    }

    // Rotate the refresh token: the presented token is removed and a new one
    // is issued, so a stolen token cannot be replayed. Pull from both the
    // database and the in-memory document so the subsequent save() cannot
    // re-persist the old token.
    await Admin.findByIdAndUpdate(admin._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    })
    admin.refreshTokens = admin.refreshTokens.filter((entry) => entry.token !== refreshToken)

    const accessToken = generateAdminAccessToken(admin._id, admin.sessionVersion)
    const nextRefreshToken = generateAdminRefreshToken(admin._id)

    admin.refreshTokens.push({ token: nextRefreshToken })
    if (admin.refreshTokens.length > 5) {
      admin.refreshTokens = admin.refreshTokens.slice(-5)
    }
    await admin.save()

    res.cookie('admin_access_token', accessToken, cookieOptions)
    res.cookie('admin_refresh_token', nextRefreshToken, refreshCookieOptions)

    res.json({ message: 'Session refreshed', admin: publicAdmin(admin) })
  } catch (error) {
    next(error)
  }
}

export async function adminLogout(req, res, next) {
  try {
    const refreshToken = req.cookies.admin_refresh_token
    if (req.admin) {
      // Bump the session version so the (stateless) access token stops being
      // accepted immediately, and drop the presented refresh token.
      await Admin.findByIdAndUpdate(req.admin._id, {
        $inc: { sessionVersion: 1 },
        ...(refreshToken ? { $pull: { refreshTokens: { token: refreshToken } } } : {}),
      })
    }

    res.clearCookie('admin_access_token')
    res.clearCookie('admin_refresh_token')
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Admin profile & password
// ---------------------------------------------------------------------------

export async function updateAdminProfile(req, res, next) {
  try {
    const admin = req.admin
    const { name, email } = req.body || {}

    if (name !== undefined) {
      const clean = sanitizeString(name, 100)
      if (clean.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' })
      }
      admin.name = clean
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'A valid email is required' })
      }
      const existing = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } })
      if (existing) {
        return res.status(409).json({ message: 'Another admin already uses this email' })
      }
      admin.email = email.toLowerCase()
    }

    await admin.save()
    await logAction(req, 'admin_profile_updated', 'Admin', admin._id, {
      name: admin.name,
      email: admin.email,
    })

    res.json({ message: 'Profile updated', admin: publicAdmin(admin) })
  } catch (error) {
    next(error)
  }
}

export async function changeAdminPassword(req, res, next) {
  try {
    const admin = req.admin
    const { currentPassword, newPassword, otp } = req.body || {}

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ message: 'Current password is required' })
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' })
    }
    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ message: 'A verification code is required' })
    }

    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    const doc = admin.otp
    const state = validateOtp(doc, OTP_PURPOSES.PASSWORD)
    if (!state.ok) {
      return res.status(400).json({ message: 'A valid verification code is required' })
    }

    const expectedHash = hashOtp(otp)
    if (doc.hash !== expectedHash) {
      // Increment the failed-attempt counter atomically.
      await Admin.updateOne({ _id: admin._id }, { $inc: { 'otp.attempts': 1 } })
      return res.status(401).json({ message: 'The verification code is incorrect' })
    }

    // Single-use consumption: the atomic update only matches while the code
    // has not been consumed yet.
    const verified = await Admin.findOneAndUpdate(
      { _id: admin._id, 'otp.hash': expectedHash, 'otp.consumed': false },
      { $set: { 'otp.consumed': true } },
      { new: true },
    )
    if (!verified) {
      return res.status(400).json({ message: 'A valid verification code is required' })
    }

    verified.password = newPassword
    // Revoke every existing refresh token and invalidate all access tokens.
    verified.refreshTokens = []
    verified.sessionVersion += 1
    await verified.save()

    res.clearCookie('admin_access_token')
    res.clearCookie('admin_refresh_token')

    await logAction(req, 'admin_password_changed', 'Admin', admin._id, {})

    res.json({ message: 'Password changed successfully. Please log in again.' })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboard(req, res, next) {
  try {
    const range = dateRangeFilter(req.query.from, req.query.to)
    const now = new Date()

    // Enquiry metrics
    const [
      totalEnquiries,
      newEnquiries,
      inReviewEnquiries,
      quotedEnquiries,
      closedEnquiries,
      totalCustomers,
      newCustomersThisMonth,
    ] = await Promise.all([
      Enquiry.countDocuments(range),
      Enquiry.countDocuments({ ...range, status: 'new' }),
      Enquiry.countDocuments({ ...range, status: 'in_review' }),
      Enquiry.countDocuments({ ...range, status: 'quoted' }),
      Enquiry.countDocuments({ ...range, status: 'closed' }),
      Customer.countDocuments(),
      Customer.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } }),
    ])

    // Bulk order metrics
    const [
      totalOrders,
      newOrders,
      inReviewOrders,
      quotedOrders,
      confirmedOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
    ] = await Promise.all([
      BulkOrder.countDocuments(range),
      BulkOrder.countDocuments({ ...range, status: 'pending' }),
      BulkOrder.countDocuments({ ...range, status: 'in_review' }),
      BulkOrder.countDocuments({ ...range, status: 'quoted' }),
      BulkOrder.countDocuments({ ...range, status: 'confirmed' }),
      BulkOrder.countDocuments({
        ...range,
        status: { $in: ['processing', 'sourcing', 'ready_for_dispatch', 'shipped', 'delivered'] },
      }),
      BulkOrder.countDocuments({ ...range, status: 'completed' }),
      BulkOrder.countDocuments({ ...range, status: { $in: ['cancelled', 'closed'] } }),
    ])

    // Product metrics
    const [totalProducts, visibleProducts] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ visible: true }),
    ])

    // Recent activity
    const [recentOrders, recentEnquiries, recentCustomers, recentActivity] = await Promise.all([
      BulkOrder.find().sort({ createdAt: -1 }).limit(5),
      Enquiry.find().sort({ createdAt: -1 }).limit(5),
      Customer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name company email country createdAt'),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('admin', 'name email'),
    ])

    // Order trend (last 6 months, or within the requested range)
    const hasRange = Object.keys(range).length > 0
    const trendStart = hasRange && range.createdAt?.$gte
      ? range.createdAt.$gte
      : new Date(now.getFullYear(), now.getMonth() - 5, 1)
    const ordersByMonth = await BulkOrder.aggregate([
      { $match: { createdAt: { $gte: trendStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    res.json({
      range: hasRange
        ? { from: range.createdAt?.$gte?.toISOString() || null, to: range.createdAt?.$lte?.toISOString() || null }
        : null,
      enquiries: {
        total: totalEnquiries,
        new: newEnquiries,
        inReview: inReviewEnquiries,
        quoted: quotedEnquiries,
        closed: closedEnquiries,
      },
      orders: {
        total: totalOrders,
        new: newOrders,
        inReview: inReviewOrders,
        quoted: quotedOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
      },
      products: {
        total: totalProducts,
        visible: visibleProducts,
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersThisMonth,
      },
      recentOrders,
      recentEnquiries,
      recentCustomers,
      recentActivity,
      ordersByMonth,
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Bulk orders
// ---------------------------------------------------------------------------

const ORDER_SORT_FIELDS = new Set(['createdAt', 'status', 'company', 'fullName', 'commodity'])

export async function getBulkOrders(req, res, next) {
  try {
    const { status, search, sort = 'createdAt', order = 'desc', from, to } = req.query
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit)

    const query = { ...dateRangeFilter(from, to) }
    if (status) {
      if (!BULK_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      query.status = status
    }
    const searchClause = searchFilter(search, ['fullName', 'company', 'email', 'commodity', 'reference', 'destination'])
    if (searchClause) query.$or = searchClause.$or

    const sortField = ORDER_SORT_FIELDS.has(sort) ? sort : 'createdAt'
    const sortDir = order === 'asc' ? 1 : -1

    const [orders, total] = await Promise.all([
      BulkOrder.find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .populate('notes.sentBy', 'name email'),
      BulkOrder.countDocuments(query),
    ])

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getBulkOrderById(req, res, next) {
  try {
    const order = await BulkOrder.findById(req.params.id)
      .populate('notes.sentBy', 'name email')
      .populate('statusHistory.changedBy', 'name email')
      .populate('customer', 'name email company')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    res.json({ order })
  } catch (error) {
    next(error)
  }
}

export async function updateBulkOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body || {}

    if (!BULK_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses: BULK_ORDER_STATUSES,
      })
    }
    if (note !== undefined && (typeof note !== 'string' || note.length > 2000)) {
      return res.status(400).json({ message: 'Note must be up to 2000 characters' })
    }

    const order = await BulkOrder.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    const oldStatus = order.status
    order.status = status

    order.statusHistory.push({
      status,
      changedBy: req.admin._id,
    })

    if (note) {
      order.notes.push({
        message: `Status changed from ${oldStatus} to ${status}: ${sanitizeString(note, 2000)}`,
        sentBy: req.admin._id,
      })
    }

    await order.save()
    await logAction(req, 'order_status_updated', 'BulkOrder', order._id, {
      oldStatus,
      newStatus: status,
    })

    res.json({ message: 'Status updated', order })
  } catch (error) {
    next(error)
  }
}

export async function addBulkOrderNote(req, res, next) {
  try {
    const { message } = req.body || {}

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Note message is required' })
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Note must be up to 2000 characters' })
    }

    const order = await BulkOrder.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.notes.push({
      message: sanitizeString(message, 2000),
      sentBy: req.admin._id,
    })

    await order.save()
    await logAction(req, 'order_note_added', 'BulkOrder', order._id, {})

    res.json({ message: 'Note added', order })
  } catch (error) {
    next(error)
  }
}

export async function exportBulkOrdersCSV(req, res, next) {
  try {
    const { status, from, to } = req.query
    const query = { ...dateRangeFilter(from, to) }
    if (status) {
      if (!BULK_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      query.status = status
    }

    const orders = await BulkOrder.find(query).sort({ createdAt: -1 }).limit(5000)

    const headers = ['Date', 'Name', 'Company', 'Email', 'Commodity', 'Quantity', 'Unit', 'Destination', 'Status', 'Reference']
    const rows = orders.map((o) => [
      new Date(o.createdAt).toISOString(),
      o.fullName,
      o.company,
      o.email,
      o.commodity === 'other' ? o.otherCommodity : o.commodity,
      o.quantity,
      o.unit,
      o.destination,
      o.status,
      o.reference,
    ])

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="bulk-orders.csv"')
    res.send(buildCsv(headers, rows))
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORIES = ['energy', 'agriculture', 'metals']

function validateProductInput(body, { partial = false } = {}) {
  const errors = []
  const { name, slug, category, description, image, origin, order, visible } = body || {}

  if (!partial || name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Product name is required (min 2 characters)')
    }
  }
  if (!partial || slug !== undefined) {
    if (!slug || typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Slug must be lowercase letters, numbers and hyphens (e.g. crude-oil)')
    }
  }
  if (!partial || category !== undefined) {
    if (!PRODUCT_CATEGORIES.includes(category)) {
      errors.push(`Category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`)
    }
  }
  if (!partial || description !== undefined) {
    if (!description || typeof description !== 'object') {
      errors.push('Description object is required')
    } else {
      if (typeof description.en !== 'string' || description.en.trim().length < 10) {
        errors.push('An English description of at least 10 characters is required')
      }
      // The catalogue is trilingual; the model requires Spanish and Portuguese too.
      if (!partial) {
        if (typeof description.es !== 'string' || description.es.trim().length === 0) {
          errors.push('A Spanish description is required')
        }
        if (typeof description.pt !== 'string' || description.pt.trim().length === 0) {
          errors.push('A Portuguese description is required')
        }
      }
    }
  }
  if (image !== undefined && image !== '' && typeof image === 'string') {
    if (!/^(https?:\/\/|\/)/.test(image)) {
      errors.push('Image must be an absolute URL (https://…) or a site-relative path (/…)')
    }
  }
  if (origin !== undefined && origin !== '' && (typeof origin !== 'string' || origin.length > 200)) {
    errors.push('Origin must be up to 200 characters')
  }
  if (order !== undefined && order !== '' && (!Number.isFinite(Number(order)) || Number(order) < 0)) {
    errors.push('Order must be a non-negative number')
  }
  if (visible !== undefined && typeof visible !== 'boolean') {
    errors.push('Visible must be a boolean')
  }

  return errors
}

export async function getProductsAdmin(req, res, next) {
  try {
    const { search, category, visibility, from, to } = req.query
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit, { defaultLimit: 50 })

    const query = { ...dateRangeFilter(from, to) }
    if (category) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({ message: 'Invalid category filter' })
      }
      query.category = category
    }
    if (visibility === 'visible') query.visible = true
    if (visibility === 'hidden') query.visible = false
    const searchClause = searchFilter(search, ['name', 'slug'])
    if (searchClause) query.$or = searchClause.$or

    const [products, total] = await Promise.all([
      Product.find(query).sort({ order: 1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ])

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function createProductAdmin(req, res, next) {
  try {
    const errors = validateProductInput(req.body)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors })
    }

    const { name, slug, category, description, image, origin, order, visible } = req.body

    const existing = await Product.findOne({ slug: slug.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Product with this slug already exists' })
    }

    const product = await Product.create({
      name: sanitizeString(name, 100),
      slug: slug.toLowerCase(),
      category,
      description: {
        en: sanitizeString(description.en, 5000),
        es: sanitizeString(description.es || '', 5000),
        pt: sanitizeString(description.pt || '', 5000),
      },
      image: sanitizeString(image || ''),
      origin: sanitizeString(origin || '', 200),
      order: parseInt(order, 10) || 0,
      visible: visible !== false,
    })

    await logAction(req, 'product_created', 'Product', product._id, {
      name: product.name,
      slug: product.slug,
    })

    res.status(201).json({ message: 'Product created', product })
  } catch (error) {
    next(error)
  }
}

export async function updateProductAdmin(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const errors = validateProductInput(req.body, { partial: true })
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors })
    }

    const { name, slug, category, description, image, origin, order, visible } = req.body

    if (name !== undefined) product.name = sanitizeString(name, 100)
    if (slug !== undefined) product.slug = slug.toLowerCase()
    if (category !== undefined) product.category = category
    if (description !== undefined) {
      if (description.en !== undefined) product.description.en = sanitizeString(description.en, 5000)
      if (description.es !== undefined) product.description.es = sanitizeString(description.es, 5000)
      if (description.pt !== undefined) product.description.pt = sanitizeString(description.pt, 5000)
    }
    if (image !== undefined) product.image = sanitizeString(image, 500)
    if (origin !== undefined) product.origin = sanitizeString(origin, 200)
    if (order !== undefined) product.order = parseInt(order, 10) || 0
    if (visible !== undefined) product.visible = visible

    await product.save()
    await logAction(req, 'product_updated', 'Product', product._id, {
      name: product.name,
      slug: product.slug,
    })

    res.json({ message: 'Product updated', product })
  } catch (error) {
    next(error)
  }
}

export async function deleteProductAdmin(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    await logAction(req, 'product_deleted', 'Product', product._id, {
      name: product.name,
      slug: product.slug,
    })

    res.json({ message: 'Product deleted' })
  } catch (error) {
    next(error)
  }
}

export async function exportProductsCSV(req, res, next) {
  try {
    const products = await Product.find().sort({ order: 1 }).limit(5000)

    const headers = ['Name', 'Slug', 'Category', 'Origin', 'Visible', 'Order', 'Description (EN)', 'Created']
    const rows = products.map((p) => [
      p.name,
      p.slug,
      p.category,
      p.origin,
      p.visible ? 'yes' : 'no',
      p.order,
      p.description?.en || '',
      new Date(p.createdAt).toISOString(),
    ])

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
    res.send(buildCsv(headers, rows))
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function getCustomers(req, res, next) {
  try {
    const { search, status, from, to } = req.query
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit)

    const query = { ...dateRangeFilter(from, to) }
    if (status === 'active') query.suspended = false
    if (status === 'suspended') query.suspended = true
    if (status === 'unverified') query.isEmailVerified = false
    const searchClause = searchFilter(search, ['name', 'email', 'company', 'country'])
    if (searchClause) query.$or = searchClause.$or

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshTokens -emailVerificationToken -passwordResetToken'),
      Customer.countDocuments(query),
    ])

    res.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const customer = await Customer.findById(req.params.id).select(
      '-password -refreshTokens -emailVerificationToken -passwordResetToken'
    )

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    const [orders, enquiries] = await Promise.all([
      BulkOrder.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(50),
      Enquiry.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(50),
    ])

    res.json({
      customer,
      orders,
      enquiries,
      stats: { orders: orders.length, enquiries: enquiries.length },
    })
  } catch (error) {
    next(error)
  }
}

export async function updateCustomerStatus(req, res, next) {
  try {
    const { suspended } = req.body || {}

    if (typeof suspended !== 'boolean') {
      return res.status(400).json({ message: 'A boolean "suspended" value is required' })
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, { suspended }, { new: true }).select(
      '-password -refreshTokens -emailVerificationToken -passwordResetToken'
    )

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    await logAction(req, suspended ? 'customer_suspended' : 'customer_reactivated', 'Customer', customer._id, {})

    res.json({ message: 'Customer updated', customer })
  } catch (error) {
    next(error)
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    await logAction(req, 'customer_deleted', 'Customer', customer._id, {
      email: customer.email,
    })

    res.json({ message: 'Customer deleted' })
  } catch (error) {
    next(error)
  }
}

export async function exportCustomersCSV(req, res, next) {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5000)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')

    const headers = ['Name', 'Company', 'Email', 'Phone', 'Country', 'Email Verified', 'Suspended', 'Joined']
    const rows = customers.map((c) => [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.country,
      c.isEmailVerified ? 'yes' : 'no',
      c.suspended ? 'yes' : 'no',
      new Date(c.createdAt).toISOString(),
    ])

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"')
    res.send(buildCsv(headers, rows))
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Audit logs & admin management
// ---------------------------------------------------------------------------

export async function getAuditLogs(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit, { defaultLimit: 50 })

    const [logs, total] = await Promise.all([
      AuditLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('admin', 'name email'),
      AuditLog.countDocuments(),
    ])

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    })
  } catch (error) {
    next(error)
  }
}

const ADMIN_ROLES = ['owner', 'editor', 'viewer']

export async function createAdmin(req, res, next) {
  try {
    const { name, email, password, role = 'editor' } = req.body || {}

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required (min 2 characters)' })
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required' })
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${ADMIN_ROLES.join(', ')}` })
    }

    const existing = await Admin.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'Admin with this email already exists' })
    }

    const admin = await Admin.create({ name: sanitizeString(name, 100), email: email.toLowerCase(), password, role })

    await logAction(req, 'admin_created', 'Admin', admin._id, {
      name: admin.name,
      email: admin.email,
      role: admin.role,
    })

    res.status(201).json({
      message: 'Admin created',
      admin: publicAdmin(admin),
    })
  } catch (error) {
    next(error)
  }
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

/**
 * Database-backed operational reports. All metrics are aggregated in MongoDB;
 * collections are never loaded into application memory for counting.
 */
export async function getReports(req, res, next) {
  try {
    const range = dateRangeFilter(req.query.from, req.query.to)
    const hasRange = Object.keys(range).length > 0
    const createdAt = range.createdAt || {}

    const monthKey = (date) => {
      const d = new Date(date)
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    }

    const [
      orderTotals,
      enquiryTotals,
      customerTotals,
      ordersByStatus,
      enquiriesByStatus,
      ordersByMonth,
      enquiriesByMonth,
      customersByMonth,
      ordersByCommodity,
      conversionAgg,
    ] = await Promise.all([
      BulkOrder.aggregate([
        { $match: range },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $in: ['$status', ['cancelled', 'closed']] }, 1, 0] } },
          },
        },
      ]),
      Enquiry.aggregate([
        { $match: range },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            withCustomer: { $sum: { $cond: [{ $ne: ['$customer', null] }, 1, 0] } },
          },
        },
      ]),
      Customer.aggregate([{ $match: range }, { $count: 'total' }]),
      BulkOrder.aggregate([{ $match: range }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Enquiry.aggregate([{ $match: range }, { $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      BulkOrder.aggregate([
        { $match: range },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Enquiry.aggregate([
        { $match: range },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Customer.aggregate([
        { $match: range },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      BulkOrder.aggregate([
        { $match: { ...range, commodity: { $ne: 'other' } } },
        { $group: { _id: '$commodity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      // Enquiry → order conversion, linked through the shared customer record.
      // Only enquiries that reference a registered customer AND whose customer
      // has at least one bulk order are counted as converted.
      Enquiry.aggregate([
        { $match: { ...range, customer: { $ne: null } } },
        {
          $lookup: {
            from: 'bulkorders',
            localField: 'customer',
            foreignField: 'customer',
            as: 'customerOrders',
          },
        },
        {
          $group: {
            _id: null,
            enquiriesWithAccount: { $sum: 1 },
            converted: { $sum: { $cond: [{ $gt: [{ $size: '$customerOrders' }, 0] }, 1, 0] } },
          },
        },
      ]),
    ])

    // Map commodity slugs to catalogue products for friendly names.
    const slugs = ordersByCommodity.map((entry) => entry._id)
    const products = await Product.find({ slug: { $in: slugs } }).select('name slug category')
    const productBySlug = new Map(products.map((p) => [p.slug, p]))

    const conversion = conversionAgg[0] || { enquiriesWithAccount: 0, converted: 0 }

    res.json({
      range: hasRange ? { from: createdAt.$gte?.toISOString() || null, to: createdAt.$lte?.toISOString() || null } : null,
      totals: {
        orders: orderTotals[0]?.total || 0,
        completedOrders: orderTotals[0]?.completed || 0,
        cancelledOrders: orderTotals[0]?.cancelled || 0,
        enquiries: enquiryTotals[0]?.total || 0,
        customers: customerTotals[0]?.total || 0,
        enquiriesWithAccount: conversion.enquiriesWithAccount,
        convertedEnquiries: conversion.converted,
      },
      ordersByStatus: ordersByStatus.map((entry) => ({ status: entry._id, count: entry.count })),
      enquiriesByStatus: enquiriesByStatus.map((entry) => ({ status: entry._id, count: entry.count })),
      ordersByMonth: ordersByMonth.map((entry) => ({ month: entry._id, count: entry.count })),
      enquiriesByMonth: enquiriesByMonth.map((entry) => ({ month: entry._id, count: entry.count })),
      customersByMonth: customersByMonth.map((entry) => ({ month: entry._id, count: entry.count })),
      productPerformance: ordersByCommodity.map((entry) => {
        const product = productBySlug.get(entry._id)
        return {
          slug: entry._id,
          name: product?.name || entry._id,
          category: product?.category || null,
          orders: entry.count,
        }
      }),
    })
  } catch (error) {
    next(error)
  }
}
