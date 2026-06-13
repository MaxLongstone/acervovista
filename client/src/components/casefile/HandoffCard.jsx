import { useState } from 'react'
import { generateHandoff } from '../../api'

export default function HandoffCard({ caseId }) {
  const [status, setStatus] = useState('idle') // idle | loading | error

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
    <section className="border border-gray rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg text-navy">Lawyer Handoff Package</h2>
            <span className="rounded bg-navy px-2 py-0.5 text-xs font-bold text-white">$29</span>
          </div>
          <p className="mt-1 text-sm text-ink">
            Everything a lawyer needs on day one — case summary, timeline, documents,
            gap analysis, and complexity flags. Formatted and ready to share.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={status === 'loading'}
          className="shrink-0 rounded bg-navy px-4 py-2 text-sm text-white font-medium hover:bg-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {status === 'loading' ? 'Generating…' : 'Generate PDF'}
        </button>
      </div>

      {status === 'loading' && (
        <p className="border-t border-gray bg-gray px-5 py-2 text-sm text-ink">
          Generating your handoff package…
        </p>
      )}
      {status === 'error' && (
        <p className="border-t border-gray bg-gray px-5 py-2 text-sm text-red">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="border-t border-gray px-5 py-2.5 text-xs text-ink/60">
        The handoff package is formatted for a lawyer's first-day review. It does not contain
        legal advice or conclusions.
      </p>
    </section>
  )
}
