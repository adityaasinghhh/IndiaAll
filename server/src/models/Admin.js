import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['owner', 'editor', 'viewer'],
      default: 'editor',
    },
    twoFactorSecret: String,
    twoFactorEnabled: { type: Boolean, default: false },
    // One-time sign-in / password codes. Only the keyed hash of the code is
    // stored; the plain code is emailed and never persisted.
    otp: {
      purpose: {
        type: String,
        enum: ['admin-login', 'password'],
        default: 'admin-login',
      },
      hash: String,
      expiresAt: Date,
      attempts: { type: Number, default: 0 },
      consumed: { type: Boolean, default: false },
      issuedAt: Date,
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
    // Bumped on logout / password change to immediately invalidate every
    // previously issued stateless access token.
    sessionVersion: { type: Number, default: 0 },
    // ------------------------------------------------------------------
    // Multi-factor authentication (admin)
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

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now()
}

adminSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } })
  }
  const updates = { $inc: { loginAttempts: 1 } }
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }
  }
  return this.updateOne(updates)
}

export default mongoose.model('Admin', adminSchema)
