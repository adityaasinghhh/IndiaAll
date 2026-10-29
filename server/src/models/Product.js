import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: String,
      enum: ['energy', 'agriculture', 'food', 'metals'],
      required: true,
    },
    description: {
      en: { type: String, required: true },
      es: { type: String, required: true },
      pt: { type: String, required: true },
    },
    image: { type: String, required: true },
    origin: { type: String, trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
