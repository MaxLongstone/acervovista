import { useState } from 'react'
import StepWhoAreYou from '../components/intake/StepWhoAreYou'
import StepDecedent from '../components/intake/StepDecedent'
import StepMaritalStatus from '../components/intake/StepMaritalStatus'
import StepWill from '../components/intake/StepWill'
import StepHeirs from '../components/intake/StepHeirs'
import StepAssets from '../components/intake/StepAssets'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'
import { createCase } from '../api'

const TOTAL_STEPS = 6

const initialAnswers = {
  userType: '',
  decedentName: '',
  dateOfDeath: '',
  stateOfDomicile: 'FL',
  diedInFlorida: '',
  maritalStatus: '',
  spouseName: '',
  hasWill: '',
  willLocated: '',
  heirs: [{ fullName: '', relationship: '', residence: '' }],
  heirsInAgreement: '',
  assets: [],
  preDeathTransfers: '',
}

export default function IntakePage({ onComplete }) {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState(initialAnswers)
  const [submitting, setSubmitting] = useState(false)
  const [createdCase, setCreatedCase] = useState(null)

  function update(partial, advance = true) {
    setAnswers((prev) => ({ ...prev, ...partial }))
    if (advance) setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  }

  function back() {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  async function submit(finalPartial) {
    const finalAnswers = { ...answers, ...finalPartial }
    setAnswers(finalAnswers)
    setSubmitting(true)
    try {
      const result = await createCase(finalAnswers)
      setCreatedCase({ ...finalAnswers, id: result.id, complexity_flags: result.complexityFlags })
      setStep(TOTAL_STEPS + 1)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === TOTAL_STEPS + 1 && createdCase) {
    return (
      <CaseSummaryCard
        caseData={createdCase}
        onStartUploading={() => onComplete(createdCase.id)}
      />
    )
  }

  if (step === 1) {
    return (
      <StepWhoAreYou
        answers={answers}
        onUpdate={(partial) => update(partial, false)}
        onNext={() => setStep(2)}
      />
    )
  }

  if (step === 2) {
    return <StepDecedent answers={answers} onNext={update} onBack={back} />
  }

  if (step === 3) {
    return <StepMaritalStatus answers={answers} onNext={update} onBack={back} />
  }

  if (step === 4) {
    return <StepWill answers={answers} onNext={update} onBack={back} />
  }

  if (step === 5) {
    return <StepHeirs answers={answers} onNext={update} onBack={back} />
  }

  if (step === 6) {
    return (
      <StepAssets
        answers={answers}
        onSubmit={(partial) => submit(partial)}
        onBack={back}
        submitting={submitting}
      />
    )
  }

  return null
}
