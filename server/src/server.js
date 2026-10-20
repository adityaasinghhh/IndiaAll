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

  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`)
  })
}

startServer()
