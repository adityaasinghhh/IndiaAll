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

async function postChatWithHistory(message, history) {
  const res = await fetch(`${baseUrl}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory: history }),
  })
  return {
    status: res.status,
    ok: res.ok,
    json: await res.json().catch(() => ({})),
  }
}

test('no API key: first message shows main menu', async () => {
  // OPENAI_API_KEY is intentionally not set in the test environment.
  // First message always shows the main menu.
  const res = await postChat({ message: 'What commodities do you supply?' })
  assert.equal(res.status, 200)
  const body = res.json
  // First message returns main menu, not commodity list
  assert.ok(body.response.includes('Products & Commodities'))
  assert.ok(body.response.includes('Get a Quote'))
  assert.ok(body.response.includes('My Enquiries'))
})

test('configured AI provider attempts to call the API (not just return 503)', async () => {
  const originalKey = process.env.OPENAI_API_KEY
  process.env.OPENAI_API_KEY = 'sk-test1234567890abcdef'
  try {
    const res = await postChat({ message: 'Hello' })
    // With a configured API key, the request should reach the OpenAI API.
    // It will fail at the network level (no real API key), but should NOT
    // return the "AI assistant is not configured" error.
    // The response will be a fallback/message response with status 200
    // since the query doesn't match any special flow.
    assert.notEqual(res.status, 503)
    // Accept 200 (fallback response) or other error/status codes
    assert.ok([200, 400, 401, 403, 429, 502, 503].includes(res.status))
  } finally {
    process.env.OPENAI_API_KEY = originalKey
  }
})

test('specific commodity query via conversation history', async () => {
  // Send with conversation history to bypass first-message menu
  const res = await postChatWithHistory('Tell me about Crude Oil', [{ role: 'user', content: 'start' }])
  assert.equal(res.status, 200)
  const body = res.json
  // Product detail response includes the product name and category
  assert.ok(body.response.includes('Crude Oil'))
  assert.ok(body.response.includes('energy'))
})