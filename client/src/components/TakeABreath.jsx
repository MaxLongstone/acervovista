import { useEffect, useRef, useState } from 'react'

function SealMini() {
  return (
    <svg viewBox="0 0 80 80" width="24" height="24" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="40" cy="40" r="36" fill="#F5F0E8"/>
      <circle cx="40" cy="40" r="29.5" fill="none" stroke="#0F1F38" strokeWidth="1.5" opacity="0.12"/>
      <rect x="24" y="20" width="32" height="38" rx="2.5" fill="#0F1F38"/>
      <line x1="29" y1="28" x2="50" y2="28" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
      <line x1="29" y1="34" x2="47" y2="34" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.50"/>
      <line x1="29" y1="40" x2="43" y2="40" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.30"/>
      <path d="M24 49 L56 49 L56 55.5 Q56 58 53.5 58 L26.5 58 Q24 58 24 55.5 Z" fill="#C0392B"/>
    </svg>
  )
}

// Gentle 432 Hz sine wave with fade in/out — no external file needed
function playGentleTone(onEnded) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 432
    const now = ctx.currentTime
    const dur = 5
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.8)
    gain.gain.setValueAtTime(0.07, now + dur - 1.5)
    gain.gain.linearRampToValueAtTime(0, now + dur)
    osc.start(now)
    osc.stop(now + dur)
    osc.onended = () => { ctx.close(); onEnded?.() }
  } catch {
    onEnded?.()
  }
}

export default function TakeABreath({ onDismiss }) {
  const [showMessage, setShowMessage] = useState(false)
  const [visible, setVisible] = useState(true)
  const fadeTimer = useRef(null)

  function dismiss() {
    setVisible(false)
    clearTimeout(fadeTimer.current)
    setTimeout(onDismiss, 300)
  }

  function handleAudio() {
    setShowMessage(true)
    playGentleTone(() => {
      fadeTimer.current = setTimeout(dismiss, 2000)
    })
  }

  // Auto-dismiss after 90 seconds
  useEffect(() => {
    const t = setTimeout(dismiss, 90_000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`
        fixed top-14 left-0 right-0 z-40 bg-white border-b border-parchment-deep
        animate-settle transition-opacity duration-[250ms]
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
        <SealMini />
        <p className="flex-1 text-sm text-navy font-sans">
          Take your time. Your case is saved.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleAudio}
            aria-label="Play gentle audio"
            className="w-8 h-8 rounded-full flex items-center justify-center border border-parchment-deep
                       text-ink-light hover:text-navy hover:border-navy transition-colors duration-150"
          >
            <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.784L4.838 14H3a1 1 0 01-1-1V7a1 1 0 011-1h1.838l3.545-2.784a1 1 0 011 .076zM14.657 5.343a1 1 0 011.414 0A8.978 8.978 0 0118 10a8.978 8.978 0 01-1.929 4.657 1 1 0 01-1.414-1.414A6.978 6.978 0 0016 10a6.978 6.978 0 00-1.343-4.243 1 1 0 010-1.414z"/>
            </svg>
          </button>
          <button
            onClick={dismiss}
            className="text-sm text-ink-mid hover:text-navy transition-colors duration-150"
          >
            Continue
          </button>
        </div>
      </div>

      {showMessage && (
        <div className="max-w-2xl mx-auto px-6 pb-3 animate-settle">
          <p className="font-display italic text-[15px] text-ink-mid">
            Take a breath. Your case will be here.
          </p>
        </div>
      )}
    </div>
  )
}
