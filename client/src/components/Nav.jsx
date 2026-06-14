export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-navy flex items-center px-6 gap-3">
      {/* Seal isotype — red wax at bottom is the only stamp color in the nav */}
      <svg viewBox="0 0 80 80" width="32" height="32" fill="none" aria-hidden="true">
        <circle cx="40" cy="40" r="36" fill="#F5F0E8"/>
        <circle cx="40" cy="40" r="29.5" fill="none" stroke="#0F1F38" strokeWidth="1.5" opacity="0.12"/>
        <rect x="24" y="20" width="32" height="38" rx="2.5" fill="#0F1F38"/>
        <line x1="29" y1="28" x2="50" y2="28" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75"/>
        <line x1="29" y1="34" x2="47" y2="34" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.50"/>
        <line x1="29" y1="40" x2="43" y2="40" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.30"/>
        <path d="M24 49 L56 49 L56 55.5 Q56 58 53.5 58 L26.5 58 Q24 58 24 55.5 Z" fill="#C0392B"/>
      </svg>

      {/* Wordmark */}
      <span className="font-display font-bold text-[18px] tracking-tight select-none">
        <span className="text-parchment">Acervo</span>
        <span className="text-stamp">Vista</span>
      </span>
    </nav>
  )
}
