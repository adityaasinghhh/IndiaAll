import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { verifyEmailConfig } from './config/email.js'
import app from './app.js'

// ── Traditional hosting (local development) ───────────────────────────────
// Start the Express server when this module is executed directly.
// Since this is an ES module (package.json has "type": "module"),
// we cannot use require.main === module. Instead, we call startServer()
// immediately after defining it.
const startServer = async () => {
  try {
    await connectDatabase()

    if (config.email.user && config.email.pass) {
      await verifyEmailConfig()
    } else {
      console.warn('SMTP not configured — emails will not be sent. Set SMTP_USER and SMTP_PASS in .env')
    }

    const PORT = process.env.PORT || config.port || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

// Start the server when this file is executed as the main module.
// In ES modules, the top-level code runs automatically, so we call
// startServer() here rather than using require.main === module.
startServer()

// Export the Express app for potential use with vercel.json configuration
export default app