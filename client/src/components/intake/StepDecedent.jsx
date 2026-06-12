import { useState } from 'react'
import StepShell from './StepShell'
import { US_STATES } from '../../usStates'

export default function StepDecedent({ answers, onNext, onBack }) {
  const [decedentName, setDecedentName] = useState(answers.decedentName)
  const [dateOfDeath, setDateOfDeath] = useState(answers.dateOfDeath)
  const [stateOfDomicile, setStateOfDomicile] = useState(answers.stateOfDomicile)
  const [diedInFlorida, setDiedInFlorida] = useState(answers.diedInFlorida)

  const canContinue = decedentName.trim() && dateOfDeath && diedInFlorida !== ''

  return (
    <StepShell
      title="Who passed away?"
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() =>
        onNext({ decedentName, dateOfDeath, stateOfDomicile, diedInFlorida })
      }
    >
      <label className="block">
        <span className="text-sm text-ink">Full name</span>
        <input
          type="text"
          value={decedentName}
          onChange={(e) => setDecedentName(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink">Date of death</span>
        <input
          type="date"
          value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        />
      </label>

      <label className="block">
        <span className="text-sm text-ink">State of domicile at death</span>
        <select
          value={stateOfDomicile}
          onChange={(e) => setStateOfDomicile(e.target.value)}
          className="mt-1 w-full border border-gray rounded p-2"
        >
          {US_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="text-sm text-ink">Did they pass away in Florida?</span>
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => setDiedInFlorida(true)}
            className={`px-4 py-2 rounded border ${
              diedInFlorida === true ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setDiedInFlorida(false)}
            className={`px-4 py-2 rounded border ${
              diedInFlorida === false ? 'border-navy bg-gray' : 'border-gray'
            }`}
          >
            No
          </button>
        </div>
      </div>
    </StepShell>
  )
}
