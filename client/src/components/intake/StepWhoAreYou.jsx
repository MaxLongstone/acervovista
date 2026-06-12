import StepShell from './StepShell'

export default function StepWhoAreYou({ answers, onUpdate, onNext }) {
  return (
    <StepShell
      title="Who are you?"
      onNext={onNext}
      nextDisabled={!answers.userType}
    >
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onUpdate({ userType: 'consumer' })}
          className={`text-left p-4 rounded border ${
            answers.userType === 'consumer'
              ? 'border-navy bg-gray'
              : 'border-gray'
          }`}
        >
          Family member or heir
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ userType: 'professional' })}
          className={`text-left p-4 rounded border ${
            answers.userType === 'professional'
              ? 'border-navy bg-gray'
              : 'border-gray'
          }`}
        >
          I'm here professionally
        </button>
      </div>
      {answers.userType === 'professional' && (
        <p className="text-sm text-ink">
          Professional access requires credential verification. We'll set
          that up. For now, let's start with the basics.
        </p>
      )}
    </StepShell>
  )
}
