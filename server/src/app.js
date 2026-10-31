import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { config } from './config/env.js'
import { ensureDatabaseConnection } from './config/database.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import { customerRouter as authMfaRouter } from './routes/mfa.js'
import enquiryRoutes from './routes/enquiries.js'
import adminRoutes from './routes/admin.js'
import { adminRouter as adminMfaRouter } from './routes/mfa.js'
import productRoutes from './routes/products.js'
import bulkOrderRoutes from './routes/bulkOrders.js'
import siteSettingsRoutes from './routes/siteSettings.js'

const app = express()

// ── Trust proxy & rate limiter ─────────────────────────────────
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
}))
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }))

// CORS – allow only configured origin(s)
const allowedOrigins = new Set()
allowedOrigins.add(config.clientUrl)
// The public site and the API are served from the same domain (the browser
// calls /api/* on the same origin), so CORS is only a safety net for local
// development and for a separately hosted frontend.
try {
  const originTwin = new URL(config.clientUrl)
  originTwin.hostname = `www.${originTwin.hostname}`
  allowedOrigins.add(originTwin.toString())
} catch {
  console.warn('CLIENT_URL is not a valid URL — only the configured value is allowed as an origin.')
}
// Add localhost origins only in development
if (config.nodeEnv !== 'production') {
  allowedOrigins.add('http://localhost:3000')
  allowedOrigins.add('http://127.0.0.1:3000')
  allowedOrigins.add('http://127.0.0.1:3001')
}

// A request that comes from the same host as the API is always allowed. On
// Vercel the browser calls /api/* on the very same domain, and the domain of
// a preview deployment differs from the production domain, so this keeps
// same-origin traffic working without having to list every hostname.
function isSameOrigin(req, origin) {
  const host = req.headers['x-forwarded-host'] || req.headers.host
  if (!host) return false
  const proto = req.headers['x-forwarded-proto'] || req.protocol
  return `${proto}://${host}` === origin
}

app.use(cors((req, callback) => {
  callback(null, {
    origin(origin, done) {
      // Allow requests without an Origin header (e.g. local scripts).
      if (!origin) {
        return done(null, true)
      }
      if (allowedOrigins.has(origin)) {
        return done(null, true)
      }
      if (isSameOrigin(req, origin)) {
        return done(null, true)
      }
      return done(new Error(`CORS blocked origin: ${origin}`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
}))

// Sanitization & validation
app.use(mongoSanitize())
app.use(hpp())

// Body parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// ── Health check ────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Simple hello endpoint (for Vercel deployment verification) ────────────
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' })
})

// ── Database connection ─────────────────────────────────────────
// On Vercel the app runs as a serverless function: there is no startup hook
// where the database could be opened, so the connection is established here,
// lazily, on the first API request that needs it. The connection is then
// reused by every later request handled by the same function instance.
// Locally the connection is already open (see server.js) and this is a no-op.
app.use('/api', async (req, res, next) => {
  try {
    await ensureDatabaseConnection()
    next()
  } catch (error) {
    console.error('Database unavailable:', error.message)
    res.status(503).json({ message: 'Database is temporarily unavailable. Please try again shortly.' })
  }
})

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/auth', authMfaRouter)
app.use('/api/v1/enquiries', enquiryRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/admin', adminMfaRouter)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/bulk-orders', bulkOrderRoutes)
app.use('/api/v1/settings', siteSettingsRoutes)

// ── Production: serve built client ──────────────────────────────
// Only used by the traditional single-server deployment (`npm start` with
// NODE_ENV=production). On Vercel the frontend is a separate service, so the
// backend never serves static files.
if (config.nodeEnv === 'production' && !process.env.VERCEL) {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const clientDist = path.resolve(here, '../../client/dist')
  app.use(express.static(clientDist, {
    index: false,
    maxAge: '7d',
  }))

  // Catch-all: serve index.html for any GET path that does not start with /api/
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ message: 'API route not found' })
    } else {
      res.sendFile(path.join(clientDist, 'index.html'))
    }
  })
}

// ── 404 and error handling ──────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
