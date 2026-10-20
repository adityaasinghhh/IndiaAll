
import mongoose from 'mongoose'
import { config } from './env.js'

export async function connectDatabase() {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI is missing or empty')
    }


await mongoose.connect(config.mongoUri, {
  autoIndex: config.nodeEnv !== 'production',
  serverSelectionTimeoutMS: 10000,
  autoSelectFamily: false,
})


    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection failed')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)

    if (error.reason) {
      console.error('Server selection details:', error.reason.message)
    }

    process.exit(1)
  }
}

export default connectDatabase
