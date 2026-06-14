import StepShell from './StepShell'

export default function StepWhoAreYou({ answers, onUpdate, onNext }) {
  return (
    <StepShell
      title="Who are you?"
      subtitle="Let's start simply."
      step={1}
      onNext={onNext}
      nextDisabled={!answers.userType}
    >
      <div className="flex flex-col gap-3">
        {[
          { value: 'consumer', label: 'Family member or heir' },
          { value: 'professional', label: "I'm here professionally" },
        ].map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onUpdate({ userType: value })}
            className={`text-left px-4 py-4 rounded-md border text-[15px] text-ink
                        transition-colors duration-150
                        ${answers.userType === value
                          ? 'border-navy bg-parchment font-medium'
                          : 'border-parchment-deep hover:border-navy-light'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {answers.userType === 'professional' && (
        <p className="text-sm text-ink-mid mt-2">
          Professional access requires credential verification. We'll set
          that up. For now, let's start with the basics.
        </p>
      )}
    </StepShell>
  )
}
