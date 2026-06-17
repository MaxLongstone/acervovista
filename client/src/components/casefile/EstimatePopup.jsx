import { useEffect, useRef } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'

function formatCents(cents, currency = 'USD') {
  const dollars = Math.abs(cents) / 100
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K`
  return `$${Math.round(dollars)}`
}

// ── Provenance badge ──────────────────────────────────────────────────────────

function ProvenanceBadge({ provenance, t }) {
  const isDocument = provenance === 'document'
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-mono"
      style={{ color: isDocument ? '#1D9E75' : '#888780' }}
      title={t(`estimate.provenance.${provenance}`)}
    >
      {isDocument ? (
        // File-check icon
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M9.293 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.707L9.293 1zM9 2l3 3h-3V2zM6.5 10.5l-1.5-1.5.707-.707L6.5 9.086l2.793-2.793.707.707L6.5 10.5z"/>
        </svg>
      ) : (
        // Message-dots icon
        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
          <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5l1.5 1.5 1.5-1.5H14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm4 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </svg>
      )}
    </span>
  )
}

// ── Line item ─────────────────────────────────────────────────────────────────

function LineItem({ item, negative, t }) {
  const sign   = negative ? '−' : '+'
  const color  = negative ? '#E24B4A' : '#0F1F38'
  const amount = formatCents(item.value_cents, item.currency)

  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-parchment-deep last:border-0">
      <ProvenanceBadge provenance={item.provenance} t={t} />
      <p className="flex-1 text-sm text-navy leading-snug">{item.title}</p>
      <span className="shrink-0 font-mono text-sm" style={{ color }}>
        {negative ? '−' : ''}{amount}
      </span>
    </div>
  )
}

// ── Popup shell ───────────────────────────────────────────────────────────────

export default function EstimatePopup({ data, onClose }) {
  const { t } = useLanguage()
  const panelRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    const onMouse = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', onMouse)
    return () => document.removeEventListener('mousedown', onMouse)
  }, [onClose])

  const lowNet  = formatCents(data.low_cents,  data.currency)
  const highNet = formatCents(data.high_cents, data.currency)
  const netRange = `${lowNet}–${highNet}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(15,31,56,0.75)', backdropFilter: 'blur(2px)' }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-md bg-parchment rounded-t-2xl sm:rounded-2xl
                   max-h-[85vh] overflow-y-auto shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-parchment border-b border-parchment-deep px-5 pt-5 pb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light">
            {t('estimate.cardTitle')}
          </p>
          <button
            onClick={onClose}
            className="text-ink-light hover:text-navy transition-colors text-xs font-mono uppercase tracking-wide"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-6 space-y-6 pt-5">

          {/* Estimated assets */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
              {t('estimate.assets')}
            </p>
            {data.assets.length === 0
              ? <p className="text-sm text-ink-mid">{t('estimate.noItems')}</p>
              : data.assets.map((a, i) => (
                  <LineItem key={i} item={a} negative={false} t={t} />
                ))
            }
          </div>

          {/* Estimated reductions — only if debts exist */}
          {data.debts.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
                {t('estimate.debts')}
              </p>
              {data.debts.map((d, i) => (
                <LineItem key={i} item={d} negative={true} t={t} />
              ))}
            </div>
          )}

          {/* Estimated net — range, bold */}
          <div className="border-t-2 border-parchment-deep pt-4">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light">
                {t('estimate.net')}
              </p>
              <p className="font-display font-bold text-xl text-navy">
                {netRange}
              </p>
            </div>
          </div>

          {/* Provenance legend */}
          <div className="flex items-center gap-5 text-[11px] text-ink-mid font-mono">
            <span className="flex items-center gap-1.5" style={{ color: '#1D9E75' }}>
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                <path d="M9.293 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.707L9.293 1zM9 2l3 3h-3V2zM6.5 10.5l-1.5-1.5.707-.707L6.5 9.086l2.793-2.793.707.707L6.5 10.5z"/>
              </svg>
              {t('estimate.provenance.document')}
            </span>
            <span className="flex items-center gap-1.5" style={{ color: '#888780' }}>
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5l1.5 1.5 1.5-1.5H14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm4 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm2 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {t('estimate.provenance.declared')}
            </span>
          </div>

          {/* Footer — not a valuation, not legal or tax advice */}
          <p className="text-[11px] text-ink-light leading-relaxed border-t border-parchment-deep pt-4">
            {t('estimate.footer')}
          </p>

        </div>
      </div>
    </div>
  )
}
