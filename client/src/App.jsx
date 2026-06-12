import { useState } from 'react'
import IntakePage from './pages/IntakePage'
import CaseFilePage from './pages/CaseFilePage'

const CASE_ID_KEY = 'acervovista_case_id'

export default function App() {
  const [caseId, setCaseId] = useState(() =>
    localStorage.getItem(CASE_ID_KEY)
  )

  function handleIntakeComplete(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setCaseId(newCaseId)
  }

  if (!caseId) {
    return <IntakePage onComplete={handleIntakeComplete} />
  }

  return <CaseFilePage caseId={caseId} />
}
