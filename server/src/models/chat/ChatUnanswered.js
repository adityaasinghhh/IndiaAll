import mongoose from 'mongoose'

const ChatUnansweredSchema = new mongoose.Schema(
  {
    normalizedQuestion: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['en', 'es', 'pt'],
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    firstSeen: {
      type: Date,
      default: Date.now,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['new', 'resolved'],
      default: 'new',
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

// Compound index to deduplicate similar questions
ChatUnansweredSchema.index({ normalizedQuestion: 1, language: 1 }, { unique: true, partialFilterExpression: { status: 'new' } })

// Method to increment count or create new entry
ChatUnansweredSchema.statics.upsertUnanswered = function (normalizedQuestion, language) {
  return this.findOneAndUpdate(
    { normalizedQuestion, language, status: 'new' },
    { $inc: { count: 1 }, $set: { lastSeen: new Date() }, $setOnInsert: { firstSeen: new Date() } },
    { upsert: true, new: true }
  )
}

// Method to mark as resolved
ChatUnansweredSchema.statics.markResolved = function (normalizedQuestion, language) {
  return this.findOneAndUpdate(
    { normalizedQuestion, language, status: 'new' },
    { status: 'resolved', lastSeen: new Date() },
    { new: true }
  )
}

export default mongoose.model('ChatUnanswered', ChatUnansweredSchema)