import { useState } from 'react'
import StepShell from './StepShell'
import { ASSET_OPTIONS, TRANSFER_OPTIONS } from '../../intakeOptions'

export default function StepAssets({ answers, onSubmit, onBack, submitting }) {
  const [assets, setAssets] = useState(answers.assets)
  const [preDeathTransfers, setPreDeathTransfers] = useState(answers.preDeathTransfers)

  const canSubmit = preDeathTransfers && !submitting

  function toggleAsset(option) {
    setAssets((prev) =>
      prev.includes(option) ? prev.filter((a) => a !== option) : [...prev, option]
    )
  }

  function handleSubmit() {
    onSubmit({ assets, preDeathTransfers })
  }

  return (
    <StepShell
      title="What assets are part of the estate?"
      onBack={onBack}
      nextDisabled={!canSubmit}
      nextLabel={submitting ? 'Saving...' : 'See my case summary'}
      onNext={handleSubmit}
    >
      <div className="space-y-2">
        {ASSET_OPTIONS.map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={assets.includes(option)}
              onChange={() => toggleAsset(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div>
        <span className="text-sm text-ink">
          Were there any significant asset transfers or gifts in the 2 years
          before the death?
        </span>
        <div className="flex flex-col gap-3 mt-1">
          {TRANSFER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreDeathTransfers(option.value)}
              className={`text-left p-4 rounded border ${
                preDeathTransfers === option.value ? 'border-navy bg-gray' : 'border-gray'
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
