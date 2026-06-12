const API_BASE = 'http://localhost:3001'

export async function createCase(payload) {
  const res = await fetch(`${API_BASE}/api/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error('Failed to create case')
  }
  return res.json()
}

export async function getCase(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}`)
  if (!res.ok) {
    throw new Error('Failed to load case')
  }
  return res.json()
}
