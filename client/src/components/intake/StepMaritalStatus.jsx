import { useState } from 'react'
import StepShell from './StepShell'
import { MARITAL_STATUS_OPTIONS } from '../../intakeOptions'

export default function StepMaritalStatus({ answers, onNext, onBack }) {
  const [maritalStatus, setMaritalStatus] = useState(answers.maritalStatus)
  const [spouseName, setSpouseName] = useState(answers.spouseName)

  const canContinue =
    maritalStatus &&
    (maritalStatus !== 'Married' || spouseName.trim())

  return (
    <StepShell
      title="What was their marital status?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ maritalStatus, spouseName })}
    >
      <div className="flex flex-col gap-3">
        {MARITAL_STATUS_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMaritalStatus(option)}
            className={`text-left p-4 rounded border ${
              maritalStatus === option ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {maritalStatus === 'Married' && (
        <label className="block">
          <span className="text-sm text-ink">
            What is the surviving spouse's full name?
          </span>
          <input
            type="text"
            value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            className="mt-1 w-full border border-gray rounded p-2"
          />
        </label>
      )}
    </StepShell>
  )
}
