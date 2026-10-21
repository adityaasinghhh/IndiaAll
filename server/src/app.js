import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'node:url'
import path from 'path'
import { config } from './config/env.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.js'
import { customerRouter as authMfaRouter } from './routes/mfa.js'
import enquiryRoutes from './routes/enquiries.js'
import adminRoutes from './routes/admin.js'
import { adminRouter as adminMfaRouter } from './routes/mfa.js'
import productRoutes from './routes/products.js'
import bulkOrderRoutes from './routes/bulkOrders.js'
import siteSettingsRoutes from './routes/siteSettings.js'
import chatRoutes from './routes/chat.js'

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
const originTwin = new URL(config.clientUrl)
originTwin.hostname = `www.${originTwin.hostname}`
const allowedOrigins = new Set()
allowedOrigins.add(config.clientUrl)
allowedOrigins.add(originTwin.toString())
// Add localhost origins only in development
if (config.nodeEnv !== 'production') {
  allowedOrigins.add('http://localhost:3000')
  allowedOrigins.add('http://127.0.0.1:3000')
  allowedOrigins.add('http://127.0.0.1:3001')
}

app.use(cors({
  origin(origin, callback) {
    // Allow requests without an Origin header (e.g. local scripts).
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true)
    }
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/auth', authMfaRouter)
app.use('/api/v1/enquiries', enquiryRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/admin', adminMfaRouter)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/bulk-orders', bulkOrderRoutes)
app.use('/api/v1/settings', siteSettingsRoutes)
app.use('/api/v1/chat', chatRoutes)

// ── Production: serve built client ──────────────────────────────
if (config.nodeEnv === 'production') {
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