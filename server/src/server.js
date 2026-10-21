import { pathToFileURL } from 'node:url'
import { config } from './config/env.js'
import { connectDatabase } from './config/database.js'
import { verifyEmailConfig } from './config/email.js'
import app from './app.js'

/**
 * Backend entry point.
 *
 * The same file is used for two situations:
 *
 *  1. Local development / traditional hosting (`npm start`, `npm run dev`):
 *     we open a MongoDB connection, verify SMTP and start an HTTP listener.
 *
 *  2. Vercel serverless (the `server` service of this project): Vercel imports
 *     this module once per function instance and then calls the exported
 *     Express app for every incoming request. No listener may be opened here
 *     and the process must never be terminated, otherwise the instance is
 *     discarded between requests.
 *
 * The Express app itself is defined in `app.js`; this file only wires up the
 * process-level behaviour and re-exports the app.
 */

// Vercel sets VERCEL=1 for both builds and function invocations.
const isServerless = Boolean(process.env.VERCEL)

const startServer = async () => {
  try {
    // Check if MongoDB URI is configured
    if (!config.mongoUri) {
      console.warn('MONGO_URI not configured — database-dependent routes will fail')
    } else {
      await connectDatabase()
      if (config.email.user && config.email.pass) {
        await verifyEmailConfig()
      } else {
        console.warn('SMTP not configured — emails will not be sent. Set SMTP_USER and SMTP_PASS in .env')
      }
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

// Only start the HTTP listener when this file is executed directly.
// `require.main === module` is not available in ES modules, so the module URL
// is compared with the executed script path instead.
const isDirectRun = Boolean(
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href,
)

if (!isServerless && isDirectRun) {
  startServer()
}

// Vercel (and any other Node.js function platform) expects the Express
// application as the default export of the entry point.
export default app
