import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    country: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    // One-time verification / password codes. Only the keyed hash of the
    // code is stored; the plain code is emailed and never persisted.
    otp: {
      purpose: {
        type: String,
        enum: ['email-verification', 'password'],
        default: 'email-verification',
      },
      hash: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      issuedAt: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    suspended: { type: Boolean, default: false },
    consentGiven: { type: Boolean, default: false },
    consentTimestamp: Date,
    favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // ------------------------------------------------------------------
    // Multi-factor authentication (customer)
    // ------------------------------------------------------------------
    twoFactorSecret: { type: String }, // AES-256-GCM encrypted TOTP secret
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorEnrolledAt: { type: Date },
    recoveryCodes: [{ hash: String, used: { type: Boolean, default: false }, usedAt: Date }],
    mfaChallenge: {
      challengeId: String,
      expiresAt: Date,
      consumed: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

customerSchema.index({ createdAt: -1 })
customerSchema.index({ suspended: 1 })

customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

customerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

customerSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now()
}

customerSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } })
  }
  const updates = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }
  }
  return this.updateOne(updates)
}

customerSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    company: this.company,
    country: this.country,
    phone: this.phone,
    email: this.email,
    isEmailVerified: this.isEmailVerified,
    suspended: this.suspended,
    consentGiven: this.consentGiven,
    favoriteProducts: this.favoriteProducts,
    createdAt: this.createdAt,
  }
}

export default mongoose.model('Customer', customerSchema)
