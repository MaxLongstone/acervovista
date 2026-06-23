import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SealIsotype from '../components/SealIsotype'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || null

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState(null)
  const [errorType, setErrorType] = useState(null) // 'no_account' | 'invalid_credentials'
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setErrorType(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'no_account') {
          setErrorType('no_account')
          setError('No account found with that email.')
        } else {
          setErrorType('invalid_credentials')
          setError("That email and password don't match. Try again.")
        }
        return
      }

      login(data.token, data.user)

      const dest = next || (data.redirect === '/dashboard' ? '/dashboard' : '/checkout')
      navigate(dest, { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Seal */}
        <div className="flex justify-center mb-6">
          <SealIsotype size={52} noStamp />
        </div>

        <div className="bg-parchment-deep rounded-lg p-8 border border-parchment-dark/20">
          <h1 className="font-display text-2xl text-navy mb-1">Welcome back.</h1>
          <p className="text-sm text-ink-mid mb-6">Your case file is waiting.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-medium text-navy uppercase tracking-wide">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="px-3 py-2.5 rounded border border-parchment-dark/40 bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-navy transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-medium text-navy uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3 py-2.5 pr-10 rounded border border-parchment-dark/40 bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-navy transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light text-xs"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-stamp" role="alert">
                {error}{' '}
                {errorType === 'no_account' && (
                  <Link to={`/signup?entry=direct`} className="underline font-medium">
                    Would you like to start one?
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1 py-2.5 rounded bg-navy text-white text-sm font-medium hover:bg-stamp active:bg-stamp-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center">
            <Link to="/reset-password" className="text-xs text-ink-mid hover:text-navy transition-colors">
              Forgot your password?
            </Link>
            <p className="text-xs text-ink-mid">
              New to AcervoVista?{' '}
              <Link to="/signup?entry=direct" className="text-navy font-medium hover:text-stamp transition-colors">
                Start here →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
