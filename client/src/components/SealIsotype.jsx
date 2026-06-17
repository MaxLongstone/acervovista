/**
 * The Acervo Vista seal isotype — navy document with a stamp-red bar at bottom.
 * Used in: Nav (intake), TopBand (avatar default), TakeABreath.
 * Always rendered complete; never shown as a placeholder or "add photo" nudge.
 */
export default function SealIsotype({ size = 32, className = '' }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="40" cy="40" r="36" fill="#F5F0E8" />
      <circle cx="40" cy="40" r="29.5" fill="none" stroke="#0F1F38" strokeWidth="1.5" opacity="0.12" />
      <rect x="24" y="20" width="32" height="38" rx="2.5" fill="#0F1F38" />
      <line x1="29" y1="28" x2="50" y2="28" stroke="#F5F0E8" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <line x1="29" y1="34" x2="47" y2="34" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.50" />
      <line x1="29" y1="40" x2="43" y2="40" stroke="#F5F0E8" strokeWidth="1.4" strokeLinecap="round" opacity="0.30" />
      <path d="M24 49 L56 49 L56 55.5 Q56 58 53.5 58 L26.5 58 Q24 58 24 55.5 Z" fill="#C0392B" />
    </svg>
  )
}
