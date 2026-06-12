import { useState } from 'react'
import StepShell from './StepShell'
import { HAS_WILL_OPTIONS, WILL_LOCATED_OPTIONS } from '../../intakeOptions'

export default function StepWill({ answers, onNext, onBack }) {
  const [hasWill, setHasWill] = useState(answers.hasWill)
  const [willLocated, setWillLocated] = useState(answers.willLocated)

  const canContinue = hasWill && (hasWill !== 'yes' || willLocated)

  return (
    <StepShell
      title="Did they leave a will?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ hasWill, willLocated })}
    >
      <div className="flex flex-col gap-3">
        {HAS_WILL_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setHasWill(option.value)}
            className={`text-left p-4 rounded border ${
              hasWill === option.value ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {hasWill === 'yes' && (
        <div>
          <span className="text-sm text-ink">Has the will been located?</span>
          <div className="flex flex-col gap-3 mt-1">
            {WILL_LOCATED_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setWillLocated(option.value)}
                className={`text-left p-4 rounded border ${
                  willLocated === option.value ? 'border-navy bg-gray' : 'border-gray'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  )
}
