import { useState } from 'react'
import { generateHandoff } from '../../api'

export default function HandoffCard({ caseId }) {
  const [status, setStatus] = useState('idle')

  async function handleGenerate() {
    setStatus('loading')
    try {
      const blob = await generateHandoff(caseId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `handoff-${caseId}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-white border border-parchment-deep rounded-lg overflow-hidden">
      <div className="px-5 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display text-[17px] font-semibold text-navy">
              Lawyer Handoff Package
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider
                             bg-navy text-parchment px-2 py-0.5 rounded-sm">
              $29
            </span>
          </div>
          <p className="text-sm text-ink-mid leading-[1.7]">
            Everything a lawyer needs on day one — case summary, timeline,
            documents, gap analysis, and complexity flags. Formatted and ready to share.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={status === 'loading'}
          className="shrink-0 bg-navy text-parchment px-4 h-11 rounded-md text-sm font-medium
                     hover:bg-navy-mid transition-colors duration-150
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Generating…' : 'Generate PDF'}
        </button>
      </div>

      {status === 'loading' && (
        <p className="border-t border-parchment-deep bg-parchment px-5 py-2.5 text-sm text-ink-mid">
          Generating your handoff package…
        </p>
      )}
      {status === 'error' && (
        <p className="border-t border-parchment-deep bg-parchment px-5 py-2.5 text-sm text-ink-mid">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="border-t border-parchment-deep px-5 py-3 text-xs text-ink-light">
        The handoff package is formatted for a lawyer's first-day review.
        It does not contain legal advice or conclusions.
      </p>
    </section>
  )
}
