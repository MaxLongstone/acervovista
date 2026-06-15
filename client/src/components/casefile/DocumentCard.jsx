import { useState } from 'react'
import { getDocument, updateDocumentType, reclassifyDocument } from '../../api'
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  badgeColorClass,
  confidenceDotClass,
} from '../../documentTypes'

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Metadata fields surfaced in the UI — in display order (label → key)
const METADATA_DISPLAY = [
  ['Grantor',          'grantor'],
  ['Grantee',          'grantee'],
  ['Remainder',        'remainder'],
  ['Property',         'property_address'],
  ['Parcel ID',        'parcel_id'],
  ['Recorded',         'recorded_date'],
  ['Instrument No.',   'instrument_number'],
  ['Doc Stamps',       'doc_stamps'],
  ['Notarized',        'notarized_location'],
  ['Institution',      'institution'],
  ['Policy No.',       'policy_number'],
  ['Account (last 4)', 'account_number'],
]

export default function DocumentCard({ caseId, document, onDocumentTypeChange, index = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [ocrText, setOcrText] = useState(null)
  const [isLoadingOcr, setIsLoadingOcr] = useState(false)
  const [isReclassifying, setIsReclassifying] = useState(false)

  if (document.status === 'processing') {
    return (
      <div
        className="bg-white border border-parchment-deep rounded-md p-4 animate-signature"
        style={{ animationDelay: `${index * 80}ms` }}
      >
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

  const handleReclassify = async () => {
    setIsReclassifying(true)
    try {
      const updated = await reclassifyDocument(caseId, document.id)
      onDocumentTypeChange(updated)
    } catch {
      // silent — user can retry
    } finally {
      setIsReclassifying(false)
    }
  }

  // Metadata object from the document (may be null/empty)
  const meta = document.document_metadata || {}
  const metaEntries = METADATA_DISPLAY.filter(([, key]) => meta[key])
  const confidence = document.classification_confidence
  const layer = document.classification_layer
  const language = document.document_language
  const jurisdiction = document.document_jurisdiction
  const summary = document.plain_language_summary

  return (
    <div
      className="bg-white border border-parchment-deep rounded-md p-4 space-y-2.5
                 hover:border-navy-light transition-colors duration-150 animate-signature"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Row 1: Badge + filename + confidence dot */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm
                      ${badgeColorClass(document.document_type)}`}
        >
          {DOCUMENT_TYPE_LABELS[document.document_type] ?? document.document_type}
        </span>
        <span className="text-sm font-medium text-navy truncate flex-1">{document.filename}</span>
        {confidence && (
          <span className="flex items-center gap-1 shrink-0" title={`Classified by ${layer ?? 'keyword'} · ${confidence} confidence`}>
            <span className={`w-1.5 h-1.5 rounded-full ${confidenceDotClass(confidence)}`} />
          </span>
        )}
        <button
          type="button"
          onClick={handleReclassify}
          disabled={isReclassifying}
          title="Re-run AI classification"
          className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-ink-light
                     hover:text-navy transition-colors duration-150 disabled:opacity-40"
        >
          {isReclassifying ? '…' : '↻'}
        </button>
      </div>

      {/* Row 2: Date · Language · Jurisdiction badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {document.extracted_date && (
          <p className="font-mono text-[11px] text-ink-light">
            Dated {formatDate(document.extracted_date)}
          </p>
        )}
        {language && (
          <span className="font-mono text-[9px] uppercase tracking-wider bg-parchment-deep text-ink-mid px-1.5 py-0.5 rounded-sm">
            {language === 'en' ? 'English' : language.toUpperCase()}
          </span>
        )}
        {jurisdiction && (
          <span className="font-mono text-[9px] uppercase tracking-wider bg-parchment-deep text-ink-mid px-1.5 py-0.5 rounded-sm">
            {jurisdiction}
          </span>
        )}
      </div>

      {/* Plain-language summary (Claude layer only) */}
      {summary && (
        <p className="text-[13px] text-ink-mid leading-[1.65]">{summary}</p>
      )}

      {/* Metadata key-values */}
      {metaEntries.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
          {metaEntries.map(([label, key]) => (
            <span key={key} className="contents">
              <dt className="font-mono text-[10px] text-ink-light uppercase tracking-wider self-baseline pt-0.5">
                {label}
              </dt>
              <dd className="text-[12px] text-ink-mid">{meta[key]}</dd>
            </span>
          ))}
        </dl>
      )}

      {/* Unknown type — manual classify */}
      {document.document_type === 'unknown' && (
        <div className="space-y-1 pt-0.5">
          <p className="text-sm text-ink-mid">
            We couldn't identify this document. Can you help classify it?
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
        <div
          className="text-xs text-ink-mid bg-parchment rounded-md p-3 whitespace-pre-wrap
                     border border-parchment-deep font-mono leading-relaxed animate-settle"
        >
          {isLoadingOcr ? 'Loading…' : ocrText || 'No text was found in this document.'}
        </div>
      )}
    </div>
  )
}
