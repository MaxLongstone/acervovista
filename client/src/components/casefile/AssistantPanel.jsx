import { useEffect, useRef, useState } from 'react'
import { askAssistant } from '../../api'

export default function AssistantPanel({ caseId, initialTurnsUsed, cap }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnsUsed, setTurnsUsed] = useState(initialTurnsUsed ?? 0)
  const [capReached, setCapReached] = useState(initialTurnsUsed >= cap)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading || capReached) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const data = await askAssistant(caseId, text)
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
      setTurnsUsed(data.turns_used)
      if (data.remaining <= 0) setCapReached(true)
    } catch (err) {
      if (err.status === 429) {
        setCapReached(true)
        setMessages((prev) => [...prev, {
          role: 'system',
          text: `You've used all ${cap} included questions. Contact your AcervoVista advisor to continue.`,
        }])
      } else {
        setMessages((prev) => [...prev, {
          role: 'system',
          text: 'Something went wrong. Please try again in a moment.',
        }])
      }
    } finally {
      setLoading(false)
    }
  }

  const remaining = cap - turnsUsed
  const pct = Math.round((turnsUsed / cap) * 100)

  return (
    <section className="bg-white border border-parchment-deep rounded-lg overflow-hidden animate-settle">
      {/* Navy header */}
      <div className="bg-navy px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-[17px] text-parchment font-semibold">Ask a question</h2>
          <p className="text-xs text-parchment-dark mt-0.5">
            I can explain documents and process steps in plain language.
          </p>
        </div>
        {/* Turn counter */}
        <div className="text-right shrink-0">
          <p className="text-[11px] text-parchment-dark">
            {remaining} of {cap} remaining
          </p>
          <div className="mt-1.5 w-20 h-1 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white/70 transition-all duration-300"
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="px-5 py-4 space-y-4 max-h-96 overflow-y-auto bg-parchment">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-1 items-center pl-1">
              {[0, 150, 300].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-ink-light animate-bounce"
                  style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit}
        className="border-t border-parchment-deep bg-white px-5 py-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || capReached}
          placeholder={capReached ? 'No questions remaining' : 'Ask about a document, a term, or the process…'}
          className="flex-1 border border-parchment-deep rounded-md px-3 h-11 text-sm text-ink
                     placeholder:text-ink-light bg-white
                     focus:outline-none focus:ring-1 focus:ring-navy
                     disabled:bg-parchment disabled:cursor-not-allowed
                     transition-colors duration-150"
        />
        <button type="submit"
          disabled={!input.trim() || loading || capReached}
          className="bg-navy text-parchment px-4 h-11 rounded-md text-sm font-medium
                     hover:bg-navy-mid transition-colors duration-150
                     disabled:opacity-40 disabled:cursor-not-allowed">
          Send
        </button>
      </form>

      {capReached && (
        <p className="bg-parchment border-t border-parchment-deep px-5 py-3 text-xs text-ink-mid text-center">
          You've used all {cap} included questions. Contact your AcervoVista advisor to continue.
        </p>
      )}
    </section>
  )
}

function MessageBubble({ msg }) {
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
                      px-4 py-2.5 text-sm text-ink whitespace-pre-wrap">
        {msg.text}
      </div>
    </div>
  )
}
