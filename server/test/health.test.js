import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.signature'

test('GET /health returns ok status', async () => {
  const { default: app } = await import('../src/index.js')
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, resolve))

  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/health`)
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.status, 'ok')
    assert.ok(typeof body.timestamp === 'string')
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
