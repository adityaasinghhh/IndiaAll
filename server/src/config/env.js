import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/indiaall',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Info@indiaall.org',
    recipients: (process.env.ENQUIRY_RECIPIENTS || 'Info@indiaall.org').split(',').map((email) => email.trim()).filter(Boolean),
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'Info@indiaall.org',
    password: process.env.ADMIN_PASSWORD || 'changeme123',
  },
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
  previewSecret: process.env.MAINTENANCE_PREVIEW_SECRET || 'india-all-preview',
  dataRetentionDays: parseInt(process.env.DATA_RETENTION_DAYS, 10) || 365,
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
    },
  },
}
