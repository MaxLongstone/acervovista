import { useState } from 'react'
import StepShell from './StepShell'
import { AGREEMENT_OPTIONS } from '../../intakeOptions'

const emptyHeir = { fullName: '', relationship: '', residence: '' }

export default function StepHeirs({ answers, onNext, onBack }) {
  const [heirs, setHeirs] = useState(
    answers.heirs.length > 0 ? answers.heirs : [{ ...emptyHeir }]
  )
  const [heirsInAgreement, setHeirsInAgreement] = useState(answers.heirsInAgreement)

  const canContinue =
    heirs.every((heir) => heir.fullName.trim() && heir.relationship.trim()) &&
    heirsInAgreement

  function updateHeir(index, field, value) {
    setHeirs((prev) =>
      prev.map((heir, i) => (i === index ? { ...heir, [field]: value } : heir))
    )
  }

  function addHeir() {
    setHeirs((prev) => [...prev, { ...emptyHeir }])
  }

  function removeHeir(index) {
    setHeirs((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <StepShell
      title="Who are the heirs?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ heirs, heirsInAgreement })}
    >
      <div className="space-y-4">
        {heirs.map((heir, index) => (
          <div key={index} className="border border-gray rounded p-3 space-y-2">
            <label className="block">
              <span className="text-sm text-ink">Full name</span>
              <input
                type="text"
                value={heir.fullName}
                onChange={(e) => updateHeir(index, 'fullName', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink">Relationship to decedent</span>
              <input
                type="text"
                value={heir.relationship}
                onChange={(e) => updateHeir(index, 'relationship', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            <label className="block">
              <span className="text-sm text-ink">State or country of residence</span>
              <input
                type="text"
                value={heir.residence}
                onChange={(e) => updateHeir(index, 'residence', e.target.value)}
                className="mt-1 w-full border border-gray rounded p-2"
              />
            </label>
            {heirs.length > 1 && (
              <button
                type="button"
                onClick={() => removeHeir(index)}
                className="text-sm text-red underline"
              >
                Remove this heir
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addHeir} className="text-sm text-navy underline">
          + Add another heir
        </button>
      </div>

      <div>
        <span className="text-sm text-ink">Are all heirs in agreement about the estate?</span>
        <div className="flex flex-col gap-3 mt-1">
          {AGREEMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setHeirsInAgreement(option.value)}
              className={`text-left p-4 rounded border ${
                heirsInAgreement === option.value ? 'border-navy bg-gray' : 'border-gray'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
