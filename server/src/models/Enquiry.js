import mongoose from 'mongoose'

const replySchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
)

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    commodity: { type: String, required: true },
    quantity: { type: String, trim: true, default: '' },
    deliveryLocation: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, maxlength: 100, default: '' },
    enquiryType: { type: String, trim: true, maxlength: 100, default: '' },
    message: { type: String, trim: true, maxlength: 5000 },
    consent: { type: Boolean, required: true },
    consentTimestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['new', 'in_review', 'quoted', 'closed'],
      default: 'new',
    },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    internalNotes: { type: String, trim: true, maxlength: 2000 },
    followUpDate: { type: Date, default: null },
    replies: [replySchema],
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
)

enquirySchema.index({ status: 1, createdAt: -1 })
enquirySchema.index({ createdAt: -1 })
enquirySchema.index({ customer: 1 })

export default mongoose.model('Enquiry', enquirySchema)
