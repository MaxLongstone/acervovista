import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SealIsotype from '../components/SealIsotype'

const API = 'http://localhost:3001'

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" className="inline-block mr-1.5 text-ink-mid flex-shrink-0 mt-px">
      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CONSUMER_FEATURES = [
  'Complete case file',
  'Document upload',
  'Gap map',
  'AI assistant',
  'Lawyer referral',
]

export default function CheckoutPage() {
  const { token } = useAuth()
  const [params] = useSearchParams()
  const source = params.get('source') || 'direct'

  const [selectedPlan, setSelectedPlan]     = useState(null)
  const [includeHandoff, setIncludeHandoff] = useState(source === 'assessment')
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState(null)

  async function goToStripe(plan) {
    setSelectedPlan(plan)
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/checkout/create-session`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, source, include_handoff: includeHandoff }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isLoading = (plan) => loading && selectedPlan === plan

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-xl">
        <div className="flex justify-center mb-6">
          <SealIsotype size={52} noStamp />
        </div>

        <h1 className="font-display text-2xl text-navy text-center mb-1">Choose your plan.</h1>
        <p className="text-sm text-ink-mid text-center mb-8">Early access. First 500 cases only.</p>

        <div className="flex flex-col gap-4">
          {/* Consumer */}
          <div className="bg-parchment-deep rounded-lg border border-parchment-dark/20 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-display text-lg text-navy">Consumer</h2>
                <p className="text-sm text-ink-mid mt-0.5">One case. Yours permanently.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display text-navy">$10</div>
                <div className="text-xs text-ink-mid">one time</div>
              </div>
            </div>

            <ul className="mb-4 flex flex-col gap-1">
              {CONSUMER_FEATURES.map(f => (
                <li key={f} className="flex items-start text-sm text-ink-mid">
                  <CheckIcon />{f}
                </li>
              ))}
            </ul>

            <div className="text-xs text-ink-light bg-parchment rounded px-2.5 py-1.5 inline-block mb-4">
              Early access · 500 cases
            </div>

            <button
              onClick={() => goToStripe('consumer')}
              disabled={loading}
              className="w-full py-2.5 rounded bg-navy text-white text-sm font-medium hover:bg-stamp transition-colors disabled:opacity-50"
            >
              {isLoading('consumer') ? 'Redirecting…' : 'Start for $10'}
            </button>
          </div>

          {/* Professional */}
          <div className="bg-parchment-deep rounded-lg border border-parchment-dark/20 p-6">
            <div className="mb-4">
              <h2 className="font-display text-lg text-navy">Professional</h2>
              <p className="text-sm text-ink-mid mt-0.5">Choose how you work.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Per case */}
              <div className="flex-1 bg-white rounded border border-parchment-dark/20 p-4">
                <div className="text-2xl font-display text-navy">$79</div>
                <div className="text-xs text-ink-mid mb-1">per case · early access</div>
                <p className="text-sm text-ink-mid mb-4">Pay as you go. One case at a time.</p>
                <button
                  onClick={() => goToStripe('professional_case')}
                  disabled={loading}
                  className="w-full py-2 rounded bg-navy text-white text-sm font-medium hover:bg-stamp transition-colors disabled:opacity-50"
                >
                  {isLoading('professional_case') ? 'Redirecting…' : 'Start for $79 per case'}
                </button>
              </div>

              {/* Monthly */}
              <div className="flex-1 bg-white rounded border border-parchment-dark/20 p-4">
                <div className="text-2xl font-display text-navy">$320</div>
                <div className="text-xs text-ink-mid mb-1">per month</div>
                <p className="text-sm text-ink-mid mb-1">Unlimited cases. For firms with steady volume.</p>
                <p className="text-xs text-ink-light mb-4">Pays off at 3+ cases per month.</p>
                <button
                  onClick={() => goToStripe('professional_monthly')}
                  disabled={loading}
                  className="w-full py-2 rounded bg-navy text-white text-sm font-medium hover:bg-stamp transition-colors disabled:opacity-50"
                >
                  {isLoading('professional_monthly') ? 'Redirecting…' : 'Start at $320/month'}
                </button>
              </div>
            </div>
          </div>

          {/* Handoff add-on */}
          <label className="flex items-start gap-3 cursor-pointer bg-parchment-deep rounded-lg border border-parchment-dark/20 p-4">
            <input
              type="checkbox"
              checked={includeHandoff}
              onChange={e => setIncludeHandoff(e.target.checked)}
              className="mt-0.5 accent-stamp"
            />
            <div>
              <span className="text-sm font-medium text-navy">+ Lawyer Handoff Package — $29</span>
              <p className="text-xs text-ink-mid mt-0.5">A formatted PDF your lawyer can use on day one.</p>
            </div>
          </label>

          {error && (
            <p className="text-xs text-stamp text-center" role="alert">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
