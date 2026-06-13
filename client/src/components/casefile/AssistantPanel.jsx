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
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            text: `You've used all ${cap} included questions for this case. To continue, please contact your AcervoVista advisor.`,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'system', text: 'Something went wrong. Please try again in a moment.' },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="border border-gray rounded-lg overflow-hidden">
      <div className="bg-navy px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-white">Ask a question</h2>
          <p className="text-sm text-white opacity-70 mt-0.5">
            I can explain documents and process steps in plain language.
          </p>
        </div>
        <TurnsBadge turnsUsed={turnsUsed} cap={cap} />
      </div>

      {messages.length > 0 && (
        <div className="px-5 py-4 space-y-4 max-h-96 overflow-y-auto bg-white">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex gap-1 items-center text-ink text-sm pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce [animation-delay:300ms]" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray bg-white px-5 py-4 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || capReached}
          placeholder={
            capReached
              ? 'No questions remaining'
              : 'Ask about a document, a term, or the process…'
          }
          className="flex-1 rounded border border-gray px-3 py-2 text-sm text-ink placeholder:text-ink/50 focus:outline-none focus:ring-1 focus:ring-navy disabled:bg-gray disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || capReached}
          className="rounded bg-navy px-4 py-2 text-sm text-white font-medium hover:bg-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Send
        </button>
      </form>

      {capReached && (
        <p className="bg-gray px-5 py-3 text-xs text-ink text-center border-t border-gray">
          You've used all {cap} included questions for this case.
          Contact your AcervoVista advisor to continue.
        </p>
      )}
    </section>
  )
}

function TurnsBadge({ turnsUsed, cap }) {
  const pct = (turnsUsed / cap) * 100

  return (
    <div className="text-right shrink-0 ml-4">
      <p className="text-xs text-white opacity-70">
        {cap - turnsUsed} of {cap} question{cap !== 1 ? 's' : ''} remaining
      </p>
      <div className="mt-1.5 w-24 h-1.5 rounded-full bg-white/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-white transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs rounded-lg rounded-br-sm bg-navy px-4 py-2.5 text-sm text-white">
          {msg.text}
        </div>
      </div>
    )
  }

  if (msg.role === 'system') {
    return (
      <p className="text-xs text-ink/60 text-center italic px-4">{msg.text}</p>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-sm rounded-lg rounded-bl-sm bg-gray px-4 py-2.5 text-sm text-ink whitespace-pre-wrap">
        {msg.text}
      </div>
    </div>
  )
}
