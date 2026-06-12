export default function StepShell({
  title,
  children,
  onNext,
  onBack,
  nextDisabled,
  nextLabel = 'Continue',
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray px-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-8">
        <h1 className="font-serif text-2xl text-navy mb-6">{title}</h1>
        <div className="space-y-4">{children}</div>
        <div className="mt-8 flex justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="text-ink underline"
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
            className="bg-navy text-white px-6 py-2 rounded disabled:opacity-40"
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
