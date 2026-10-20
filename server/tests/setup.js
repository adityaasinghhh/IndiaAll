/**
 * Test bootstrap: starts an in-memory MongoDB, sets the environment the app
 * expects, and exposes helpers for spinning up the Express app on an
 * ephemeral port. Uses only node:test + the already-installed mongodb-memory-server.
 */
import { MongoMemoryServer } from 'mongodb-memory-server'

const mongod = await MongoMemoryServer.create()

process.env.NODE_ENV = 'test'
process.env.MONGO_URI = mongod.getUri('indiaall-test')
process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789abcdef'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789abcdef'
process.env.CLIENT_URL = 'http://localhost:3000'
process.env.ADMIN_EMAIL = 'owner@indiaall.test'
process.env.ADMIN_PASSWORD = 'owner-password-123'
process.env.SMTP_HOST = ''
process.env.SMTP_USER = ''
process.env.SMTP_PASS = ''
process.env.MFA_ENCRYPTION_KEY = 'MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY='

const { connectDatabase } = await import('../src/config/database.js')
const { default: mongoose } = await import('mongoose')
const { default: app } = await import('../src/app.js')
const { transporter } = await import('../src/config/email.js')

// Tests exercise the OTP flows without a real SMTP server; stub delivery so
// send failures do not abort the flows under test.
transporter.sendMail = async () => ({ messageId: 'test-message' })

await connectDatabase()

export { app, mongoose }

export async function startServer() {
  const server = app.listen(0)
  await new Promise((resolve) => server.on('listening', resolve))
  const { port } = server.address()
  return { server, baseUrl: `http://127.0.0.1:${port}` }
}

export async function stopAll(server) {
  if (server) await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
  await mongod.stop()
}

export async function clearDatabase() {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
}
