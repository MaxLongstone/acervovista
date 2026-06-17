import { useEffect, useRef, useState } from 'react'
import { getCaseItems } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'
import SealIsotype from '../SealIsotype'

const STATE_COLOR = {
  confirmed: '#1D9E75',
  pending:   '#B8860B',
  missing:   '#E24B4A',
  flagged:   '#378ADD',
  unknown:   '#888780',
}

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Breath banner — shown for flagged items ───────────────────────────────────

function BreathBanner({ text, onDismiss }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="flex items-center gap-3 bg-white border border-parchment-deep rounded-lg px-4 py-3 mb-8">
      <SealIsotype size={20} className="shrink-0 opacity-60" />
      <p className="flex-1 text-sm text-ink-mid font-sans">{text}</p>
      <button
        onClick={() => { setVisible(false); onDismiss?.() }}
        className="shrink-0 text-ink-light hover:text-navy transition-colors text-xs font-mono uppercase tracking-wide"
      >
        OK
      </button>
    </div>
  )
}

// ── Self-serve step ───────────────────────────────────────────────────────────

function SelfServeStep({ number, title, desc, action }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-6 h-6 rounded-full bg-parchment-deep flex items-center justify-center">
        <span className="font-mono text-[10px] text-ink-mid">{number}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy mb-1">{title}</p>
        <p className="text-sm text-ink-mid leading-relaxed mb-3">{desc}</p>
        {action}
      </div>
    </div>
  )
}

// ── Flagged dwell layout ──────────────────────────────────────────────────────

function FlaggedDwell({ item, t, onBack }) {
  const conflict = item.conflict || {}

  return (
    <div className="space-y-8">

      {/* Breath banner */}
      <BreathBanner text={t('dwell.breathFlag')} />

      {/* Two accounts */}
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4">
          Two accounts of the same property
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-parchment-deep rounded-lg p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
              {t('dwell.onFileStates')}
            </p>
            <p className="text-sm text-ink leading-relaxed">{conflict.document_account}</p>
          </div>
          <div className="bg-white border border-parchment-deep rounded-lg p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
              {t('dwell.youDescribed')}
            </p>
            <p className="text-sm text-ink leading-relaxed">{conflict.declared_account}</p>
          </div>
        </div>
      </div>

      {/* Limit of knowledge — verbatim */}
      <div className="bg-parchment border border-parchment-deep rounded-lg px-5 py-4">
        <p className="text-sm text-ink-mid leading-relaxed italic">
          {t('dwell.limitOfKnowledge')}
        </p>
      </div>

      {/* Resolution paths — self-serve first */}
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-5">
          {t('dwell.whatYouCanDo')}
        </h2>
        <div className="space-y-6">
          <SelfServeStep
            number="1"
            title={t('dwell.selfServe1.title')}
            desc={t('dwell.selfServe1.desc')}
            action={
              <a
                href="https://onlineservices.miamidadeclerk.com/officialrecords/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-navy font-medium underline underline-offset-2
                           hover:text-navy-mid transition-colors"
              >
                {t('dwell.selfServe1.link')}
              </a>
            }
          />
          <SelfServeStep
            number="2"
            title={t('dwell.selfServe2.title')}
            desc={t('dwell.selfServe2.desc')}
            action={
              <button className="text-xs font-medium text-navy border border-navy/30 rounded-md
                                  px-3 py-1.5 hover:bg-navy/5 transition-colors">
                {t('dwell.selfServe2.cta')}
              </button>
            }
          />
        </div>
      </div>

      {/* Gold lawyer band — escalating, both possibilities held open */}
      <div className="rounded-lg border border-[#B8860B]/40 bg-[#B8860B]/6 px-5 py-5">
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-[3px] w-2 h-2 rounded-full bg-[#B8860B]" />
          <p className="text-sm text-ink leading-relaxed">
            {t('dwell.lawyerBand')}
          </p>
        </div>
      </div>

      {/* Where this touches the rest */}
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-3">
          {t('dwell.touches')}
        </h2>
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-navy hover:text-navy-mid
                       transition-colors group"
          >
            <span className="w-2 h-2 rounded-full bg-[#378ADD] shrink-0" />
            <span className="underline underline-offset-2 group-hover:no-underline">
              {t('dwell.touchTimeline')}
            </span>
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-navy hover:text-navy-mid
                       transition-colors group"
          >
            <span className="w-2 h-2 rounded-full bg-ink-light shrink-0" />
            <span className="underline underline-offset-2 group-hover:no-underline">
              {t('dwell.touchEstimate')}
            </span>
          </button>
        </div>
      </div>

    </div>
  )
}

// ── Default dwell layout (confirmed / pending / missing / unknown) ─────────────

function DefaultDwell({ item, t }) {
  const dateStr = item.item_date ? formatDate(item.item_date) : null
  return (
    <div className="bg-white border border-parchment-deep rounded-xl p-6 space-y-5">
      {item.summary && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">About</p>
          <p className="text-sm text-ink leading-relaxed">{item.summary}</p>
        </div>
      )}
      {dateStr && (
        <div className="border-t border-parchment-deep pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">Filed</p>
          <p className="text-sm text-navy">{dateStr}</p>
        </div>
      )}
      <div className="border-t border-parchment-deep pt-5 flex flex-wrap gap-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">Type</p>
          <p className="text-xs text-navy">{t(`type.${item.item_type}`)}</p>
        </div>
        {item.jurisdiction && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">Jurisdiction</p>
            <p className="text-xs text-navy">{item.jurisdiction}</p>
          </div>
        )}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">Source</p>
          <p className="text-xs text-navy capitalize">{item.provenance}</p>
        </div>
      </div>
    </div>
  )
}

// ── Page shell ────────────────────────────────────────────────────────────────

export default function ItemDwellPage({ caseId, itemId, onBack, onBreathTrigger }) {
  const { t } = useLanguage()
  const [item, setItem] = useState(null)
  const breathFired = useRef(false)

  useEffect(() => {
    getCaseItems(caseId)
      .then(items => {
        const found = items.find(i => i.id === itemId) ?? null
        setItem(found)
        if (found?.state === 'flagged' && !breathFired.current) {
          breathFired.current = true
          onBreathTrigger?.('flagged-dwell')
        }
      })
      .catch(() => {})
  }, [caseId, itemId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment">
        <p className="text-ink-light font-mono text-sm tracking-wide">{t('loading')}</p>
      </div>
    )
  }

  const color = STATE_COLOR[item.state] ?? '#888780'
  const stateLabel = t(`state.${item.state}`)

  return (
    <div className="min-h-[calc(100vh-56px)] bg-parchment px-4 py-10">
      <div className="max-w-xl mx-auto">

        {/* Breadcrumb */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-ink-light hover:text-navy
                     transition-colors font-mono uppercase tracking-wide mb-8"
        >
          <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
            <path fillRule="evenodd" d="M9.354 3.646a.5.5 0 010 .708L5.707 8l3.647 3.646a.5.5 0 01-.708.708l-4-4a.5.5 0 010-.708l4-4a.5.5 0 01.708 0z" clipRule="evenodd"/>
          </svg>
          {t('dwell.back')}
        </button>

        {/* Header: seal + title + state pill */}
        <div className="flex items-start gap-4 mb-8">
          <SealIsotype size={36} className="shrink-0 mt-1" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wide
                           px-2 py-0.5 rounded-full border"
                style={{ color, borderColor: color, backgroundColor: `${color}15` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {stateLabel}
              </span>
            </div>
            <h1 className="font-display font-bold text-2xl text-navy leading-snug">{item.title}</h1>
          </div>
        </div>

        {/* Body by state */}
        {item.state === 'flagged'
          ? <FlaggedDwell item={item} t={t} onBack={onBack} />
          : <DefaultDwell item={item} t={t} />
        }

      </div>
    </div>
  )
}
