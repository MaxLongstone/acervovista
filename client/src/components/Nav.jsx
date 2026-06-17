import SealIsotype from './SealIsotype'

// Shown during intake only (no active case).
// When a case is active, TopBand replaces this.
export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-navy flex items-center px-6 gap-3">
      <SealIsotype size={32} />
      <span className="font-display font-bold text-[18px] tracking-tight select-none">
        <span className="text-parchment">Acervo</span>
        <span className="text-stamp">Vista</span>
      </span>
    </nav>
  )
}
