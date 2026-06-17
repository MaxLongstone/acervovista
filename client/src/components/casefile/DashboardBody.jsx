import { useEffect, useState } from 'react'
import { getCaseItems } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'
import ItemPeek from './ItemPeek'

const STATE_COLOR = {
  confirmed: '#1D9E75',
  pending:   '#B8860B',
  missing:   '#E24B4A',
  flagged:   '#378ADD',
  unknown:   '#888780',
}

const FILE_PREVIEW = 5   // rows shown in left column before "View all"
const TIME_PREVIEW = 5   // nodes shown in right column before "Full timeline"

// File column order: flagged first (needs attention), missing next, rest after
function fileOrder(item) {
  if (item.state === 'flagged')  return 0
  if (item.state === 'missing')  return 1
  if (item.state === 'pending')  return 2
  if (item.state === 'unknown')  return 3
  return 4
}

function formatDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Left column: file rows ────────────────────────────────────────────────────

function FileRow({ item, t, onClick }) {
  const color = STATE_COLOR[item.state]
  const stateLabel = t(`state.${item.state}`)

  return (
    <div
      className="flex items-start gap-3 py-3 border-b border-parchment-deep last:border-0 cursor-pointer hover:bg-parchment/50 -mx-2 px-2 rounded transition-colors duration-100"
      onClick={onClick}
    >
      <span
        className="mt-[5px] shrink-0 w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy font-medium leading-snug truncate">{item.title}</p>
      </div>
      <span
        className="shrink-0 text-xs font-mono mt-[2px]"
        style={{ color }}
      >
        {stateLabel}
      </span>
    </div>
  )
}

// ── Right column: timeline nodes ──────────────────────────────────────────────

function TimelineNode({ item, isLast, t, onClick }) {
  const color = STATE_COLOR[item.state]
  const dateStr = item.item_date ? formatDate(item.item_date) : t('body.noDate')

  return (
    <div className="flex gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-100" onClick={onClick}>
      {/* Spine */}
      <div className="flex flex-col items-center">
        <span
          className="shrink-0 w-2.5 h-2.5 rounded-full mt-[3px]"
          style={{ backgroundColor: color }}
        />
        {!isLast && <div className="w-px flex-1 bg-parchment-deep mt-1" />}
      </div>

      {/* Content */}
      <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
        <p className="font-mono text-[10px] text-ink-light tracking-wide uppercase mb-0.5 whitespace-nowrap">
          {dateStr}
        </p>
        <p className="text-sm text-navy leading-snug">{item.title}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DashboardBody({ caseId, onDwell }) {
  const { t } = useLanguage()
  const [items, setItems] = useState(null)
  const [peekItem, setPeekItem] = useState(null)

  useEffect(() => {
    getCaseItems(caseId).then(setItems).catch(() => setItems([]))
  }, [caseId])

  if (!items) return null

  // Left: documents + assets + debts, sorted by urgency
  const fileItems = [...items]
    .filter(i => i.item_type !== 'event')
    .sort((a, b) => fileOrder(a) - fileOrder(b))

  const filePreview  = fileItems.slice(0, FILE_PREVIEW)
  const fileHasMore  = fileItems.length > FILE_PREVIEW

  // Right: items with a date (any type), ascending — flagged items appear here too
  const timelineItems = items
    .filter(i => i.item_date)
    .slice(0, TIME_PREVIEW)

  const timelineHasMore = items.filter(i => i.item_date).length > TIME_PREVIEW

  return (
    <>
    <div className="bg-parchment px-4 pb-12">
      <div className="max-w-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6 md:max-w-none md:mx-0 md:w-full" style={{ maxWidth: '100%' }}>

          {/* ── Left: Your file ── */}
          <div className="bg-white border border-parchment-deep rounded-lg p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-3">
              {t('body.file')}
            </h2>
            <div>
              {filePreview.map(item => (
                <FileRow key={item.id} item={item} t={t} onClick={() => setPeekItem(item)} />
              ))}
            </div>
            {fileHasMore && (
              <button className="mt-3 text-xs text-ink-mid hover:text-navy transition-colors font-sans">
                {t('body.viewAll')}
              </button>
            )}
          </div>

          {/* ── Right: What happened ── */}
          <div className="bg-white border border-parchment-deep rounded-lg p-5">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-4 whitespace-nowrap">
              {t('body.happened')}
            </h2>
            <div>
              {timelineItems.map((item, i) => (
                <TimelineNode
                  key={item.id}
                  item={item}
                  isLast={i === timelineItems.length - 1}
                  t={t}
                  onClick={() => setPeekItem(item)}
                />
              ))}
            </div>
            {timelineHasMore && (
              <button className="mt-2 text-xs text-ink-mid hover:text-navy transition-colors font-sans">
                {t('body.fullTimeline')}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

    {peekItem && (
      <ItemPeek
        item={peekItem}
        onClose={() => setPeekItem(null)}
        onDwell={onDwell}
      />
    )}
    </>
  )
}
