import { useEffect, useState } from 'react'
import { getCaseItems } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'

// ── Action catalog ────────────────────────────────────────────────────────────
// Each entry: id, tier, hasScript, match(items, caseData) → bool

const CATALOG = [
  {
    id: 'deathCert',
    tier: 'self',
    hasScript: true,
    match: (items) =>
      items.some(
        (i) => /death cert/i.test(i.title) && i.state === 'missing'
      ),
  },
  {
    id: 'notifyBank',
    tier: 'self',
    hasScript: true,
    match: (items) =>
      items.some(
        (i) =>
          i.item_type === 'asset' &&
          /bank|account|savings|checking|chase|citibank|wells|fargo|deposit/i.test(
            i.title
          )
      ),
  },
  {
    id: 'deedHistory',
    tier: 'lawyer_touch',
    hasScript: false,
    match: (items) =>
      items.some((i) => i.state === 'flagged' && /deed/i.test(i.title)),
  },
  {
    id: 'declaratoria',
    tier: 'lawyer_touch',
    hasScript: true,
    match: (items) =>
      items.some((i) => /declaratoria/i.test(i.title)),
  },
]

const DOT = {
  self:         { color: '#1D9E75', labelKey: 'actions.self' },
  lawyer_touch: { color: '#B8860B', labelKey: 'actions.lawyerTouch' },
}

// ── Single action row ─────────────────────────────────────────────────────────

function ActionRow({ action, t, isOpen, onToggle }) {
  const { id, tier, hasScript } = action
  const dot = DOT[tier]
  const readyItems = t(`action.${id}.ready`).split('|')

  return (
    <div className="border-b border-parchment-deep last:border-0">
      {/* Collapsed header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 px-5 py-4 text-left
                   hover:bg-parchment/40 transition-colors"
      >
        <span
          className="mt-[4px] shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: dot.color }}
        />
        <span className="flex-1 text-sm font-medium text-navy leading-snug">
          {t(`action.${id}.title`)}
        </span>
        <span className="shrink-0 text-[11px] text-ink-light mt-[2px]">
          {isOpen ? t('actions.collapse') : t('actions.expand')}
        </span>
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div className="px-5 pb-6 space-y-4">
          {/* Tier label */}
          <p
            className="text-[10px] font-mono uppercase tracking-[0.15em]"
            style={{ color: dot.color }}
          >
            {t(dot.labelKey)}
          </p>

          {/* What it is */}
          <p className="text-sm text-ink-mid leading-relaxed">
            {t(`action.${id}.what`)}
          </p>

          {/* Have ready */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink-light mb-2">
              {t('actions.haveReady')}
            </p>
            <ul className="space-y-1">
              {readyItems.map((item, i) => (
                <li key={i} className="text-sm text-ink-mid flex gap-2 leading-snug">
                  <span className="text-ink-light shrink-0 select-none">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Time */}
          <p className="text-[11px] text-ink-light">
            <span className="font-mono uppercase tracking-[0.1em] mr-1">
              {t('actions.timeEst')}:
            </span>
            {t(`action.${id}.time`)}
          </p>

          {/* Phone script */}
          {hasScript && (
            <div className="bg-parchment rounded-lg px-4 py-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink-light mb-2">
                {t('actions.phoneScript')}
              </p>
              <p className="text-sm text-navy leading-relaxed">
                &ldquo;{t(`action.${id}.script`)}&rdquo;
              </p>
            </div>
          )}

          {/* Lawyer stop — only for lawyer_touch tier */}
          {tier === 'lawyer_touch' && (
            <div className="border-l-2 border-parchment-dark pl-3 mt-2">
              <p className="text-sm text-ink-mid leading-relaxed">
                {t('actions.lawyerStop')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ActionsCard({ caseId, caseData }) {
  const { t } = useLanguage()
  const [items, setItems] = useState(null)
  const [open, setOpen]   = useState(new Set())

  useEffect(() => {
    getCaseItems(caseId).then(setItems).catch(() => setItems([]))
  }, [caseId])

  if (!items || !caseData) return null

  const actions = CATALOG.filter((a) => a.match(items, caseData))
  if (actions.length === 0) return null

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="bg-parchment px-4 pb-10">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-parchment-deep rounded-lg overflow-hidden">

          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-parchment-deep">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
              {t('actions.title')}
            </p>
            <p className="text-sm text-ink-mid leading-relaxed mb-3">
              {t('actions.subtitle')}
            </p>
            {/* Tier legend */}
            <div className="flex flex-wrap gap-5">
              <span className="flex items-center gap-1.5 text-[11px] text-ink-mid">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#1D9E75' }} />
                {t('actions.self')}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-mid">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#B8860B' }} />
                {t('actions.lawyerTouch')}
              </span>
            </div>
          </div>

          {/* Action rows */}
          {actions.map((a) => (
            <ActionRow
              key={a.id}
              action={a}
              t={t}
              isOpen={open.has(a.id)}
              onToggle={() => toggle(a.id)}
            />
          ))}

        </div>
      </div>
    </div>
  )
}
