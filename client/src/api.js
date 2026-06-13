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

export function uploadDocument(caseId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/api/cases/${caseId}/documents`)

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('Failed to upload document'))
      }
    }
    xhr.onerror = () => reject(new Error('Failed to upload document'))

    xhr.send(formData)
  })
}

export async function listDocuments(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/documents`)
  if (!res.ok) {
    throw new Error('Failed to load documents')
  }
  return res.json()
}

export async function getDocument(caseId, documentId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/documents/${documentId}`)
  if (!res.ok) {
    throw new Error('Failed to load document')
  }
  return res.json()
}

export async function updateDocumentType(caseId, documentId, documentType) {
  const res = await fetch(
    `${API_BASE}/api/cases/${caseId}/documents/${documentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_type: documentType }),
    }
  )
  if (!res.ok) {
    throw new Error('Failed to update document type')
  }
  return res.json()
}

export async function getGapMap(caseId) {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/gap-map`)
  if (!res.ok) {
    throw new Error('Failed to load gap map')
  }
  return res.json()
}
