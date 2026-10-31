import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { startServer, stopAll, clearDatabase, Enquiry } from './setup.js'

let server
let baseUrl

before(async () => { ({ server, baseUrl } = await startServer()) })
after(async () => { await stopAll(server) })

async function postEnquiry(body) {
  const response = await fetch(`${baseUrl}/api/v1/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: response.status, json: await response.json().catch(() => ({})) }
}

test('public enquiry rejects missing consent and saves after consent', async () => {
  await clearDatabase()
  const payload = {
    name: 'Test Buyer', email: 'buyer@example.test', company: 'Example Trading', country: 'Canada',
    commodity: 'Sesame seeds', quantity: '20 MT | Grade A', deliveryLocation: 'Toronto, Canada',
    message: 'Please contact me in Spanish.', enquiryType: 'Commodity enquiry', language: 'es',
  }
  const rejected = await postEnquiry({ ...payload, consent: false })
  assert.equal(rejected.status, 400)
  assert.equal(await Enquiry.countDocuments(), 0)

  const accepted = await postEnquiry({ ...payload, consent: true })
  assert.equal(accepted.status, 201)
  assert.ok(accepted.json.enquiry.id)
  const saved = await Enquiry.findById(accepted.json.enquiry.id)
  assert.equal(saved.email, payload.email)
  assert.equal(saved.consent, true)
  assert.equal(saved.enquiryType, 'Commodity enquiry')
})
