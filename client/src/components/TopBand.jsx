import { useEffect, useState } from 'react'
import { getCase } from '../api'
import { useLanguage } from '../i18n/LanguageContext'
import SealIsotype from './SealIsotype'
import CaseSwitcher from './CaseSwitcher'

// Maps the heir's free-text relationship to a possessive headline phrase.
// Only generates a phrase when we can do so without guessing.
//
// The relationship field stores what the heir typed, which is usually the
// decedent's role in their life ("Father", "Mother") or their own role
// ("Child", "Son"). We can only produce a specific phrase in the first case.
//
// "Child" / "Son" / "Daughter" → null (parent's gender unknown → fallback)
// FUTURE: add decedent_gender to the cases table so "Child" can render
//         "Your father's / Your mother's estate".
const RELATIONSHIP_POSSESSIVE_EN = {
  'father':      "Your father's estate",
  'mother':      "Your mother's estate",
  'parent':      "Your parent's estate",
  'spouse':      "Your spouse's estate",
  'husband':     "Your husband's estate",
  'wife':        "Your wife's estate",
  'partner':     "Your partner's estate",
  'sibling':     "Your sibling's estate",
  'brother':     "Your brother's estate",
  'sister':      "Your sister's estate",
  'grandparent': "Your grandparent's estate",
  'grandfather': "Your grandfather's estate",
  'grandmother': "Your grandmother's estate",
  'aunt':        "Your aunt's estate",
  'uncle':       "Your uncle's estate",
}

const RELATIONSHIP_POSSESSIVE_ES = {
  'father':      'La herencia de tu padre',
  'padre':       'La herencia de tu padre',
  'mother':      'La herencia de tu madre',
  'madre':       'La herencia de tu madre',
  'parent':      'La herencia de tu progenitor',
  'spouse':      'La herencia de tu cónyuge',
  'husband':     'La herencia de tu esposo',
  'esposo':      'La herencia de tu esposo',
  'wife':        'La herencia de tu esposa',
  'esposa':      'La herencia de tu esposa',
  'partner':     'La herencia de tu pareja',
  'pareja':      'La herencia de tu pareja',
  'sibling':     'La herencia de tu hermano/a',
  'brother':     'La herencia de tu hermano',
  'hermano':     'La herencia de tu hermano',
  'sister':      'La herencia de tu hermana',
  'hermana':     'La herencia de tu hermana',
  'grandparent': 'La herencia de tu abuelo/a',
  'grandfather': 'La herencia de tu abuelo',
  'abuelo':      'La herencia de tu abuelo',
  'grandmother': 'La herencia de tu abuela',
  'abuela':      'La herencia de tu abuela',
  'aunt':        'La herencia de tu tía',
  'tía':         'La herencia de tu tía',
  'uncle':       'La herencia de tu tío',
  'tío':         'La herencia de tu tío',
}

function estateHeadline(decedentName, viewerRelationship, lang, t) {
  const key = (viewerRelationship || '').toLowerCase().trim()
  const map  = lang === 'es' ? RELATIONSHIP_POSSESSIVE_ES : RELATIONSHIP_POSSESSIVE_EN
  const phrase = map[key] ?? null

  if (phrase) return { headline: phrase, sub: decedentName }

  // Fallback: "Estate of Rafael Morales" / "Herencia de Rafael Morales"
  return { headline: `${t('band.estateOf')} ${decedentName}`, sub: null }
}

// Tabler-style outline icons — inline so no icon library dependency yet
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21v-1a6 6 0 0112 0v1" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function TopBand({ caseId, onSwitchCase }) {
  const { lang, setLang, t } = useLanguage()
  const [caseData, setCaseData]     = useState(null)
  const [showSwitcher, setShowSwitcher] = useState(false)

  useEffect(() => {
    if (!caseId) return
    getCase(caseId)
      .then((data) => {
        setCaseData({
          decedentName:       data.decedent_name,
          jurisdictions:      data.jurisdictions ?? [],
          viewerRelationship: data.heirs?.[0]?.relationship ?? null,
        })
      })
      .catch(() => {})
  }, [caseId])

  const jurisdictions = caseData?.jurisdictions ?? []
  const isCrossBorder = jurisdictions.length > 1

  const { headline, sub } = caseData
    ? estateHeadline(caseData.decedentName, caseData.viewerRelationship, lang, t)
    : { headline: t('loading'), sub: null }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-navy flex items-center px-4 gap-3">

        {/* ── Left zone: avatar + name + jurisdiction pills ── */}
        <div className="flex items-center gap-3 flex-1 min-w-0">

          {/* Avatar — seal isotype by default; future: decedent photo */}
          <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden">
            <SealIsotype size={32} />
          </div>

          {/* Name stack */}
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-parchment leading-snug truncate">
              {headline}
            </p>
            {sub && (
              <p className="text-[11px] text-parchment-dark leading-none truncate mt-px">
                {sub}
              </p>
            )}
          </div>

          {/* Jurisdiction pills — visible on md+ screens */}
          {jurisdictions.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {jurisdictions.map((j) => (
                <span key={j}
                  className="text-[11px] text-parchment/70 border border-white/15
                             rounded-full px-2 py-0.5 leading-none whitespace-nowrap">
                  {j}
                </span>
              ))}
              {isCrossBorder && (
                <span className="text-[11px] text-parchment/70 border border-white/15
                                 rounded-full px-2 py-0.5 leading-none whitespace-nowrap">
                  {t('band.crossBorder')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Right zone: language toggle + switch case + account ── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* EN / ES language toggle — two letters, no flags */}
          <div className="flex items-center border border-white/20 rounded-md overflow-hidden">
            {['en', 'es'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2 h-7 text-[11px] font-mono uppercase transition-colors duration-150
                            ${lang === l
                              ? 'bg-white/15 text-parchment'
                              : 'text-parchment/50 hover:text-parchment/80'}`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Switch case — quiet text button with chevron */}
          <button
            onClick={() => setShowSwitcher(true)}
            className="flex items-center gap-1 px-2.5 h-8 rounded-md text-[12px]
                       text-parchment/60 hover:text-parchment hover:bg-white/10
                       transition-colors duration-150"
          >
            {t('band.switchCase')}
            <IconChevronDown />
          </button>

          {/* Account icon — placeholder until auth is built */}
          <button
            aria-label={t('band.account')}
            className="w-8 h-8 flex items-center justify-center rounded-md
                       text-parchment/60 hover:text-parchment hover:bg-white/10
                       transition-colors duration-150"
          >
            <IconUser />
          </button>
        </div>
      </nav>

      {/* Case switcher overlay */}
      {showSwitcher && (
        <CaseSwitcher
          currentCaseId={caseId}
          onSelect={onSwitchCase}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </>
  )
}
