import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { verifyEmailConfig } from './config/email.js'
import app from './app.js'

const startServer = async () => {
  await connectDatabase()

  if (config.email.user && config.email.pass) {
    await verifyEmailConfig()
  } else {
    console.warn('SMTP not configured — emails will not be sent. Set SMTP_USER and SMTP_PASS in .env')
  }

  app.listen(process.env.PORT || config.port || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || config.port || 5000} in ${config.nodeEnv} mode`)
  })
}

startServer()
