import Enquiry from '../models/Enquiry.js'
import Customer from '../models/Customer.js'
import AuditLog from '../models/AuditLog.js'
import { transporter } from '../config/email.js'
import { config } from '../config/env.js'
import { enquiryNotificationEmail, enquiryAutoReplyEmail, statusUpdateEmail, escapeHtml } from '../utils/emailTemplates.js'
import { sanitizeString } from '../utils/validators.js'
import { searchFilter } from '../utils/search.js'
import { parsePagination } from '../utils/pagination.js'
import { buildCsv } from '../utils/csv.js'

export const ENQUIRY_STATUSES = ['new', 'in_review', 'quoted', 'closed']

async function logAction(req, action, targetId, details) {
  try {
    await AuditLog.create({
      admin: req.admin._id,
      action,
      targetType: 'Enquiry',
      targetId,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    })
  } catch (error) {
    console.error('Failed to write audit log:', error.message)
  }
}

export async function createEnquiry(req, res, next) {
  try {
    const { name, company, email, phone, commodity, quantity, message, consent } = req.body
    const deliveryLocation = req.body.deliveryLocation || req.body.location

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

    const enquiry = await Enquiry.create({
      name: sanitizeString(name),
      company: sanitizeString(company),
      email: email.toLowerCase().trim(),
      phone: sanitizeString(phone),
      commodity: sanitizeString(commodity),
      quantity: sanitizeString(quantity),
      deliveryLocation: sanitizeString(deliveryLocation),
      message: sanitizeString(message),
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
        subject: `New Enquiry: ${commodity} — ${company}`,
        html: enquiryNotificationEmail(enquiry),
      })
    } catch (emailError) {
      console.error('Failed to send enquiry notification:', emailError.message)
    }

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: enquiry.email,
        subject: 'We received your enquiry — INDIA ALL',
        html: enquiryAutoReplyEmail(enquiry, (req.body.language || req.headers['accept-language'] || 'en').split(',')[0].slice(0, 2).toLowerCase()),
      })
    } catch (emailError) {
      console.error('Failed to send auto-reply:', emailError.message)
    }

    res.status(201).json({
      message: 'Enquiry submitted successfully',
      enquiry: {
        id: enquiry._id,
        status: enquiry.status,
        createdAt: enquiry.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getMyEnquiries(req, res, next) {
  try {
    const enquiries = await Enquiry.find({ customer: req.customer._id })
      .sort({ createdAt: -1 })
      .select('-ipAddress -userAgent')

    res.json({ enquiries })
  } catch (error) {
    next(error)
  }
}

export async function getEnquiryById(req, res, next) {
  try {
    const enquiry = await Enquiry.findOne({
      _id: req.params.id,
      customer: req.customer._id,
    }).select('-ipAddress -userAgent')

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' })
    }

    res.json({ enquiry })
  } catch (error) {
    next(error)
  }
}

export async function getAllEnquiries(req, res, next) {
  try {
    const { status, commodity, country, from, to } = req.query
    const { page, limit, skip } = parsePagination(req.query.page, req.query.limit)

    const query = {}
    if (status) {
      if (!ENQUIRY_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      query.status = status
    }
    if (commodity) query.commodity = sanitizeString(commodity, 200)
    if (country) query.deliveryLocation = new RegExp(sanitizeString(country, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')

    if (from || to) {
      const range = {}
      const fromDate = from ? new Date(from) : null
      const toDate = to ? new Date(to) : null
      if (fromDate && !Number.isNaN(fromDate.getTime())) range.$gte = fromDate
      if (toDate && !Number.isNaN(toDate.getTime())) range.$lte = new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1)
      if (Object.keys(range).length > 0) query.createdAt = range
    }

    const searchClause = searchFilter(req.query.search, ['name', 'company', 'email', 'commodity', 'deliveryLocation'])
    if (searchClause) query.$or = searchClause.$or

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customer', 'name email company'),
      Enquiry.countDocuments(query),
    ])

    res.json({
      enquiries,
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

export async function updateEnquiryStatus(req, res, next) {
  try {
    const { status, internalNotes, followUpDate } = req.body || {}

    if (!ENQUIRY_STATUSES.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
        validStatuses: ENQUIRY_STATUSES,
      })
    }
    if (internalNotes !== undefined && (typeof internalNotes !== 'string' || internalNotes.length > 2000)) {
      return res.status(400).json({ message: 'Internal notes must be up to 2000 characters' })
    }
    if (followUpDate !== undefined && followUpDate !== null && Number.isNaN(new Date(followUpDate).getTime())) {
      return res.status(400).json({ message: 'Follow-up date must be a valid date' })
    }

    const enquiry = await Enquiry.findById(req.params.id)

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' })
    }

    const oldStatus = enquiry.status
    enquiry.status = status
    if (internalNotes !== undefined) enquiry.internalNotes = sanitizeString(internalNotes, 2000)
    if (followUpDate !== undefined) enquiry.followUpDate = followUpDate ? new Date(followUpDate) : null
    await enquiry.save()

    await logAction(req, 'enquiry_status_updated', enquiry._id, { oldStatus, newStatus: status })

    if (oldStatus !== status) {
      try {
        await transporter.sendMail({
          from: config.email.from,
          to: enquiry.email,
          subject: 'Enquiry Status Update — INDIA ALL',
          html: statusUpdateEmail(enquiry, (req.headers['accept-language'] || 'en').split(',')[0].slice(0, 2).toLowerCase()),
        })
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError.message)
      }
    }

    res.json({ message: 'Status updated', enquiry })
  } catch (error) {
    next(error)
  }
}

export async function replyToEnquiry(req, res, next) {
  try {
    const { message } = req.body || {}

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ message: 'Reply message is required' })
    }
    if (message.length > 5000) {
      return res.status(400).json({ message: 'Reply must be up to 5000 characters' })
    }

    const enquiry = await Enquiry.findById(req.params.id)

    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' })
    }

    enquiry.replies.push({
      message: sanitizeString(message, 5000),
      sentBy: req.admin._id,
    })
    await enquiry.save()
    await logAction(req, 'enquiry_replied', enquiry._id, {})

    try {
      await transporter.sendMail({
        from: config.email.from,
        to: enquiry.email,
        subject: 'Reply to your enquiry — INDIA ALL',
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0B1F3A; padding: 24px; text-align: center;">
              <h1 style="color: #D5D7D6; margin: 0; font-family: Georgia, serif;">INDIA ALL</h1>
            </div>
            <div style="padding: 32px; background: #F4F6F8;">
              <p>Dear ${escapeHtml(enquiry.name)},</p>
              <p>Regarding your enquiry for <strong>${escapeHtml(enquiry.commodity)}</strong>:</p>
              <p style="background: white; padding: 16px; border-left: 4px solid #326783;">${escapeHtml(message)}</p>
              <p>Best regards,<br><strong>INDIA ALL</strong></p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError.message)
    }

    res.json({ message: 'Reply sent', enquiry })
  } catch (error) {
    next(error)
  }
}

export async function deleteEnquiry(req, res, next) {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id)
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' })
    }

    await logAction(req, 'enquiry_deleted', enquiry._id, { commodity: enquiry.commodity, email: enquiry.email })

    res.json({ message: 'Enquiry deleted' })
  } catch (error) {
    next(error)
  }
}

export async function exportEnquiriesCSV(req, res, next) {
  try {
    const { status, from, to } = req.query
    const query = {}

    if (status) {
      if (!ENQUIRY_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' })
      }
      query.status = status
    }
    if (from || to) {
      const range = {}
      const fromDate = from ? new Date(from) : null
      const toDate = to ? new Date(to) : null
      if (fromDate && !Number.isNaN(fromDate.getTime())) range.$gte = fromDate
      if (toDate && !Number.isNaN(toDate.getTime())) range.$lte = new Date(toDate.getTime() + 24 * 60 * 60 * 1000 - 1)
      if (Object.keys(range).length > 0) query.createdAt = range
    }

    const enquiries = await Enquiry.find(query).sort({ createdAt: -1 }).limit(5000)

    // Internal notes and reply threads are deliberately excluded from exports.
    const headers = ['Date', 'Name', 'Company', 'Email', 'Phone', 'Commodity', 'Quantity', 'Location', 'Status']
    const rows = enquiries.map((e) => [
      new Date(e.createdAt).toISOString(),
      e.name,
      e.company,
      e.email,
      e.phone,
      e.commodity,
      e.quantity,
      e.deliveryLocation,
      e.status,
    ])

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="enquiries.csv"')
    res.send(buildCsv(headers, rows))
  } catch (error) {
    next(error)
  }
}
