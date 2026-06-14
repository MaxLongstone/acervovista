import { useState } from 'react'
import StepShell from './StepShell'
import { HAS_WILL_OPTIONS, WILL_LOCATED_OPTIONS } from '../../intakeOptions'

const choice = (active) =>
  `text-left px-4 py-4 rounded-md border text-[15px] transition-colors duration-150
   ${active ? 'border-navy bg-parchment font-medium text-navy' : 'border-parchment-deep text-ink hover:border-navy-light'}`

export default function StepWill({ answers, onNext, onBack }) {
  const [hasWill, setHasWill] = useState(answers.hasWill)
  const [willLocated, setWillLocated] = useState(answers.willLocated)

  const canContinue = hasWill && (hasWill !== 'yes' || willLocated)

  return (
    <StepShell
      title="Did they leave a will?"
      step={4}
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ hasWill, willLocated })}
    >
      <div className="flex flex-col gap-3">
        {HAS_WILL_OPTIONS.map((o) => (
          <button key={o.value} type="button" onClick={() => setHasWill(o.value)}
            className={choice(hasWill === o.value)}>{o.label}</button>
        ))}
      </div>

      {hasWill === 'yes' && (
        <div className="mt-2">
          <span className="text-sm font-medium text-ink-mid">Has the will been located?</span>
          <div className="flex flex-col gap-3 mt-2">
            {WILL_LOCATED_OPTIONS.map((o) => (
              <button key={o.value} type="button" onClick={() => setWillLocated(o.value)}
                className={choice(willLocated === o.value)}>{o.label}</button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  )
}
