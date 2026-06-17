import { useEffect, useState } from 'react'
import { getStanding } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'

// State token → display config
const STATE_CONFIG = [
  { key: 'confirmed',  labelKey: 'standing.confirmed',     color: '#1D9E75' },
  { key: 'pending',    labelKey: 'standing.pending',       color: '#B8860B' },
  { key: 'missing',    labelKey: 'standing.missing.label', color: '#E24B4A' },
  { key: 'flagged',    labelKey: 'standing.flagged',       color: '#378ADD' },
  { key: 'unknown',    labelKey: 'standing.unknown',       color: '#888780' },
]

// Priority type → dot color
const PRIORITY_COLOR = {
  deadline: '#C0392B',  // stamp red — time-sensitive
  missing:  '#0F1F38',  // navy — blue routine
  conflict: '#378ADD',  // flagged blue — calmest
}

function strengthTier(confirmed) {
  if (confirmed >= 7) return 'strong'
  if (confirmed >= 3) return 'mid'
  return 'thin'
}

export default function CaseStanding({ caseId }) {
  const { t } = useLanguage()
  const [data, setData] = useState(null)

  useEffect(() => {
    getStanding(caseId).then(setData).catch(() => {})
  }, [caseId])

  if (!data) return null

  const { counts, priority } = data
  const tier = strengthTier(counts.confirmed)

  const reassure = t(`standing.${tier}`)
  const orient = t('standing.orient')

  let pointText = null
  let pointColor = null
  if (priority) {
    pointText = t(`standing.${priority.type}`, { title: priority.title })
    pointColor = PRIORITY_COLOR[priority.type]
  }

  return (
    <div className="bg-parchment px-4 pt-10 pb-8">
      <div className="max-w-xl mx-auto">

        {/* Beat 1 + 2: reassure + orient */}
        <p className="font-display italic text-2xl text-navy leading-snug mb-1">
          {reassure}
        </p>
        <p className="font-sans text-sm text-ink-mid mb-4">
          {orient}
        </p>

        {/* Beat 3: single priority flag */}
        {pointText && (
          <div className="flex items-start gap-2 mb-8">
            <span
              className="mt-[5px] shrink-0 w-2 h-2 rounded-full"
              style={{ backgroundColor: pointColor }}
            />
            <p className="font-sans text-sm text-ink leading-relaxed">
              {pointText}
            </p>
          </div>
        )}

        {/* Five-state counts row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {STATE_CONFIG.map(({ key, labelKey, color }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-mono text-xs text-ink-mid tabular-nums">
                {counts[key] ?? 0}
              </span>
              <span className="font-sans text-xs text-ink-light">
                {t(labelKey)}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
