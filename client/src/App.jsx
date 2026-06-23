import { useEffect, useRef, useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import TopBand from './components/TopBand'
import TakeABreath from './components/TakeABreath'
import IntakePage from './pages/IntakePage'
import CaseFilePage from './pages/CaseFilePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CheckoutPage from './pages/CheckoutPage'
import ProtectedRoute from './components/ProtectedRoute'

const CASE_ID_KEY = 'acervovista_case_id'
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Renders the dashboard — auto-recovers caseId from API for paid users whose localStorage was cleared
function DashboardShell({ caseId, setCaseId, pageKey, onSwitchCase }) {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(!caseId && user?.tier !== 'none')
  const navigate = useNavigate()

  useEffect(() => {
    if (caseId || user?.tier === 'none') return
    fetch(`${API}/api/cases`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const first = Array.isArray(data) ? data[0] : null
        if (first) {
          localStorage.setItem(CASE_ID_KEY, first.id)
          setCaseId(first.id)
        } else {
          navigate('/intake', { replace: true })
        }
      })
      .catch(() => navigate('/intake', { replace: true }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="min-h-screen bg-parchment" />

  if (!caseId) return <Navigate to="/intake" replace />

  return (
    <div key={`dash-${pageKey}-${caseId}`} className="animate-page-enter">
      <TopBand caseId={caseId} onSwitchCase={onSwitchCase} />
      <CaseFilePage caseId={caseId} />
    </div>
  )
}
const INACTIVITY_MS = 3 * 60 * 1000

// Root redirect: goes to dashboard if case exists, otherwise intake
function RootRedirect() {
  const caseId = localStorage.getItem(CASE_ID_KEY)
  return <Navigate to={caseId ? '/dashboard' : '/intake'} replace />
}

// Login guard: if already authed, skip login/signup screen
function AuthGate({ children }) {
  const { isAuthed, user } = useAuth()
  if (isAuthed) {
    const dest = user?.tier !== 'none' ? '/dashboard' : '/checkout'
    return <Navigate to={dest} replace />
  }
  return children
}

// Stub for reset-password (Phase 2)
function ResetPasswordStub() {
  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="text-center">
        <p className="font-display text-xl text-navy mb-2">Password reset</p>
        <p className="text-sm text-ink-mid">Coming soon. Contact support@acervovista.com</p>
      </div>
    </div>
  )
}

function AppShell() {
  const [caseId, setCaseId] = useState(() => localStorage.getItem(CASE_ID_KEY))
  const [pageKey, setPageKey] = useState(0)
  const [showBreath, setShowBreath] = useState(false)
  const inactivityTimer = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function resetTimer() {
      clearTimeout(inactivityTimer.current)
      setShowBreath(false)
      inactivityTimer.current = setTimeout(() => setShowBreath(true), INACTIVITY_MS)
    }
    const events = ['click', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()
    return () => {
      clearTimeout(inactivityTimer.current)
      events.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [])

  function handleIntakeComplete(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setPageKey(k => k + 1)
    setCaseId(newCaseId)
    setShowBreath(true)
    navigate('/dashboard', { replace: true })
  }

  function handleSwitchCase(newCaseId) {
    localStorage.setItem(CASE_ID_KEY, newCaseId)
    setPageKey(k => k + 1)
    setCaseId(newCaseId)
  }

  return (
    <div className="min-h-screen bg-parchment">
      {showBreath && (
        <TakeABreath triggerId="case-entry" onDismiss={() => setShowBreath(false)} />
      )}

      <Routes>
        <Route path="/login"  element={<AuthGate><LoginPage /></AuthGate>} />
        <Route path="/signup" element={<AuthGate><SignupPage /></AuthGate>} />
        <Route path="/reset-password" element={<ResetPasswordStub />} />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        } />

        <Route path="/intake" element={
          <div key={`intake-${pageKey}`} className="animate-page-enter">
            <Nav />
            <div className="pt-14">
              <IntakePage onComplete={handleIntakeComplete} />
            </div>
          </div>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardShell
              caseId={caseId}
              setCaseId={setCaseId}
              pageKey={pageKey}
              onSwitchCase={handleSwitchCase}
            />
          </ProtectedRoute>
        } />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </AuthProvider>
  )
}
