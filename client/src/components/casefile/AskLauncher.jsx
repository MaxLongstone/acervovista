import { useRef, useState } from 'react'
import { askAssistant } from '../../api'
import { useLanguage } from '../../i18n/LanguageContext'

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs rounded-lg rounded-br-sm bg-navy px-4 py-2.5 text-sm text-parchment">
          {msg.text}
        </div>
      </div>
    )
  }
  if (msg.role === 'system') {
    return <p className="text-xs text-ink-light text-center italic px-4">{msg.text}</p>
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-sm rounded-lg rounded-bl-sm bg-white border border-parchment-deep
                      px-4 py-2.5 text-sm text-ink leading-relaxed whitespace-pre-wrap">
        {msg.text}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AskLauncher({ caseId, initialTurnsUsed = 0, cap = 50 }) {
  const { t } = useLanguage()
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [turnsUsed, setTurnsUsed]   = useState(initialTurnsUsed)
  const [capReached, setCapReached] = useState(initialTurnsUsed >= cap)
  const bottomRef = useRef(null)

  const remaining = cap - turnsUsed

  async function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || capReached) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await askAssistant(caseId, text)
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
      setTurnsUsed(data.turns_used)
      if (data.remaining <= 0) setCapReached(true)
    } catch (err) {
      if (err.status === 429) {
        setCapReached(true)
        setMessages(prev => [...prev, {
          role: 'system',
          text: t('ask.capReached').replace('{cap}', cap),
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          text: 'Something went wrong. Please try again in a moment.',
        }])
      }
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <div className="sticky bottom-0 z-30 bg-white border-t border-parchment-deep">

      {/* Expandable panel — slides in above the button row */}
      {open && (
        <div className="max-w-xl mx-auto px-4 pt-4 pb-2">

          {/* Lawyer-wall promise — always visible at top */}
          <p className="text-[11px] text-ink-light leading-relaxed mb-4 border-b border-parchment-deep pb-3">
            {t('ask.promise')}
          </p>

          {/* Message thread */}
          {messages.length > 0 && (
            <div className="space-y-3 max-h-72 overflow-y-auto mb-3 pr-1">
              {messages.map((msg, i) => <Bubble key={i} msg={msg} />)}
              {loading && (
                <div className="flex gap-1 items-center pl-1">
                  {[0, 150, 300].map(d => (
                    <span key={d}
                      className="w-1.5 h-1.5 rounded-full bg-ink-light animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {/* Input row */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading || capReached}
              placeholder={capReached
                ? t('ask.capReached').replace('{cap}', cap)
                : t('ask.placeholder')}
              className="flex-1 border border-parchment-deep rounded-md px-3 h-10 text-sm text-ink
                         placeholder:text-ink-light bg-white
                         focus:outline-none focus:ring-1 focus:ring-navy/30
                         disabled:bg-parchment disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || capReached}
              className="bg-navy text-parchment px-4 h-10 rounded-md text-sm font-medium
                         hover:bg-navy-mid transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('ask.send')}
            </button>
          </form>

          {/* Turn counter */}
          {!capReached && (
            <p className="text-[10px] text-ink-light text-right mb-1">
              {t('ask.remaining').replace('{n}', remaining).replace('{cap}', cap)}
            </p>
          )}
        </div>
      )}

      {/* Launcher row */}
      <div className="py-4 flex items-center justify-center gap-3">
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? t('ask.close') : t('ask.label')}
          className="w-12 h-12 rounded-full flex items-center justify-center
                     bg-stamp text-white text-xs font-semibold tracking-wide
                     shadow-sm hover:bg-stamp-deep transition-colors duration-150"
        >
          {open ? '✕' : 'Ask'}
        </button>
        {!open && (
          <span className="text-sm text-ink-mid">
            {t('ask.label')}
          </span>
        )}
      </div>

    </div>
  )
}
