import nodemailer from 'nodemailer'
import { config } from './env.js'

export const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
})

export async function verifyEmailConfig() {
  try {
    await transporter.verify()
    console.log('Email server connection verified')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error.message)
    return false
  }
}
