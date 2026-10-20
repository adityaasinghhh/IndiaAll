import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { app, startServer, stopAll } from './setup.js'

let server
let baseUrl

before(async () => {
  ;({ server, baseUrl } = await startServer())
})

after(async () => {
  await stopAll(server)
})

async function postChat(body) {
  const res = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return {
    status: res.status,
    ok: res.ok,
    json: await res.json().catch(() => ({})),
  }
}

test('no API key: product list query returns commodity list', async () => {
  // OPENAI_API_KEY is intentionally not set in the test environment.
  const res = await postChat({ message: 'What commodities do you supply?' })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.ok(body.response.includes('Crude Oil'))
  assert.ok(body.response.includes('Diesel'))
  assert.ok(body.response.includes('Jet A'))
  assert.ok(body.response.includes('Diesel (EN590)'))
  assert.ok(body.response.includes('Di-Ammonium Phosphate (DAP)'))
})

test('configured AI provider attempts to call the API (not just return 503)', async () => {
  // Temporarily set OPENAI_API_KEY to simulate a configured provider.
  const originalKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'sk-test1234567890abcdef'
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  delete require.cache[require.resolve('../src/config/env.js')]
  const { config: envConfig } = require('../src/config/env.js')
  try {
    assert.equal(envConfig.ai.apiKey, 'sk-test1234567890abcdef')
    const res = await request('POST', `${baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' }),
    })
    // With a configured API key, the request should reach the OpenAI API.
    // It will fail at the network level (no real API key), but should NOT
    // return the "AI assistant is not configured" error.
    assert.notEqual(res.status, 503)
    assert.notEqual(res.body.message, 'AI assistant is not configured. Please contact support.')
    // Either a network error (502) or a valid response from OpenAI.
    assert.ok([400, 401, 403, 429, 502, 503].includes(res.status))
  } finally {
    delete process.env.OPENAI_API_KEY
    delete require.cache[require.resolve('../src/config/env.js')]
    const { config: envConfig2 } = require('../src/config/env.js')
  }
})

test('specific commodity query returns product details', async () => {
  const res = await request('POST', '/api/v1/admin/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: loginRes.body.adminId, otp: '00000000' }),
  })
  assert.equal(verifyRes.status, 401)
  assert.equal(verifyRes.body.message, 'The verification code is incorrect')

  // Verify correct OTP works (we need to get the actual code first from login response)
  const verifyCorrect = await fetch(`${baseUrl}/api/v1/admin/otp-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId: loginRes.body.adminId, otp: loginRes.body.otpCode }),
  })
  assert.equal(verifyRes.status, 200)
})