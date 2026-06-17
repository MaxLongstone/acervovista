import { useEffect, useRef, useState } from 'react'
import { getEstimate } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'
import EstimatePopup from './EstimatePopup'

function formatCents(cents, currency = 'USD') {
  const dollars = Math.abs(cents) / 100
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K`
  return `$${Math.round(dollars)}`
}

export default function EstimateCard({ caseId }) {
  const { t } = useLanguage()
  const [data, setData]       = useState(null)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    getEstimate(caseId).then(setData).catch(() => {})
  }, [caseId])

  if (!data || (data.low_cents === 0 && data.high_cents === 0)) return null

  const low  = formatCents(data.low_cents,  data.currency)
  const high = formatCents(data.high_cents, data.currency)
  const headline = t('estimate.headline', { low, high })
  const confidenceLine = t(`estimate.confidence.${data.confidence}`)

  return (
    <>
      <div className="bg-parchment px-4 pb-10">
        <div className="max-w-xl mx-auto">
          <div className="bg-white border border-parchment-deep rounded-lg p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">
              {t('estimate.cardTitle')}
            </p>
            <p className="font-display font-bold text-2xl text-navy leading-snug mb-1">
              {headline}
            </p>
            <p className="text-sm text-ink-mid leading-relaxed mb-4">
              {confidenceLine}
            </p>
            <button
              onClick={() => setOpen(true)}
              className="text-xs font-medium text-navy hover:text-navy-mid transition-colors underline underline-offset-2"
            >
              {t('estimate.seeBreakdown')}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <EstimatePopup data={data} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
