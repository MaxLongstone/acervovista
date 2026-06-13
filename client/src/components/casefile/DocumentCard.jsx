import { useState } from 'react'
import { getDocument, updateDocumentType } from '../../api'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, badgeColorClass } from '../../documentTypes'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

export default function DocumentCard({ caseId, document, onDocumentTypeChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [ocrText, setOcrText] = useState(null)
  const [isLoadingOcr, setIsLoadingOcr] = useState(false)

  if (document.status === 'processing') {
    return (
      <div className="bg-gray rounded p-4">
        <p className="text-sm text-ink">{document.filename}</p>
        <p className="text-sm text-ink mt-1">Processing...</p>
      </div>
    )
  }

  const toggleExpanded = async () => {
    if (!isExpanded && ocrText === null) {
      setIsLoadingOcr(true)
      try {
        const fullDocument = await getDocument(caseId, document.id)
        setOcrText(fullDocument.ocr_text || '')
      } catch {
        setOcrText('')
      } finally {
        setIsLoadingOcr(false)
      }
    }
    setIsExpanded((expanded) => !expanded)
  }

  const handleTypeChange = async (event) => {
    const newType = event.target.value
    const updated = await updateDocumentType(caseId, document.id, newType)
    onDocumentTypeChange(updated)
  }

  return (
    <div className="bg-gray rounded p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeColorClass(document.document_type)}`}>
          {DOCUMENT_TYPE_LABELS[document.document_type]}
        </span>
        <span className="text-sm text-ink">{document.filename}</span>
      </div>

      {document.extracted_date && (
        <p className="text-sm text-ink">Dated {formatDate(document.extracted_date)}</p>
      )}

      {document.document_type === 'unknown' && (
        <div className="space-y-1">
          <p className="text-sm text-ink">
            We couldn't tell what kind of document this is. Can you help us classify it?
          </p>
          <select
            onChange={handleTypeChange}
            defaultValue=""
            className="text-sm border border-ink rounded px-2 py-1 bg-white text-ink"
          >
            <option value="" disabled>
              Choose a document type
            </option>
            {DOCUMENT_TYPES.filter((type) => type !== 'unknown').map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={toggleExpanded}
        className="text-sm text-navy underline"
      >
        {isExpanded ? 'Hide what we read' : 'What we read'}
      </button>

      {isExpanded && (
        <div className="text-sm text-ink bg-white rounded p-3 whitespace-pre-wrap">
          {isLoadingOcr ? 'Loading...' : ocrText || 'No text was found in this document.'}
        </div>
      )}
    </div>
  )
}
