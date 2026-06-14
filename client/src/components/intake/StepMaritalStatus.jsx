import { useState } from 'react'
import StepShell from './StepShell'
import { MARITAL_STATUS_OPTIONS } from '../../intakeOptions'

const input = 'mt-1 w-full border border-parchment-deep rounded-md px-3 h-12 bg-white text-ink focus:outline-none focus:ring-1 focus:ring-navy transition-colors duration-150'
const lbl = 'text-sm font-medium text-ink-mid'

export default function StepMaritalStatus({ answers, onNext, onBack }) {
  const [maritalStatus, setMaritalStatus] = useState(answers.maritalStatus)
  const [spouseName, setSpouseName] = useState(answers.spouseName)

  const canContinue = maritalStatus && (maritalStatus !== 'Married' || spouseName.trim())

  return (
    <StepShell
      title="What was their marital status?"
      step={3}
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ maritalStatus, spouseName })}
    >
      <div className="flex flex-col gap-3">
        {MARITAL_STATUS_OPTIONS.map((option) => (
          <button key={option} type="button" onClick={() => setMaritalStatus(option)}
            className={`text-left px-4 py-4 rounded-md border text-[15px] transition-colors duration-150
              ${maritalStatus === option
                ? 'border-navy bg-parchment font-medium text-navy'
                : 'border-parchment-deep text-ink hover:border-navy-light'}`}>
            {option}
          </button>
        ))}
      </div>

      {maritalStatus === 'Married' && (
        <label className="block">
          <span className={lbl}>What is the surviving spouse's full name?</span>
          <input type="text" value={spouseName}
            onChange={(e) => setSpouseName(e.target.value)}
            className={input} />
        </label>
      )}
    </StepShell>
  )
}
