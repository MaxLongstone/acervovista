import { useState } from 'react'
import StepShell from './StepShell'
import { US_STATES } from '../../usStates'

const input = 'mt-1 w-full border border-parchment-deep rounded-md px-3 h-12 bg-white text-ink focus:outline-none focus:ring-1 focus:ring-navy transition-colors duration-150'
const lbl = 'text-sm font-medium text-ink-mid'

export default function StepDecedent({ answers, onNext, onBack }) {
  const [decedentName, setDecedentName] = useState(answers.decedentName)
  const [dateOfDeath, setDateOfDeath] = useState(answers.dateOfDeath)
  const [stateOfDomicile, setStateOfDomicile] = useState(answers.stateOfDomicile)
  const [diedInFlorida, setDiedInFlorida] = useState(answers.diedInFlorida)

  const canContinue = decedentName.trim() && dateOfDeath && diedInFlorida !== ''

  return (
    <StepShell
      title="Who passed away?"
      step={2}
      onBack={onBack}
      nextDisabled={!canContinue}
      onNext={() => onNext({ decedentName, dateOfDeath, stateOfDomicile, diedInFlorida })}
    >
      <label className="block">
        <span className={lbl}>Full name</span>
        <input type="text" value={decedentName}
          onChange={(e) => setDecedentName(e.target.value)}
          className={input} placeholder="e.g. Maria Elena Santos" />
      </label>

      <label className="block">
        <span className={lbl}>Date of death</span>
        <input type="date" value={dateOfDeath}
          onChange={(e) => setDateOfDeath(e.target.value)}
          className={input} />
      </label>

      <label className="block">
        <span className={lbl}>State of domicile at death</span>
        <select value={stateOfDomicile}
          onChange={(e) => setStateOfDomicile(e.target.value)}
          className={input}>
          {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <div>
        <span className={lbl}>Did they pass away in Florida?</span>
        <div className="flex gap-3 mt-2">
          {[{ val: true, text: 'Yes' }, { val: false, text: 'No' }].map(({ val, text }) => (
            <button key={String(val)} type="button" onClick={() => setDiedInFlorida(val)}
              className={`flex-1 py-3 rounded-md border text-sm transition-colors duration-150
                ${diedInFlorida === val
                  ? 'border-navy bg-parchment font-medium text-navy'
                  : 'border-parchment-deep text-ink hover:border-navy-light'}`}>
              {text}
            </button>
          ))}
        </div>
      </div>
    </StepShell>
  )
}
