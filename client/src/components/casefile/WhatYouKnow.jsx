import { useEffect, useRef, useState } from 'react'
import { getCaseItems, declareItem } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

function hookKey(item) {
  const ht = item.conflict?.hook_type
  if (ht && ht !== 'vague') return `wyk.hook.${ht}`
  // Fallback from item_type if hook_type missing
  if (item.item_type === 'asset')     return 'wyk.hook.general'
  if (item.item_type === 'event')     return 'wyk.hook.general'
  return 'wyk.hook.vague'
}

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatValue(cents, currency) {
  if (!cents) return null
  const dollars = Math.abs(cents) / 100
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  if (dollars >= 1_000)     return `$${Math.round(dollars / 1_000)}K`
  return `$${Math.round(dollars)}`
}

// ── Single declared entry ─────────────────────────────────────────────────────

function DeclaredEntry({ item, t, onUpload }) {
  const graduated = item.state === 'confirmed'
  const borderColor = graduated ? '#1D9E75' : '#888780'

  return (
    <div
      className="bg-white rounded-lg px-4 py-4"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-medium text-navy leading-snug">{item.title}</p>
        <span
          className="shrink-0 text-[10px] font-mono uppercase tracking-wide mt-[2px]"
          style={{ color: borderColor }}
        >
          {graduated ? t('wyk.graduated') : t('wyk.held')}
        </span>
      </div>

      {item.summary && item.summary !== item.title && (
        <p className="text-sm text-ink-mid leading-relaxed mb-2">{item.summary}</p>
      )}

      <div className="flex flex-wrap gap-3 text-[11px] text-ink-light mb-3">
        {item.item_date && (
          <span>{formatDate(item.item_date)}</span>
        )}
        {item.value_cents && (
          <span>{formatValue(item.value_cents, item.value_currency)}</span>
        )}
      </div>

      {/* Document hook — only shown while waiting */}
      {!graduated && (
        <button
          onClick={() => onUpload(item)}
          className="text-[11px] text-ink-mid hover:text-navy transition-colors
                     underline underline-offset-2 text-left"
        >
          {t(hookKey(item))}
        </button>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WhatYouKnow({ caseId, onUpload }) {
  const { t }        = useLanguage()
  const [items, setItems]         = useState(null)
  const [text, setText]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const textareaRef               = useRef(null)

  const loadItems = () => {
    getCaseItems(caseId)
      .then(all => setItems(all.filter(i => i.provenance === 'declared')))
      .catch(() => setItems([]))
  }

  useEffect(() => { loadItems() }, [caseId])

  const handleSubmit = async () => {
    if (!text.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      await declareItem(caseId, text.trim())
      setText('')
      loadItems()
    } catch {
      setError("Couldn’t save — try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit()
  }

  const declaredItems = items ?? []
  const held       = declaredItems.filter(i => i.state !== 'confirmed')
  const graduated  = declaredItems.filter(i => i.state === 'confirmed')

  return (
    <div className="bg-parchment px-4 pb-10">
      <div className="max-w-xl mx-auto">
        <div className="bg-white border border-parchment-deep rounded-lg p-5">

          {/* Header */}
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
            {t('wyk.title')}
          </p>
          <p className="text-sm text-ink-mid leading-relaxed mb-5">
            {t('wyk.subtitle')}
          </p>

          {/* Entry field */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t('wyk.placeholder')}
            rows={3}
            className="w-full resize-none rounded-lg border border-parchment-deep bg-parchment
                       px-3 py-3 text-sm text-navy placeholder:text-ink-light
                       focus:outline-none focus:ring-1 focus:ring-navy/30
                       leading-relaxed mb-3"
          />

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-light">
              {text.trim() ? 'Cmd+Enter to add' : ''}
            </p>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || saving}
              className="px-4 py-1.5 rounded-md bg-navy text-white text-xs font-medium
                         hover:bg-navy-mid transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? t('wyk.processing') : t('wyk.submit')}
            </button>
          </div>

          {error && (
            <p className="text-xs text-[#E24B4A] mt-2">{error}</p>
          )}

          {/* Held entries */}
          {held.length > 0 && (
            <div className="mt-6 space-y-3">
              {held.map(item => (
                <DeclaredEntry
                  key={item.id}
                  item={item}
                  t={t}
                  onUpload={onUpload ?? (() => {})}
                />
              ))}
            </div>
          )}

          {/* Graduated entries */}
          {graduated.length > 0 && (
            <div className="mt-4 space-y-3">
              {graduated.map(item => (
                <DeclaredEntry
                  key={item.id}
                  item={item}
                  t={t}
                  onUpload={() => {}}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {items !== null && declaredItems.length === 0 && (
            <p className="text-sm text-ink-light mt-5 leading-relaxed">
              {t('wyk.empty')}
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
