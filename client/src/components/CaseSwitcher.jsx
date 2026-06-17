import { useEffect, useRef, useState } from 'react'
import { listCases } from '../api'
import { useLanguage } from '../i18n/LanguageContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function CaseSwitcher({ currentCaseId, onSelect, onClose }) {
  const { t } = useLanguage()
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const overlayRef = useRef(null)

  useEffect(() => {
    listCases()
      .then(setCases)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Close on backdrop click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 pt-20 px-4 animate-settle"
      aria-modal="true"
      role="dialog"
      aria-label={t('switcher.title')}
    >
      <div className="bg-white rounded-lg border border-parchment-deep w-full max-w-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-deep">
          <h2 className="font-display font-bold text-[17px] text-navy">
            {t('switcher.title')}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded text-ink-light
                       hover:text-navy hover:bg-parchment transition-colors duration-150"
          >
            {/* Tabler x */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Case list */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading && (
            <p className="px-6 py-8 text-sm text-ink-light text-center">{t('loading')}</p>
          )}
          {!loading && cases.length === 0 && (
            <p className="px-6 py-8 text-sm text-ink-light text-center">{t('switcher.empty')}</p>
          )}
          {!loading && cases.map((c) => {
            const isCurrent  = c.id === currentCaseId
            const isClosed   = Boolean(c.closed_at)
            const jurisdictions = c.jurisdictions ?? []

            return (
              <div
                key={c.id}
                className={`flex items-center gap-4 px-6 py-4 border-b border-parchment-deep last:border-0
                            transition-colors duration-150
                            ${isClosed ? 'opacity-50' : 'hover:bg-parchment/50'}`}
              >
                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-medium truncate
                                 ${isClosed ? 'text-ink-mid' : 'text-navy'}`}>
                    {c.decedent_name}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="text-[12px] text-ink-light font-mono">
                      {t('switcher.opened')} {formatDate(c.intake_completed_at)}
                    </span>
                    {jurisdictions.map((j) => (
                      <span key={j}
                        className="text-[11px] text-ink-light border border-parchment-deep
                                   rounded-full px-1.5 py-px">
                        {j}
                      </span>
                    ))}
                    {isClosed && (
                      <span className="text-[11px] text-ink-light italic">
                        {t('switcher.closed')}
                      </span>
                    )}
                    {isCurrent && !isClosed && (
                      <span className="text-[11px] text-present font-medium">
                        {t('switcher.active')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enter button — disabled for current or closed */}
                {!isCurrent && !isClosed && (
                  <button
                    onClick={() => { onSelect(c.id); onClose() }}
                    className="shrink-0 text-sm text-navy border border-navy/30 rounded-md
                               px-3 h-8 hover:bg-navy hover:text-parchment
                               transition-colors duration-150"
                  >
                    {t('switcher.enter')}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
