import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const AUDIO_SRC = '/take-a-breath.mp3'

export default function TakeABreath({ triggerId, onDismiss }) {
  const { t } = useLanguage()
  const audioRef = useRef(null)
  const dismissKey = triggerId ? `breath_dismissed_${triggerId}` : null

  const [dismissed, setDismissed] = useState(
    dismissKey ? !!localStorage.getItem(dismissKey) : false
  )

  if (dismissed) return null

  function dismiss() {
    if (dismissKey) localStorage.setItem(dismissKey, '1')
    setDismissed(true)
    onDismiss?.()
  }

  function handlePlay() {
    audioRef.current?.play().catch(() => {})
  }

  return (
    <div className="bg-parchment-deep border-y border-parchment-deep px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center gap-4">
        {/* Play button — navy outline, stamp on hover */}
        <button
          onClick={handlePlay}
          aria-label="Play gentle audio"
          className="shrink-0 w-9 h-9 rounded-full border border-navy/30 text-navy
                     flex items-center justify-center
                     hover:border-stamp hover:text-stamp transition-colors duration-150"
        >
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M3 2.5a.5.5 0 0 1 .765-.424l10 5.5a.5.5 0 0 1 0 .848l-10 5.5A.5.5 0 0 1 3 13.5v-11z"/>
          </svg>
        </button>

        <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-navy leading-snug">
            {t('breath.inline')}
          </p>
          <p className="text-[11px] text-ink-light mt-0.5">
            {t('breath.commit')}
          </p>
        </div>

        {/* Dismiss — very quiet */}
        <button
          onClick={dismiss}
          className="shrink-0 text-[11px] text-ink-light hover:text-ink-mid transition-colors"
        >
          {t('breath.dismiss')}
        </button>
      </div>
    </div>
  )
}
