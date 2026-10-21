
import mongoose from 'mongoose'
import { config } from './env.js'

/**
 * Database connection helper.
 *
 * Two very different environments have to share this file:
 *
 *  - Traditional hosting / local development: `npm start` opens a MongoDB
 *    connection and then keeps listening on a port.
 *  - Vercel serverless: there is no startup hook and no long-lived process.
 *    The connection is therefore established lazily, on the first request that
 *    needs it, and is then reused by every later request handled by the same
 *    (warm) function instance.
 *
 * Because of the second case we must never call `process.exit()` on a failed
 * connection: that would kill the function instance instead of letting the
 * request fail with a 5xx and be retried on the next invocation.
 */

// A single in-flight/settled connection promise per function instance.
let connectionPromise = null

// mongodb://localhost:27017/... and friends are unreachable from Vercel.
const LOCAL_MONGO_PATTERN = /^mongodb(\+srv)?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/

/**
 * Ensure a MongoDB connection exists and is usable.
 *
 * Resolves to `true` when the connection is ready. Rejects with a descriptive
 * error when the database cannot be reached, so the caller can answer with a
 * 503 instead of hanging.
 */
export function ensureDatabaseConnection() {
  // 1 = connected, nothing to do.
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(true)
  }

  if (!config.mongoUri) {
    return Promise.reject(new Error('MONGO_URI is missing or empty'))
  }

  if (process.env.VERCEL && LOCAL_MONGO_PATTERN.test(config.mongoUri)) {
    return Promise.reject(
      new Error(
        'MONGO_URI still points at a local MongoDB. Configure a hosted MongoDB (for example MongoDB Atlas) on Vercel.',
      ),
    )
  }

  // 2 = a connection attempt is already running (for example Mongoose's own
  // automatic reconnect). Wait for it instead of starting a second one.
  if (mongoose.connection.readyState === 2) {
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(true))
      mongoose.connection.once('error', (error) => reject(error))
    })
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.mongoUri, {
        autoIndex: config.nodeEnv !== 'production',
        serverSelectionTimeoutMS: 10000,
        autoSelectFamily: false,
      })
      .then(() => {
        console.log('MongoDB connected successfully')
        return true
      })
      .catch((error) => {
        // Allow a later request to try again.
        connectionPromise = null
        throw error
      })
  }

  return connectionPromise
}

/**
 * Connect for a long-running process (local server, seeding, tests).
 *
 * On Vercel the error is re-thrown instead of terminating the process.
 */
export async function connectDatabase() {
  try {
    await ensureDatabaseConnection()
  } catch (error) {
    console.error('MongoDB connection failed')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)

    if (error.reason) {
      console.error('Server selection details:', error.reason.message)
    }

    // On Vercel a failed connection must not kill the function instance.
    if (process.env.VERCEL) {
      throw error
    }

    process.exit(1)
  }
}

export default connectDatabase
