import { useState } from 'react'
import StepShell from './StepShell'
import { AGREEMENT_OPTIONS } from '../../intakeOptions'

const input = 'mt-1 w-full border border-parchment-deep rounded-md px-3 h-12 bg-white text-ink focus:outline-none focus:ring-1 focus:ring-navy transition-colors duration-150'
const lbl = 'text-sm font-medium text-ink-mid'
const choice = (active) =>
  `text-left px-4 py-4 rounded-md border text-[15px] transition-colors duration-150
   ${active ? 'border-navy bg-parchment font-medium text-navy' : 'border-parchment-deep text-ink hover:border-navy-light'}`

const emptyHeir = { fullName: '', relationship: '', residence: '' }

export default function StepHeirs({ answers, onNext, onBack }) {
  const [heirs, setHeirs] = useState(
    answers.heirs.length > 0 ? answers.heirs : [{ ...emptyHeir }]
  )
  const [heirsInAgreement, setHeirsInAgreement] = useState(answers.heirsInAgreement)

  const canContinue =
    heirs.every((h) => h.fullName.trim() && h.relationship.trim()) && heirsInAgreement

  const updateHeir = (i, field, val) =>
    setHeirs((prev) => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h))

  return (
    <StepShell
      title="Who are the heirs?"
      step={5}
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ heirs, heirsInAgreement })}
    >
      <div className="space-y-4">
        {heirs.map((heir, i) => (
          <div key={i} className="border border-parchment-deep rounded-md p-4 space-y-3">
            <label className="block">
              <span className={lbl}>Full name</span>
              <input type="text" value={heir.fullName}
                onChange={(e) => updateHeir(i, 'fullName', e.target.value)}
                className={input} />
            </label>
            <label className="block">
              <span className={lbl}>Relationship to decedent</span>
              <input type="text" value={heir.relationship}
                onChange={(e) => updateHeir(i, 'relationship', e.target.value)}
                className={input} />
            </label>
            <label className="block">
              <span className={lbl}>State or country of residence</span>
              <input type="text" value={heir.residence}
                onChange={(e) => updateHeir(i, 'residence', e.target.value)}
                className={input} />
            </label>
            {heirs.length > 1 && (
              <button type="button"
                onClick={() => setHeirs((p) => p.filter((_, idx) => idx !== i))}
                className="text-sm text-ink-mid hover:text-navy underline underline-offset-2 transition-colors duration-150">
                Remove this heir
              </button>
            )}
          </div>
        ))}
        <button type="button"
          onClick={() => setHeirs((p) => [...p, { ...emptyHeir }])}
          className="text-sm text-navy underline underline-offset-2 hover:text-navy-mid transition-colors duration-150">
          + Add another heir
        </button>
      </div>

      <div className="mt-2">
        <span className={lbl}>Are all heirs in agreement about the estate?</span>
        <div className="flex flex-col gap-3 mt-2">
          {AGREEMENT_OPTIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => setHeirsInAgreement(o.value)}
              className={choice(heirsInAgreement === o.value)}>{o.label}</button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
