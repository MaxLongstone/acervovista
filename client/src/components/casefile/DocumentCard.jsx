import { useState } from 'react'
import { getDocument, updateDocumentType } from '../../api'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, badgeColorClass } from '../../documentTypes'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`
}

export default function DocumentCard({ caseId, document, onDocumentTypeChange, index = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [ocrText, setOcrText] = useState(null)
  const [isLoadingOcr, setIsLoadingOcr] = useState(false)

  if (document.status === 'processing') {
    return (
      <div className="bg-white border border-parchment-deep rounded-md p-4 animate-signature"
        style={{ animationDelay: `${index * 80}ms` }}>
        <p className="text-sm text-ink">{document.filename}</p>
        <p className="text-xs text-ink-light mt-1">Reading document…</p>
      </div>
    )
  }

  const toggleExpanded = async () => {
    if (!isExpanded && ocrText === null) {
      setIsLoadingOcr(true)
      try {
        const full = await getDocument(caseId, document.id)
        setOcrText(full.ocr_text || '')
      } catch {
        setOcrText('')
      } finally {
        setIsLoadingOcr(false)
      }
    }
    setIsExpanded((v) => !v)
  }

  const handleTypeChange = async (e) => {
    const updated = await updateDocumentType(caseId, document.id, e.target.value)
    onDocumentTypeChange(updated)
  }

  return (
    <div
      className="bg-white border border-parchment-deep rounded-md p-4 space-y-2
                 hover:border-navy-light transition-colors duration-150 animate-signature"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Badge + filename */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${badgeColorClass(document.document_type)}`}>
          {DOCUMENT_TYPE_LABELS[document.document_type]}
        </span>
        <span className="text-sm font-medium text-navy truncate">{document.filename}</span>
      </div>

      {/* Date */}
      {document.extracted_date && (
        <p className="font-mono text-[11px] text-ink-light">
          Dated {formatDate(document.extracted_date)}
        </p>
      )}

      {/* Unknown type — classify */}
      {document.document_type === 'unknown' && (
        <div className="space-y-1 pt-1">
          <p className="text-sm text-ink-mid">
            We couldn't tell what kind of document this is. Can you help classify it?
          </p>
          <select
            onChange={handleTypeChange}
            defaultValue=""
            className="text-sm border border-parchment-deep rounded-md px-2 py-1.5 bg-white text-ink
                       focus:outline-none focus:ring-1 focus:ring-navy transition-colors duration-150"
          >
            <option value="" disabled>Choose a document type</option>
            {DOCUMENT_TYPES.filter((t) => t !== 'unknown').map((t) => (
              <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      )}

      {/* OCR expand */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="text-xs text-navy-light underline underline-offset-2 hover:text-navy transition-colors duration-150"
      >
        {isExpanded ? 'Hide extracted text' : 'Show extracted text'}
      </button>

      {isExpanded && (
        <div className="text-xs text-ink-mid bg-parchment rounded-md p-3 whitespace-pre-wrap
                        border border-parchment-deep font-mono leading-relaxed animate-settle">
          {isLoadingOcr ? 'Loading…' : ocrText || 'No text was found in this document.'}
        </div>
      )}
    </div>
  )
}
