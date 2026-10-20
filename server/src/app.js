import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import cookieParser from 'cookie-parser'
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

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests without an Origin header (e.g. local scripts).
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(mongoSanitize())
app.use(hpp())

// Body parsing
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

// 404 and error handling
app.use(notFound)
app.use(errorHandler)

export default app
