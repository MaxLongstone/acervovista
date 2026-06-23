import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SealIsotype from '../components/SealIsotype'
import { COUNTRIES } from '../data/countries'

const API = 'http://localhost:3001'

const NON_LATAM = new Set(['US', 'CA', 'GB', 'AU'])

const ROLE_OPTIONS = [
  { value: 'heir',    label: 'Heir or family member' },
  { value: 'lawyer',  label: 'Lawyer or law firm' },
  { value: 'advisor', label: 'Advisor or paralegal' },
]

const HEADINGS = {
  assessment: "Your assessment is ready. Let’s save it.",
  intake:     'Start your case file.',
  direct:     'Open your case.',
}

function LatamModal({ onContinue }) {
  return (
    <div className="fixed inset-0 bg-navy/60 flex items-center justify-center z-50 p-4">
      <div className="bg-parchment-deep rounded-lg p-6 max-w-sm w-full border border-parchment-dark/20">
        <h2 className="font-display text-lg text-navy mb-3">Data processing notice</h2>
        <p className="text-sm text-ink-mid mb-2">
          Your documents will be processed on servers in the United States. By continuing, you acknowledge this.
        </p>
        <p className="text-sm text-ink-mid mb-5 italic">
          Sus documentos serán procesados en servidores en los Estados Unidos. Al continuar, usted reconoce esto.
        </p>
        <button
          onClick={onContinue}
          className="w-full py-2.5 rounded bg-navy text-white text-sm font-medium hover:bg-stamp transition-colors"
        >
          I understand — continue
        </button>
      </div>
    </div>
  )
}

function CountrySelect({ value, onChange }) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  const filtered = query.length > 0
    ? COUNTRIES.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).slice(0, 30)
    : COUNTRIES.slice(0, 30)

  const selected = COUNTRIES.find(c => c.value === value)

  useEffect(() => {
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function selectCountry(code) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full px-3 py-2.5 rounded border border-parchment-dark/40 bg-white text-sm text-left flex justify-between items-center focus:outline-none focus:border-navy transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? 'text-ink' : 'text-ink-light'}>
          {selected ? selected.label : 'Where do you live?'}
        </span>
        <span className="text-ink-light text-xs">▾</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white rounded border border-parchment-dark/30 shadow-lg">
          <div className="p-2 border-b border-parchment-dark/20">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="w-full px-2 py-1.5 text-sm bg-parchment rounded border border-parchment-dark/30 focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
            {filtered.map(c => (
              <li
                key={c.value}
                role="option"
                aria-selected={c.value === value}
                onClick={() => selectCountry(c.value)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-parchment transition-colors ${c.value === value ? 'text-navy font-medium' : 'text-ink'}`}
              >
                {c.label}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-ink-light">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function SignupPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [params]  = useSearchParams()
  const entry = params.get('entry') || 'direct'

  const [firstName, setFirstName] = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [role, setRole]           = useState('')
  const [country, setCountry]     = useState('US')
  const [error, setError]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [showLatam, setShowLatam] = useState(false)
  const [pendingRoute, setPendingRoute] = useState(null)

  const heading = HEADINGS[entry] || HEADINGS.direct

  const isValid = firstName.trim() && email && password.length >= 8 && role && country

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isValid) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:      email.trim().toLowerCase(),
          password,
          first_name: firstName.trim(),
          role,
          country,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      login(data.token, data.user)

      const dest = entry === 'assessment'
        ? '/checkout?source=assessment'
        : entry === 'intake'
          ? '/intake'
          : '/checkout?source=direct'

      if (data.latam_notice) {
        setPendingRoute(dest)
        setShowLatam(true)
      } else {
        navigate(dest, { replace: true })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleLatamContinue() {
    setShowLatam(false)
    navigate(pendingRoute, { replace: true })
  }

  return (
    <>
      {showLatam && <LatamModal onContinue={handleLatamContinue} />}

      <div className="min-h-screen bg-parchment flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <SealIsotype size={52} noStamp />
          </div>

          <div className="bg-parchment-deep rounded-lg p-8 border border-parchment-dark/20">
            <h1 className="font-display text-2xl text-navy mb-1">{heading}</h1>
            <p className="text-sm text-ink-mid mb-6">One case. Yours permanently.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* First name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="first_name" className="text-xs font-medium text-navy uppercase tracking-wide">
                  First name
                </label>
                <input
                  id="first_name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  className="px-3 py-2.5 rounded border border-parchment-dark/40 bg-white text-sm text-ink placeholder:text-ink-light focus:outline-none focus:border-navy transition-colors"
                  required
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-xs font-medium text-navy uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
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

              {/* Role */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-navy uppercase tracking-wide">Your role</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  {ROLE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className={`flex-1 px-3 py-2.5 rounded border text-sm font-medium text-left transition-colors
                        ${role === opt.value
                          ? 'border-stamp bg-parchment text-navy'
                          : 'border-navy/30 bg-white text-ink-mid hover:border-navy'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-navy uppercase tracking-wide">
                  Where do you live?
                </label>
                <CountrySelect value={country} onChange={setCountry} />
              </div>

              {error && (
                <p className="text-xs text-stamp" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={!isValid || loading}
                className="mt-1 py-2.5 rounded bg-navy text-white text-sm font-medium hover:bg-stamp active:bg-stamp-deep disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating your account…' : 'Continue →'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-ink-mid">
              Already have an account?{' '}
              <Link to="/login" className="text-navy font-medium hover:text-stamp transition-colors">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
