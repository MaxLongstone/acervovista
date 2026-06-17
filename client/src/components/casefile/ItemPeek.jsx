import { useEffect } from 'react'
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

function CTAButton({ color, label, onDwell }) {
  const style = color
    ? { backgroundColor: color }
    : undefined
  const cls = color
    ? 'w-full text-sm font-medium text-white rounded-md py-2.5 px-4 hover:opacity-90 transition-opacity duration-150'
    : 'w-full text-sm font-medium text-navy border border-navy/30 rounded-md py-2.5 px-4 hover:bg-navy/5 transition-colors duration-150'
  return (
    <button onClick={onDwell} style={style} className={cls}>
      {label}
    </button>
  )
}

function MissingContent({ item, t, onDwell }) {
  return (
    <>
      <p className="text-sm text-ink leading-relaxed">{item.summary}</p>
      <div className="mt-5">
        <CTAButton color="#0F1F38" label={t('peek.whereToGet')} onDwell={onDwell} />
      </div>
    </>
  )
}

function FlaggedContent({ item, t, onDwell }) {
  const conflict = item.conflict || {}
  return (
    <>
      {/* [STANCE] Two facts, stated plainly. No language implying which is correct. */}
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-1.5">
            {t('peek.onFileStates')}
          </p>
          <p className="text-sm text-ink leading-relaxed">{conflict.document_account}</p>
        </div>
        <div className="border-t border-parchment-deep pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-1.5">
            {t('peek.youDescribed')}
          </p>
          <p className="text-sm text-ink leading-relaxed">{conflict.declared_account}</p>
        </div>
      </div>
      <div className="mt-5">
        <CTAButton color="#378ADD" label={t('peek.lookMore')} onDwell={onDwell} />
      </div>
    </>
  )
}

function ConfirmedContent({ item, t, onDwell }) {
  const dateStr = item.item_date ? formatDate(item.item_date) : null
  return (
    <>
      <p className="text-sm text-ink leading-relaxed">{item.summary}</p>
      {dateStr && (
        <p className="mt-3 text-xs text-ink-light">
          <span className="font-mono uppercase tracking-wide">{t('peek.filed')} </span>
          {dateStr}
        </p>
      )}
      <div className="mt-5">
        <CTAButton color={null} label={t('peek.fullRecord')} onDwell={onDwell} />
      </div>
    </>
  )
}

export default function ItemPeek({ item, onClose, onDwell }) {
  const { t } = useLanguage()

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const color = STATE_COLOR[item.state] ?? '#888780'
  const stateLabel = t(`state.${item.state}`)

  function handleDwell() {
    onDwell(item.id)
    onClose()
  }

  function PeekContent() {
    if (item.state === 'missing') return <MissingContent item={item} t={t} onDwell={handleDwell} />
    if (item.state === 'flagged') return <FlaggedContent item={item} t={t} onDwell={handleDwell} />
    return <ConfirmedContent item={item} t={t} onDwell={handleDwell} />
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,31,56,0.75)', backdropFilter: 'blur(2px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-parchment-deep">
          <div className="flex items-start gap-2 min-w-0">
            <span className="mt-[5px] shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <div className="min-w-0">
              <p className="text-xs font-mono uppercase tracking-wide mb-0.5" style={{ color }}>
                {stateLabel}
              </p>
              <p className="text-sm font-semibold text-navy leading-snug">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('peek.close')}
            className="shrink-0 text-ink-light hover:text-navy transition-colors mt-0.5"
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <PeekContent />
        </div>
      </div>
    </div>
  )
}
