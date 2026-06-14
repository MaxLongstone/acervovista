import { useState } from 'react'
import StepShell from './StepShell'
import { ASSET_OPTIONS, TRANSFER_OPTIONS } from '../../intakeOptions'

const lbl = 'text-sm font-medium text-ink-mid'
const choice = (active) =>
  `text-left px-4 py-4 rounded-md border text-[15px] transition-colors duration-150
   ${active ? 'border-navy bg-parchment font-medium text-navy' : 'border-parchment-deep text-ink hover:border-navy-light'}`

export default function StepAssets({ answers, onSubmit, onBack, submitting }) {
  const [assets, setAssets] = useState(answers.assets)
  const [preDeathTransfers, setPreDeathTransfers] = useState(answers.preDeathTransfers)

  const canSubmit = preDeathTransfers && !submitting

  const toggleAsset = (opt) =>
    setAssets((prev) => prev.includes(opt) ? prev.filter((a) => a !== opt) : [...prev, opt])

  return (
    <StepShell
      title="What assets are part of the estate?"
      step={6}
      onBack={onBack}
      nextDisabled={!canSubmit}
      nextLabel={submitting ? 'Saving…' : 'See my case summary'}
      onNext={() => onSubmit({ assets, preDeathTransfers })}
    >
      <div className="space-y-3">
        {ASSET_OPTIONS.map((opt) => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" checked={assets.includes(opt)}
              onChange={() => toggleAsset(opt)}
              className="w-4 h-4 accent-navy rounded" />
            <span className="text-[15px] text-ink group-hover:text-navy transition-colors duration-150">
              {opt}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-2">
        <span className={lbl}>
          Were there any significant asset transfers or gifts in the 2 years before the death?
        </span>
        <div className="flex flex-col gap-3 mt-2">
          {TRANSFER_OPTIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => setPreDeathTransfers(o.value)}
              className={choice(preDeathTransfers === o.value)}>{o.label}</button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
