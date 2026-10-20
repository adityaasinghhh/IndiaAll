const mongoose = require('mongoose')

const ChatFaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ['en', 'es', 'pt'],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

// Index for faster lookups by language and active status
ChatFaqSchema.index({ language: 1, active: 1, question: 1 })

module.exports = mongoose.model('ChatFaq', ChatFaqSchema)