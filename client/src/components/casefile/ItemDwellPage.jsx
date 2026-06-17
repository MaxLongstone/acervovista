import { useEffect, useState } from 'react'
import { getCaseItems } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'

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

export default function ItemDwellPage({ caseId, itemId, onBack }) {
  const { t } = useLanguage()
  const [item, setItem] = useState(null)

  useEffect(() => {
    getCaseItems(caseId).then(items => {
      setItem(items.find(i => i.id === itemId) ?? null)
    }).catch(() => {})
  }, [caseId, itemId])

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment">
        <p className="text-ink-light font-mono text-sm tracking-wide">{t('loading')}</p>
      </div>
    )
  }

  const color = STATE_COLOR[item.state] ?? '#888780'
  const stateLabel = t(`state.${item.state}`)
  const conflict = item.conflict

  return (
    <div className="min-h-[calc(100vh-56px)] bg-parchment px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-ink-light hover:text-navy
                     transition-colors font-mono uppercase tracking-wide mb-8"
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path fillRule="evenodd" d="M9.354 3.646a.5.5 0 010 .708L5.707 8l3.647 3.646a.5.5 0 01-.708.708l-4-4a.5.5 0 010-.708l4-4a.5.5 0 01.708 0z" clipRule="evenodd"/>
          </svg>
          Back
        </button>

        {/* State + title */}
        <div className="flex items-start gap-3 mb-6">
          <span className="mt-2 shrink-0 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <div>
            <p className="text-xs font-mono uppercase tracking-wide mb-1" style={{ color }}>
              {stateLabel}
            </p>
            <h1 className="font-display font-bold text-2xl text-navy leading-snug">{item.title}</h1>
          </div>
        </div>

        <div className="bg-white border border-parchment-deep rounded-xl p-6 space-y-6">

          {/* Summary */}
          {item.summary && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">
                About this item
              </p>
              <p className="text-sm text-ink leading-relaxed">{item.summary}</p>
            </div>
          )}

          {/* Date */}
          {item.item_date && (
            <div className="border-t border-parchment-deep pt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
                {t('peek.filed')}
              </p>
              <p className="text-sm text-navy">{formatDate(item.item_date)}</p>
            </div>
          )}

          {/* Conflict — two facts, stated plainly [STANCE] */}
          {conflict && (
            <div className="border-t border-parchment-deep pt-5 space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">
                  {t('peek.onFileStates')}
                </p>
                <p className="text-sm text-ink leading-relaxed">{conflict.document_account}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">
                  {t('peek.youDescribed')}
                </p>
                <p className="text-sm text-ink leading-relaxed">{conflict.declared_account}</p>
              </div>
              <div className="bg-parchment rounded-lg p-4">
                <p className="text-xs text-ink-mid leading-relaxed">
                  {t('conflict.limitOfKnowledge')}
                </p>
              </div>
            </div>
          )}

          {/* Metadata row */}
          <div className="border-t border-parchment-deep pt-5 flex flex-wrap gap-4">
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
      </div>
    </div>
  )
}
