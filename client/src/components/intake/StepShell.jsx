export default function StepShell({
  title,
  subtitle,
  step,
  totalSteps = 6,
  children,
  onNext,
  onBack,
  nextDisabled,
  nextLabel = 'Continue',
}) {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment px-4 py-12">
      <div className="max-w-xl w-full animate-page-enter">

        {/* Step progress dots */}
        {step && (
          <div className="flex gap-2 mb-8 justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors duration-150 ${
                  i < step - 1 ? 'bg-present'
                  : i === step - 1 ? 'bg-navy'
                  : 'bg-parchment-deep'
                }`}
              />
            ))}
          </div>
        )}

        {/* White card — parchment-deep border, no shadow */}
        <div className="bg-white border border-parchment-deep rounded-lg p-8">
          {/* Guide opening line — Playfair italic */}
          {subtitle && (
            <p className="font-display italic text-[18px] text-navy leading-snug mb-4">
              {subtitle}
            </p>
          )}

          <h1 className="font-display font-bold text-2xl text-navy mb-6 leading-tight">
            {title}
          </h1>

          <div className="space-y-4 text-[15px] text-ink leading-[1.7]">
            {children}
          </div>

          <div className="mt-8 flex justify-between items-center">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="text-ink-mid text-sm hover:text-navy transition-colors duration-150
                           underline underline-offset-2"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onNext}
              disabled={nextDisabled}
              className="bg-navy text-parchment px-6 h-11 rounded-md text-sm font-medium
                         hover:bg-navy-mid transition-colors duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {nextLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
