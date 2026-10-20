import mongoose from 'mongoose'

const UNIT_OPTIONS = ['mt', 'kg', 'litres', 'units', 'cbm', 'bags', 'containers', 'other']
const INCOTERM_OPTIONS = ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP', 'other']

const ORDER_STATUSES = [
  'pending',
  'in_review',
  'quoted',
  'confirmed',
  'processing',
  'sourcing',
  'ready_for_dispatch',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'closed',
]

const noteSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const bulkOrderSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    country: { type: String, required: true, trim: true, maxlength: 120 },
    commodity: { type: String, required: true, trim: true, maxlength: 200 },
    otherCommodity: { type: String, trim: true, maxlength: 300, default: '' },
    quantity: { type: String, required: true, trim: true, maxlength: 50 },
    unit: { type: String, required: true, enum: UNIT_OPTIONS },
    destination: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, trim: true, maxlength: 5000, default: '' },
    packaging: { type: String, trim: true, maxlength: 200, default: '' },
    grade: { type: String, trim: true, maxlength: 300, default: '' },
    deliveryTimeframe: { type: String, trim: true, maxlength: 100, default: '' },
    incoterms: { type: String, trim: true, maxlength: 50, default: '' },
    targetPrice: { type: String, trim: true, maxlength: 200, default: '' },
    reference: { type: String, trim: true, maxlength: 300, default: '' },
    consent: { type: Boolean, required: true },
    consentTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notes: [noteSchema],
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
)

bulkOrderSchema.index({ status: 1, createdAt: -1 })
bulkOrderSchema.index({ createdAt: -1 })
bulkOrderSchema.index({ customer: 1 })

export const BULK_ORDER_UNITS = UNIT_OPTIONS
export const BULK_ORDER_INCOTERMS = INCOTERM_OPTIONS
export const BULK_ORDER_STATUSES = ORDER_STATUSES

export default mongoose.model('BulkOrder', bulkOrderSchema)
