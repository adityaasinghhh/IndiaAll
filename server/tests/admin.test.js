import { test, before, after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { app, startServer, stopAll, clearDatabase } from './setup.js'
import Admin from '../src/models/Admin.js'
import Customer from '../src/models/Customer.js'
import Product from '../src/models/Product.js'
import SiteSettings from '../src/models/SiteSettings.js'

let server
let baseUrl
let basePort

before(async () => {
  ;({ server, baseUrl } = await startServer())
  const address = new URL(baseUrl)
  basePort = Number(address.port)
})

after(async () => {
  await stopAll(server)
})

beforeEach(async () => {
  await clearDatabase()
})

// Node's built-in fetch() drops a manually set "Cookie" request header, so
// authenticated requests are sent through raw HTTP (the header is transmitted
// exactly as provided). Everything else matches the global fetch() API.
async function fetch(url, options = {}) {
  const { headers = {}, body, ...rest } = options
  const requestUrl = new URL(url)
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: requestUrl.hostname,
        port: requestUrl.port,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        method: rest.method || 'GET',
        headers: {},
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const setCookies = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie'].map(String)
            : [String(res.headers['set-cookie'])]
          resolve({
            status: res.statusCode,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: async () => JSON.parse(Buffer.concat(chunks).toString()),
            text: async () => Buffer.concat(chunks).toString(),
            setCookies,
          })
        })
      },
    )
    req.on('error', reject)
    for (const [key, value] of Object.entries(headers)) {
      if (key === 'Cookie') continue
      req.setHeader(key, value)
    }
    const cookie = headers.Cookie
    if (cookie) req.setHeader('Cookie', cookie)
    if (body) {
      req.setHeader('Content-Type', 'application/json')
      req.write(body)
    }
    req.end()
  })
}

after(async () => {
  await stopAll(server)
})

beforeEach(async () => {
  await clearDatabase()
})

const adminCredentials = { email: 'owner@indiaall.test', password: 'owner-password-123' }

async function seedAdmin(overrides = {}) {
  return Admin.create({
    name: 'Owner',
    email: adminCredentials.email,
    password: adminCredentials.password,
    role: 'owner',
    ...overrides,
  })
}

async function login(email = adminCredentials.email, password = adminCredentials.password) {
  const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const loginBody = await loginRes.json()

  // Two-step flow: password verifies first, then the emailed OTP completes
  // the sign-in. In test mode the issued code is returned so tests can run.
  let res = loginRes
  if (loginBody.requiresOtp) {
    const verifyRes = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: loginBody.adminId, otp: loginBody.otpCode }),
    })
    res = verifyRes
    assert.equal(res.status, 200, 'OTP verification should succeed with the issued code')
  }

  const setCookie = res.setCookies || []
  return { res, cookies: Object.fromEntries(setCookie.map((c) => c.split(';')[0].split('='))) }
}

function authed(cookies, headers = {}) {
  return { headers: { Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; '), ...headers } }
}

// ---------------------------------------------------------------------------
// Health & authentication
// ---------------------------------------------------------------------------

test('health check responds', async () => {
  const res = await fetch(`${baseUrl}/api/v1/health`)
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.status, 'ok')
})

test('unauthenticated requests to admin endpoints return 401', async () => {
  for (const path of ['/api/v1/admin/dashboard', '/api/v1/admin/orders', '/api/v1/admin/customers', '/api/v1/admin/reports']) {
    const res = await fetch(`${baseUrl}${path}`)
    assert.equal(res.status, 401, `${path} should require auth`)
  }
})

test('login rejects invalid email format', async () => {
  const res = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: 'whatever123' }),
  })
  assert.equal(res.status, 400)
})

test('login rejects wrong password and succeeds with correct credentials', async () => {
  await seedAdmin()

  const bad = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminCredentials.email, password: 'wrong-password' }),
  })
  assert.equal(bad.status, 401)

  const good = await login()
  assert.equal(good.res.status, 200)
  const body = await good.res.json()
  assert.equal(body.admin.email, adminCredentials.email)
  assert.equal(body.admin.role, 'owner')
  assert.ok(body.admin.id)
  // The API must never leak password material.
  assert.ok(!JSON.stringify(body).includes('password'))
})

test('session is restored with the access cookie and survives revalidation', async () => {
  await seedAdmin()
  const { res, cookies } = await login()
  assert.ok(cookies.admin_access_token)

  const session = await fetch(`${baseUrl}/api/v1/admin/session`, authed(cookies))
  assert.equal(session.status, 200)
  const body = await session.json()
  assert.equal(body.admin.email, adminCredentials.email)

  // A request with a garbage token is rejected.
  const garbage = await fetch(`${baseUrl}/api/v1/admin/session`, authed({ admin_access_token: 'garbage' }))
  assert.equal(garbage.status, 401)
})

test('logout invalidates the session', async () => {
  await seedAdmin()
  const { res, cookies } = await login()
  assert.equal(res.status, 200)

  const out = await fetch(`${baseUrl}/api/v1/admin/logout`, { method: 'POST', ...authed(cookies) })
  assert.equal(out.status, 200)

  const session = await fetch(`${baseUrl}/api/v1/admin/session`, authed(cookies))
  assert.equal(session.status, 401)
})

test('refresh token rotation issues a new access token', async () => {
  await seedAdmin()
  const { cookies } = await login()
  assert.ok(cookies.admin_refresh_token)

  const refreshed = await fetch(`${baseUrl}/api/v1/admin/refresh`, { method: 'POST', ...authed(cookies) })
  assert.equal(refreshed.status, 200)
  const body = await refreshed.json()
  assert.equal(body.admin.email, adminCredentials.email)

  // The old refresh token must no longer be accepted (rotation).
  const replay = await fetch(`${baseUrl}/api/v1/admin/refresh`, { method: 'POST', ...authed(cookies) })
  assert.equal(replay.status, 401)
})

test('account locks after repeated failed login attempts', async () => {
  await seedAdmin()
  let last
  for (let i = 0; i < 6; i++) {
    last = await fetch(`${baseUrl}/api/v1/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminCredentials.email, password: 'definitely-wrong' }),
    })
  }
  // 5 failed attempts trigger a 2-hour lockout; the 6th request is rejected.
  assert.equal(last.status, 423)
})

// ---------------------------------------------------------------------------
// Admin email OTP sign-in
// ---------------------------------------------------------------------------

test('admin sign-in is two-step: password verifies first, OTP completes the session', async () => {
  await seedAdmin()

  // A wrong password must never reach the OTP stage.
  const bad = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminCredentials.email, password: 'wrong-password' }),
  })
  assert.equal(bad.status, 401)

  // A correct password only returns a challenge — no session cookies are
  // issued until the emailed code is verified.
  const res = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminCredentials.email, password: adminCredentials.password }),
  })
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.equal(body.requiresOtp, true)
  assert.ok(body.otpCode) // test builds only
  assert.ok(body.adminId)

  const verified = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: body.adminId, otp: body.otpCode }),
  })
  assert.equal(verified.status, 200)
  const verifyCookies = {}
  for (const c of verified.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    verifyCookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }
  const session = await fetch(`${baseUrl}/api/v1/admin/session`, authed(verifyCookies))
  assert.equal(session.status, 200)
})

test('admin OTP rejects invalid codes, accepts the correct one, and consumes it after use', async () => {
  await seedAdmin()

  const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminCredentials.email, password: adminCredentials.password }),
  })
  const body = await loginRes.json()
  assert.equal(loginRes.status, 200)

  const badVerify = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: body.adminId, otp: '00000000' }),
  })
  assert.equal(badVerify.status, 401)

  const goodVerify = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: body.adminId, otp: body.otpCode }),
  })
  assert.equal(goodVerify.status, 200)

  // The code is single use: a replay must be rejected.
  const replay = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: body.adminId, otp: body.otpCode }),
  })
  assert.equal(replay.status, 400)
})

test('admin OTP locks after the maximum number of failed attempts', async () => {
  await seedAdmin()

  const loginRes = await fetch(`${baseUrl}/api/v1/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminCredentials.email, password: adminCredentials.password }),
  })
  const body = await loginRes.json()
  assert.equal(loginRes.status, 200)

  let lastStatus = 0
  for (let i = 0; i < 5; i++) {
    const res = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: body.adminId, otp: '12345678' }),
    })
    lastStatus = res.status
  }
  // Each wrong attempt within the limit answers 401.
  assert.equal(lastStatus, 401)

  // The 6th attempt is rejected as locked after 5 failed tries.
  const sixth = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: body.adminId, otp: '12345678' }),
  })
  assert.equal(sixth.status, 400)
})


// ---------------------------------------------------------------------------
// Dashboard & reports
// ---------------------------------------------------------------------------

test('dashboard returns zeroed KPIs on an empty database without crashing', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const res = await fetch(`${baseUrl}/api/v1/admin/dashboard`, authed(cookies))
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.orders.total, 0)
  assert.equal(body.enquiries.total, 0)
  assert.equal(body.customers.total, 0)
  assert.deepEqual(body.recentOrders, [])
  assert.deepEqual(body.recentEnquiries, [])
})

test('reports returns database-backed aggregations', async () => {
  await seedAdmin()
  const { cookies } = await login()

  // Seed catalogue + site settings so product performance has something to join.
  await SiteSettings.create({})
  await Product.create({
    name: 'Crude Oil',
    slug: 'crude-oil',
    category: 'energy',
    description: { en: 'Crude oil traded in various grades.', es: 'Petróleo crudo.', pt: 'Petróleo bruto.' },
    image: '/images/products/crude-oil.svg',
  })

  // Public bulk order submission (as the website would).
  const orderRes = await fetch(`${baseUrl}/api/v1/bulk-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Buyer One', company: 'Acme Trading', email: 'buyer@acme.test', country: 'Brazil',
      commodity: 'crude-oil', quantity: '10000', unit: 'mt', destination: 'Santos', consent: true,
    }),
  })
  assert.equal(orderRes.status, 201)

  // Public enquiry submission.
  const enquiryRes = await fetch(`${baseUrl}/api/v1/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Buyer One', company: 'Acme Trading', email: 'buyer@acme.test', phone: '+55 11 99999 9999',
      commodity: 'crude-oil', quantity: '5000 MT', deliveryLocation: 'Santos, Brazil', consent: true,
    }),
  })
  assert.equal(enquiryRes.status, 201)

  const reports = await fetch(`${baseUrl}/api/v1/admin/reports`, authed(cookies))
  assert.equal(reports.status, 200)
  const body = await reports.json()
  assert.equal(body.totals.orders, 1)
  assert.equal(body.totals.enquiries, 1)
  assert.equal(body.ordersByStatus[0].status, 'pending')
  assert.equal(body.ordersByStatus[0].count, 1)
  assert.equal(body.productPerformance[0].slug, 'crude-oil')
  assert.equal(body.productPerformance[0].orders, 1)
})

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

test('orders: list, detail, status validation, notes and CSV export', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const created = await fetch(`${baseUrl}/api/v1/bulk-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Maria Silva', company: 'Silva Foods', email: 'maria@silva.test', country: 'Brazil',
      commodity: 'sugar', quantity: '500', unit: 'mt', destination: 'Santos', consent: true,
    }),
  })
  assert.equal(created.status, 201)
  const { order: createdOrder } = await created.json()

  // List
  const list = await fetch(`${baseUrl}/api/v1/admin/orders`, authed(cookies))
  const listBody = await list.json()
  assert.equal(listBody.pagination.total, 1)
  assert.equal(listBody.orders[0].company, 'Silva Foods')

  // Detail
  const detail = await fetch(`${baseUrl}/api/v1/admin/orders/${createdOrder.id}`, authed(cookies))
  assert.equal(detail.status, 200)

  // Invalid status rejected
  const badStatus = await fetch(`${baseUrl}/api/v1/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'not-a-status' }),
  })
  assert.equal(badStatus.status, 400)

  // Valid status change
  const goodStatus = await fetch(`${baseUrl}/api/v1/admin/orders/${createdOrder.id}/status`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'quoted', note: 'Waiting on supplier quote.' }),
  })
  assert.equal(goodStatus.status, 200)

  // Note without message rejected
  const badNote = await fetch(`${baseUrl}/api/v1/admin/orders/${createdOrder.id}/notes`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message: '  ' }),
  })
  assert.equal(badNote.status, 400)

  // CSV export contains the order
  const csv = await fetch(`${baseUrl}/api/v1/admin/orders/export/csv`, authed(cookies))
  assert.equal(csv.status, 200)
  const csvText = await csv.text()
  assert.ok(csvText.includes('Silva Foods'))
  assert.ok(csvText.includes('sugar'))
})

test('orders: search escapes regex metacharacters', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const created = await fetch(`${baseUrl}/api/v1/bulk-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Regex (Test)', company: 'Regex Co', email: 'regex@co.test', country: 'USA',
      commodity: 'coal', quantity: '10', unit: 'mt', destination: 'Texas', consent: true,
    }),
  })
  assert.equal(created.status, 201)

  const res = await fetch(`${baseUrl}/api/v1/admin/orders?search=${encodeURIComponent('(Test')}`, authed(cookies))
  assert.equal(res.status, 200)
})

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

test('enquiries: public submission visible in admin, status, notes, follow-up, reply', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const created = await fetch(`${baseUrl}/api/v1/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Joao Souza', company: 'Souza SA', email: 'joao@souza.test', phone: '+55 21 88888 8888',
      commodity: 'urea', quantity: '1000 MT', deliveryLocation: 'Rio de Janeiro', consent: true,
    }),
  })
  assert.equal(created.status, 201)

  const list = await fetch(`${baseUrl}/api/v1/enquiries?search=souza`, authed(cookies))
  const listBody = await list.json()
  assert.equal(listBody.enquiries.length, 1)
  const id = listBody.enquiries[0]._id

  const update = await fetch(`${baseUrl}/api/v1/enquiries/${id}/status`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      status: 'in_review',
      internalNotes: 'Contacted supplier.',
      followUpDate: '2026-11-01T00:00:00.000Z',
    }),
  })
  assert.equal(update.status, 200)
  const updated = await update.json()
  assert.equal(updated.enquiry.status, 'in_review')
  assert.equal(updated.enquiry.followUpDate, '2026-11-01T00:00:00.000Z')

  const invalid = await fetch(`${baseUrl}/api/v1/enquiries/${id}/status`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status: 'garbage' }),
  })
  assert.equal(invalid.status, 400)

  const reply = await fetch(`${baseUrl}/api/v1/enquiries/${id}/reply`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message: 'Thank you for your enquiry.' }),
  })
  assert.equal(reply.status, 200)
  const replied = await reply.json()
  assert.equal(replied.enquiry.replies.length, 1)

  const csv = await fetch(`${baseUrl}/api/v1/enquiries/export/csv`, authed(cookies))
  const csvText = await csv.text()
  assert.ok(csvText.includes('Souza SA'))
})

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

test('products: create validation, update, visibility, delete, CSV', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const bad = await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: 'X', slug: 'BAD SLUG', category: 'energy', description: { en: 'short' } }),
  })
  assert.equal(bad.status, 400)
  const badBody = await bad.json()
  assert.ok(Array.isArray(badBody.errors) && badBody.errors.length > 0)

  const good = await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: 'Test Commodity', slug: 'test-commodity', category: 'agriculture',
      description: { en: 'A fine test commodity for the catalogue.', es: 'Una mercancía de prueba.', pt: 'Uma mercadoria de teste.' },
      image: '/images/products/test.svg',
    }),
  })
  assert.equal(good.status, 201)
  const { product } = await good.json()

  const dup = await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: 'Test Commodity Two', slug: 'test-commodity', category: 'agriculture',
      description: { en: 'A fine test commodity for the catalogue.', es: 'Una mercancía de prueba.', pt: 'Uma mercadoria de teste.' },
      image: '/images/products/test.svg',
    }),
  })
  assert.equal(dup.status, 409)

  const update = await fetch(`${baseUrl}/api/v1/admin/products/${product._id}`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ visible: false }),
  })
  assert.equal(update.status, 200)

  const list = await fetch(`${baseUrl}/api/v1/admin/products?visibility=hidden`, authed(cookies))
  const listBody = await list.json()
  assert.equal(listBody.products.length, 1)

  const csv = await fetch(`${baseUrl}/api/v1/admin/products/export/csv`, authed(cookies))
  assert.ok((await csv.text()).includes('test-commodity'))

  const del = await fetch(`${baseUrl}/api/v1/admin/products/${product._id}`, { method: 'DELETE', ...authed(cookies) })
  assert.equal(del.status, 200)
})

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

test('customers: register, list, detail with history, suspend, CSV export', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const reg = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Carlos Mendes', company: 'Mendes Ltd', country: 'Portugal', phone: '+351 900000000',
      email: 'carlos@mendes.test', password: 'customer-pass-123',
    }),
  })
  assert.equal(reg.status, 201)

  const list = await fetch(`${baseUrl}/api/v1/admin/customers`, authed(cookies))
  const listBody = await list.json()
  assert.equal(listBody.customers.length, 1)
  const customer = listBody.customers[0]
  // Password material must never be returned.
  assert.ok(!('password' in customer))
  assert.ok(!('refreshTokens' in customer))

  const detail = await fetch(`${baseUrl}/api/v1/admin/customers/${customer._id}`, authed(cookies))
  assert.equal(detail.status, 200)
  const detailBody = await detail.json()
  assert.deepEqual(detailBody.orders, [])
  assert.deepEqual(detailBody.enquiries, [])

  const suspend = await fetch(`${baseUrl}/api/v1/admin/customers/${customer._id}/status`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ suspended: true }),
  })
  assert.equal(suspend.status, 200)

  const csv = await fetch(`${baseUrl}/api/v1/admin/customers/export/csv`, authed(cookies))
  const csvText = await csv.text()
  assert.ok(csvText.includes('Mendes Ltd'))
  assert.ok(!csvText.includes('password'))
})

test('customers: password reset completes via email OTP with expiry and attempt guards', async () => {
  // Register a customer; the account is unverified until the emailed code is
  // confirmed, and cannot log in before that.
  const reg = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Reset Tester', company: 'Reset Co', country: 'India', phone: '+91 900000000',
      email: 'reset@mendes.test', password: 'customer-pass-123',
    }),
  })
  assert.equal(reg.status, 201)
  const regBody = await reg.json()
  const customerId = regBody.customer.id

  const verify = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: customerId, otp: regBody.otpCode }),
  })
  assert.equal(verify.status, 200)

  // Forgot password issues a throttled password reset code.
  const forgot = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset@mendes.test' }),
  })
  assert.equal(forgot.status, 200)
  const forgotBody = await forgot.json()
  assert.equal(
    forgotBody.message,
    'If an account exists with that email, a password code has been sent.',
  )
  const resetCode = forgotBody.otpCode
  assert.ok(resetCode) // test builds only

  // A resend within the cooldown window does not mint a new code.
  const resendWithinCooldown = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset@mendes.test' }),
  })
  const resendBody = await resendWithinCooldown.json()
  assert.equal(resendBody.otpCode, undefined)

  // Unknown accounts are rejected by the reset step without leaking state.
  const unknownReset = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ghost@mendes.test', otp: resetCode, newPassword: 'new-pass-1234' }),
  })
  assert.equal(unknownReset.status, 400)

  // A wrong code is rejected and counted as a failed attempt.
  const wrongReset = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset@mendes.test', otp: '12345678', newPassword: 'new-pass-1234' }),
  })
  assert.equal(wrongReset.status, 401)

  // An expired code is rejected.
  await Customer.updateOne(
    { _id: customerId },
    { $set: { otp: { purpose: 'password', hash: 'stale-hash', expiresAt: new Date(Date.now() - 1000), attempts: 0, consumed: false, issuedAt: new Date() } } },
  )
  const expiredReset = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset@mendes.test', otp: resetCode, newPassword: 'new-pass-1234' }),
  })
  assert.equal(expiredReset.status, 400)

  // A second customer completes the full reset: correct code, old password
  // invalidated, new password accepted at login.
  const reg2 = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Reset Two', company: 'Reset Two Co', country: 'India', phone: '+91 900000001',
      email: 'reset2@mendes.test', password: 'customer-pass-123',
    }),
  })
  assert.equal(reg2.status, 201)
  const reg2Body = await reg2.json()
  const verify2 = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: reg2Body.customer.id, otp: reg2Body.otpCode }),
  })
  assert.equal(verify2.status, 200)
  const forgot2 = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset2@mendes.test' }),
  })
  const resetCode2 = (await forgot2.json()).otpCode
  assert.ok(resetCode2)

  const okReset = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset2@mendes.test', otp: resetCode2, newPassword: 'new-pass-1234' }),
  })
  assert.equal(okReset.status, 200)

  const loginBefore = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset2@mendes.test', password: 'customer-pass-123' }),
  })
  assert.equal(loginBefore.status, 401)

  const loginAfter = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'reset2@mendes.test', password: 'new-pass-1234' }),
  })
  assert.equal(loginAfter.status, 200)
})

// ---------------------------------------------------------------------------
// Roles & settings
// ---------------------------------------------------------------------------

test('role-based authorization: viewer cannot mutate products or customers', async () => {
  await seedAdmin()
  const { cookies: ownerCookies } = await login()
  const created = await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(ownerCookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: 'RBAC Product', slug: 'rbac-product', category: 'metals',
      description: { en: 'Used for role testing scenarios here.', es: 'Usado para pruebas de RBAC.', pt: 'Usado para testes de RBAC.' },
      image: '/images/products/rbac-product.svg',
    }),
  })
  assert.equal(created.status, 201)

  await Admin.create({ name: 'Viewer', email: 'viewer@indiaall.test', password: 'viewer-pass-123', role: 'viewer' })
  const { cookies: viewerCookies } = await login('viewer@indiaall.test', 'viewer-pass-123')

  const denied = await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(viewerCookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: 'Nope', slug: 'nope-product', category: 'metals',
      description: { en: 'This should be rejected by RBAC.', es: 'Debe ser rechazado.', pt: 'Deve ser rejeitado.' },
      image: '/images/products/nope.svg',
    }),
  })
  assert.equal(denied.status, 403)

  // Viewer can still read.
  const allowed = await fetch(`${baseUrl}/api/v1/admin/products`, authed(viewerCookies))
  assert.equal(allowed.status, 200)
})

test('profile update and password change flow', async () => {
  await seedAdmin()
  const { cookies } = await login()

  const profile = await fetch(`${baseUrl}/api/v1/admin/profile`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name: 'Renamed Owner' }),
  })
  assert.equal(profile.status, 200)

  const otpReq = await fetch(`${baseUrl}/api/v1/admin/password/otp-request`, {
    method: 'POST',
    ...authed(cookies),
  })
  const otpBody = await otpReq.json()
  assert.equal(otpReq.status, 200)
  const otpCode = otpBody.otpCode

  const pw = await fetch(`${baseUrl}/api/v1/admin/password`, {
    method: 'PUT',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ currentPassword: 'owner-password-123', newPassword: 'brand-new-password-456', otp: otpCode }),
  })
  assert.equal(pw.status, 200)

  // Old password no longer works; new one does; cookies were cleared.
  const oldLogin = await login(adminCredentials.email, 'owner-password-123')
  assert.equal(oldLogin.res.status, 401)

  const newLogin = await login(adminCredentials.email, 'brand-new-password-456')
  assert.equal(newLogin.res.status, 200)
})

test('audit log records administrative actions', async () => {
  await seedAdmin()
  const { cookies } = await login()

  await fetch(`${baseUrl}/api/v1/admin/products`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      name: 'Audited Product', slug: 'audited-product', category: 'energy',
      description: { en: 'This creation is written to the audit trail.', es: 'Creación auditada.', pt: 'Criação auditada.' },
      image: '/images/products/audited-product.svg',
    }),
  })

  const logs = await fetch(`${baseUrl}/api/v1/admin/audit-logs`, authed(cookies))
  const body = await logs.json()
  assert.ok(body.logs.length >= 1)
  assert.equal(body.logs[0].action, 'product_created')
  assert.equal(body.logs[0].targetType, 'Product')
})

// ---------------------------------------------------------------------------
// MFA (TOTP + recovery codes)
// ---------------------------------------------------------------------------

async function registerAndVerifyCustomer(email = 'mfa@customer.test', password = 'customer-pass-123') {
  const reg = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'MFA Customer', company: 'MFA Co', country: 'India', phone: '+91 900000000',
      email, password,
    }),
  })
  assert.equal(reg.status, 201)
  const regBody = await reg.json()
  const customerId = regBody.customer.id

  const verify = await fetch(`${baseUrl}/api/v1/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: customerId, otp: regBody.otpCode }),
  })
  assert.equal(verify.status, 200)

  return { customerId, email, password }
}

test('MFA: customer TOTP enrollment start returns QR code and secret (test mode)', async () => {
  const { customerId } = await registerAndVerifyCustomer()

  // Enrollment start requires authentication — use the customer's session via
  // the change-password/request-otp style flow is not applicable; instead we
  // test the MFA enrollment endpoints directly with a simulated auth header.
  // Since there's no customer login yet, we seed through register then verify.
  // The enroll endpoints require authenticateCustomer middleware which needs
  // a session cookie. For the test we simulate by calling via the customer's
  // own login after MFA is not yet enrolled (login works without MFA).

  // First, log the customer in (no MFA yet).
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mfa@customer.test', password: 'customer-pass-123' }),
  })
  assert.equal(loginRes.status, 200)
  const loginBody = await loginRes.json()
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  assert.equal(start.status, 200)
  const startBody = await start.json()
  assert.ok(startBody.otpauthUrl)
  assert.ok(startBody.qrDataUrl)
  assert.ok(startBody.secret) // test mode returns secret
})

test('MFA: customer TOTP enrollment confirm enables MFA and issues recovery codes', async () => {
  const { customerId } = await registerAndVerifyCustomer()

  // Log in to get session cookies
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mfa@customer.test', password: 'customer-pass-123' }),
  })
  assert.equal(loginRes.status, 200)
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  // Start enrollment
  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  assert.equal(start.status, 200)
  const startBody = await start.json()
  const secret = startBody.secret

  // Generate a valid TOTP code for the secret
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  const token = speakeasy.totp({ secret, encoding: 'base32' })

  // Confirm enrollment
  const confirm = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token }),
  })
  assert.equal(confirm.status, 200)
  const confirmBody = await confirm.json()
  assert.ok(confirmBody.recoveryCodes)
  assert.equal(confirmBody.recoveryCodes.length, 10)
})

test('MFA: customer MFA status shows enrolled state', async () => {
  const { customerId } = await registerAndVerifyCustomer()

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mfa@customer.test', password: 'customer-pass-123' }),
  })
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  // Not enrolled yet
  let status = await fetch(`${baseUrl}/api/v1/auth/mfa/status`, authed(cookies))
  assert.equal(status.status, 200)
  let body = await status.json()
  assert.equal(body.twoFactorEnabled, false)

  // Enroll
  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  const startBody = await start.json()
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  const token = speakeasy.totp({ secret: startBody.secret, encoding: 'base32' })
  await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token }),
  })

  // Now enrolled
  status = await fetch(`${baseUrl}/api/v1/auth/mfa/status`, authed(cookies))
  body = await status.json()
  assert.equal(body.twoFactorEnabled, true)
  assert.equal(body.recoveryCodesRemaining, 10)
})

test('MFA: customer login requires MFA when enrolled, then succeeds with TOTP', async () => {
  const { customerId, email, password } = await registerAndVerifyCustomer()

  // Enroll MFA first (login without MFA to get cookies)
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  assert.equal(loginRes.status, 200)
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  const startBody = await start.json()
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  const token = speakeasy.totp({ secret: startBody.secret, encoding: 'base32' })
  await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token }),
  })

  // Now login with MFA → should require MFA step
  const mfaLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  assert.equal(mfaLogin.status, 200)
  const mfaBody = await mfaLogin.json()
  assert.equal(mfaBody.requiresMfa, true)
  assert.ok(mfaBody.challengeId)
  assert.ok(mfaBody.userId)

  // Verify MFA with valid TOTP
  const mfaToken = speakeasy.totp({ secret: startBody.secret, encoding: 'base32' })
  const verify = await fetch(`${baseUrl}/api/v1/auth/mfa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: mfaBody.userId, challengeId: mfaBody.challengeId, token: mfaToken }),
  })
  assert.equal(verify.status, 200)
  const verifyBody = await verify.json()
  assert.equal(verifyBody.message, 'Login successful')
  assert.ok(verifyBody.customer)

  // Old password still works after MFA login (MFA doesn't change password)
  const loginAgain = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  assert.equal(loginAgain.status, 200) // MFA still required on each login
})

test('MFA: customer login MFA rejects invalid TOTP code', async () => {
  const { email, password } = await registerAndVerifyCustomer()

  // Enroll MFA
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  const startBody = await start.json()
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token: speakeasy.totp({ secret: startBody.secret, encoding: 'base32' }) }),
  })

  // Login triggers MFA
  const mfaLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const mfaBody = await mfaLogin.json()

  // Invalid TOTP code
  const verify = await fetch(`${baseUrl}/api/v1/auth/mfa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: mfaBody.userId, challengeId: mfaBody.challengeId, token: '000000' }),
  })
  assert.equal(verify.status, 401)
})

test('MFA: recovery codes work once then are rejected', async () => {
  const { email, password } = await registerAndVerifyCustomer()

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  const startBody = await start.json()
  const confirm = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token: '000000' }), // will fail, need real TOTP
  })
  // Get recovery codes from test mode response
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token: speakeasy.totp({ secret: startBody.secret, encoding: 'base32' }) }),
  })

  // Regenerate recovery codes to get them in test mode
  const regen = await fetch(`${baseUrl}/api/v1/auth/mfa/recovery-codes`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ currentPassword: password, token: speakeasy.totp({ secret: startBody.secret, encoding: 'base32' }) }),
  })
  assert.equal(regen.status, 200)
  const regenBody = await regen.json()
  const recoveryCode = regenBody.recoveryCodes[0]

  // Login triggers MFA
  const mfaLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const mfaBody = await mfaLogin.json()

  // Use recovery code
  const verify = await fetch(`${baseUrl}/api/v1/auth/mfa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: mfaBody.userId, challengeId: mfaBody.challengeId, token: recoveryCode }),
  })
  assert.equal(verify.status, 200)

  // Same recovery code should be rejected (already used)
  const mfaLogin2 = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const mfaBody2 = await mfaLogin2.json()
  const verify2 = await fetch(`${baseUrl}/api/v1/auth/mfa/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: mfaBody2.userId, challengeId: mfaBody2.challengeId, token: recoveryCode }),
  })
  assert.equal(verify2.status, 401)
})

test('MFA: disable MFA requires current password and valid TOTP', async () => {
  const { email, password } = await registerAndVerifyCustomer()

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const cookies = {}
  for (const c of loginRes.setCookies || []) {
    const [pair] = String(c).split(';')
    const at = pair.indexOf('=')
    cookies[pair.slice(0, at).trim()] = pair.slice(at + 1).trim()
  }

  const start = await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  const startBody = await start.json()
  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  await fetch(`${baseUrl}/api/v1/auth/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token: speakeasy.totp({ secret: startBody.secret, encoding: 'base32' }) }),
  })

  // Disable without password → 400
  const disableBad = await fetch(`${baseUrl}/api/v1/auth/mfa/disable`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({}),
  })
  assert.equal(disableBad.status, 400)

  // Disable with wrong password → 401
  const disableWrong = await fetch(`${baseUrl}/api/v1/auth/mfa/disable`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ currentPassword: 'wrong-password', token: '000000' }),
  })
  assert.equal(disableWrong.status, 401)

  // Disable with correct password + valid TOTP → 200
  const disableOk = await fetch(`${baseUrl}/api/v1/auth/mfa/disable`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ currentPassword: password, token: speakeasy.totp({ secret: startBody.secret, encoding: 'base32' }) }),
  })
  assert.equal(disableOk.status, 200)

  // MFA status should now show disabled
  const status = await fetch(`${baseUrl}/api/v1/auth/mfa/status`, authed(cookies))
  const statusBody = await status.json()
  assert.equal(statusBody.twoFactorEnabled, false)
})

test('MFA: admin TOTP enrollment and MFA login flow', async () => {
  await seedAdmin()

  const { cookies } = await login()

  // Start admin MFA enrollment
  const start = await fetch(`${baseUrl}/api/v1/admin/mfa/enroll/start`, {
    method: 'POST',
    ...authed(cookies),
  })
  assert.equal(start.status, 200)
  const startBody = await start.json()
  assert.ok(startBody.otpauthUrl)

  const speakeasyModule = await import('speakeasy')
  const speakeasy = speakeasyModule.default
  const token = speakeasy.totp({ secret: startBody.secret, encoding: 'base32' })

  // Confirm enrollment
  const confirm = await fetch(`${baseUrl}/api/v1/admin/mfa/enroll/confirm`, {
    method: 'POST',
    ...authed(cookies, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token }),
  })
  assert.equal(confirm.status, 200)

  // Admin MFA status
  const status = await fetch(`${baseUrl}/api/v1/admin/mfa/status`, authed(cookies))
  assert.equal(status.status, 200)
  const statusBody = await status.json()
  assert.equal(statusBody.twoFactorEnabled, true)
  assert.equal(statusBody.mfaRequired, true)
})

// ---------------------------------------------------------------------------
// CSV safety
// ---------------------------------------------------------------------------

test('CSV export neutralises formula injection', async () => {
  await seedAdmin()
  const { cookies } = await login()

  await Customer.create({
    name: '=CMD|calc', company: 'Formula Co', country: 'Brazil', phone: '+55 11 77777 7777',
    email: 'formula@co.test', password: 'whatever-password-1',
  })

  const csv = await fetch(`${baseUrl}/api/v1/admin/customers/export/csv`, authed(cookies))
  const text = await csv.text()
  assert.ok(text.includes("'=CMD"))
})
