import { useEffect, useRef, useState } from 'react'
import { LanguageProvider } from './i18n/LanguageContext'
import Nav from './components/Nav'
import TopBand from './components/TopBand'
import TakeABreath from './components/TakeABreath'
import IntakePage from './pages/IntakePage'
import CaseFilePage from './pages/CaseFilePage'

const CASE_ID_KEY = 'acervovista_case_id'
const INACTIVITY_MS = 3 * 60 * 1000 // 3 minutes

function AppShell() {
  const [caseId, setCaseId] = useState(() => localStorage.getItem(CASE_ID_KEY))
  const [pageKey, setPageKey] = useState(0)
  const [showBreath, setShowBreath] = useState(false)
  const inactivityTimer = useRef(null)

  // Inactivity detection — reset on any interaction
  useEffect(() => {
    function resetTimer() {
      clearTimeout(inactivityTimer.current)
      setShowBreath(false)
      inactivityTimer.current = setTimeout(() => setShowBreath(true), INACTIVITY_MS)
    }

    const events = ['click', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(inactivityTimer.current)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [])

  function handleIntakeComplete(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setPageKey((k) => k + 1)
    setCaseId(newCaseId)
  }

  function handleSwitchCase(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setPageKey((k) => k + 1)
    setCaseId(newCaseId)
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header: TopBand when a case is active; Nav during intake */}
      {caseId
        ? <TopBand caseId={caseId} onSwitchCase={handleSwitchCase} />
        : <Nav />
      }

      {showBreath && (
        <TakeABreath onDismiss={() => setShowBreath(false)} />
      )}

      <div key={pageKey} className="pt-14 animate-page-enter">
        {!caseId
          ? <IntakePage onComplete={handleIntakeComplete} />
          : <CaseFilePage caseId={caseId} />
        }
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  )
}
