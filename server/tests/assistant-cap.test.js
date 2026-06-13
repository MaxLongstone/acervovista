import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { app } from '../app.js'
import { pool } from '../db/pool.js'

let server
let baseUrl
let caseId

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve)
  })
  const { port } = server.address()
  baseUrl = `http://localhost:${port}`

  const res = await fetch(`${baseUrl}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decedentName: 'Assistant Cap Test Decedent',
      dateOfDeath: '2024-01-01',
      heirs: [{ fullName: 'Test Heir', relationship: 'Child', residence: 'FL' }],
    }),
  })
  const body = await res.json()
  caseId = body.id
})

after(async () => {
  await pool.query('DELETE FROM cases WHERE id = $1', [caseId])
  await pool.end()
  await new Promise((resolve) => server.close(resolve))
})

test('enforces the assistant turn cap', async () => {
  for (let i = 1; i <= 50; i++) {
    const res = await fetch(`${baseUrl}/api/cases/${caseId}/assistant`, { method: 'POST' })
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.deepEqual(body, { turns_used: i, cap: 50, remaining: 50 - i })
  }

  const res = await fetch(`${baseUrl}/api/cases/${caseId}/assistant`, { method: 'POST' })
  assert.equal(res.status, 429)
  const body = await res.json()
  assert.deepEqual(body, {
    error: 'cap_reached',
    turns_used: 50,
    cap: 50,
    message: 'You have used all 50 included assistant turns for this case.',
  })

  const dbResult = await pool.query(
    'SELECT assistant_turns_used FROM cases WHERE id = $1',
    [caseId]
  )
  assert.equal(dbResult.rows[0].assistant_turns_used, 50)
})
