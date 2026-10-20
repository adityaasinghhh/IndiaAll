import BulkOrder, { BULK_ORDER_STATUSES } from '../models/BulkOrder.js'
import Customer from '../models/Customer.js'
import { transporter } from '../config/email.js'
import { config } from '../config/env.js'
import { bulkOrderNotificationEmail, bulkOrderAutoReplyEmail } from '../utils/emailTemplates.js'
import { sanitizeString } from '../utils/validators.js'
import { searchFilter } from '../utils/search.js'
import { parsePagination } from '../utils/pagination.js'

export async function createBulkOrder(req, res, next) {
  try {
    const {
      fullName, company, email, phone, country, commodity, otherCommodity,
      quantity, unit, destination, message, packaging, grade,
      deliveryTimeframe, incoterms, targetPrice, reference, consent,
    } = req.body

    let customer = null
    if (req.cookies.customer_access_token) {
      try {
        const jwt = await import('jsonwebtoken')
        const decoded = jwt.default.verify(req.cookies.customer_access_token, config.jwt.accessSecret)
        customer = await Customer.findById(decoded.userId)
      } catch (e) {
        // Invalid token, proceed as guest
      }
    }

    const order = await BulkOrder.create({
      fullName: sanitizeString(fullName),
      company: sanitizeString(company),
      email: email.toLowerCase().trim(),
      phone: sanitizeString(phone || ''),
      country: sanitizeString(country),
      commodity: sanitizeString(commodity),
      otherCommodity: sanitizeString(otherCommodity || ''),
      quantity: sanitizeString(quantity),
      unit,
      destination: sanitizeString(destination),
      message: sanitizeString(message || ''),
      packaging: sanitizeString(packaging || ''),
      grade: sanitizeString(grade || ''),
      deliveryTimeframe: sanitizeString(deliveryTimeframe || ''),
      incoterms: sanitizeString(incoterms || ''),
      targetPrice: sanitizeString(targetPrice || ''),
      reference: sanitizeString(reference || ''),
      consent,
      consentTimestamp: new Date(),
      customer: customer ? customer._id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: config.email.recipients,
        subject: `New Custom Bulk Order: ${order.commodity === 'other' ? order.otherCommodity : order.commodity} — ${order.company}`,
        html: bulkOrderNotificationEmail(order),
      })
    } catch (emailError) {
      console.error('Failed to send bulk order notification:', emailError.message)
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: order.email,
        subject: 'We received your custom bulk order request — INDIA ALL',
        html: bulkOrderAutoReplyEmail(order, (req.body.language || req.headers['accept-language'] || 'en').split(',')[0].slice(0, 2).toLowerCase()),
      })
    } catch (emailError) {
      console.error('Failed to send bulk order auto-reply:', emailError.message)
    }

    res.status(201).json({
      message: 'Custom bulk order request submitted successfully',
      order: {
        id: order._id,
        status: order.status,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getAllBulkOrders(req, res, next) {
  try {
    const { status } = req.query
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit)

    const query = {}
    if (status) {
      if (!BULK_ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      query.status = status
    }

    const searchClause = searchFilter(req.query.search, ['fullName', 'company', 'email', 'commodity'])
    if (searchClause) query.$or = searchClause.$or

    const [orders, total] = await Promise.all([
      BulkOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
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

export async function updateBulkOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {}

    if (!BULK_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses: BULK_ORDER_STATUSES,
      })
    }

    const order = await BulkOrder.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Bulk order not found' })
    }

    order.status = status
    order.statusHistory.push({ status, createdAt: new Date() })
    await order.save()

    res.json({ message: 'Status updated', order })
  } catch (error) {
    next(error)
  }
}
