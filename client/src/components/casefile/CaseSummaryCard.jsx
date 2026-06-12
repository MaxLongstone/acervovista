import {
  COMPLEXITY_MESSAGES,
  AGREEMENT_LABELS,
  TRANSFER_LABELS,
} from '../../complexityMessages'

export default function CaseSummaryCard({ caseData, onStartUploading }) {
  const complexityFlags = caseData.complexity_flags || []
  const messages = complexityFlags
    .map((flag) => COMPLEXITY_MESSAGES[flag])
    .filter(Boolean)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray px-4">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-8 space-y-6">
        <h1 className="font-serif text-2xl text-navy">Your case file</h1>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Decedent</h2>
          <p>{caseData.decedentName}</p>
          <p className="text-sm text-ink">Date of death: {caseData.dateOfDeath}</p>
          <p className="text-sm text-ink">State of domicile: {caseData.stateOfDomicile}</p>
          {caseData.maritalStatus === 'Married' && (
            <p className="text-sm text-ink">Surviving spouse: {caseData.spouseName}</p>
          )}
        </section>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Heirs</h2>
          <ul className="space-y-1">
            {caseData.heirs.map((heir, index) => (
              <li key={index} className="text-sm text-ink">
                {heir.fullName} ({heir.relationship}, {heir.residence})
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink mt-1">
            Heirs in agreement: {AGREEMENT_LABELS[caseData.heirsInAgreement]}
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-navy mb-2">Assets</h2>
          <ul className="list-disc list-inside text-sm text-ink">
            {caseData.assets.map((asset) => (
              <li key={asset}>{asset}</li>
            ))}
          </ul>
          <p className="text-sm text-ink mt-1">
            Pre-death transfers: {TRANSFER_LABELS[caseData.preDeathTransfers]}
          </p>
        </section>

        {messages.length > 0 && (
          <section>
            <h2 className="font-serif text-lg text-navy mb-2">
              A few things worth knowing
            </h2>
            <ul className="space-y-2">
              {messages.map((message) => (
                <li key={message} className="text-sm text-ink bg-gray rounded p-3">
                  {message}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-ink">
          Your case file is started. The next step is to begin uploading
          documents.
        </p>

        <button
          type="button"
          onClick={onStartUploading}
          className="bg-navy text-white px-6 py-2 rounded"
        >
          Start uploading
        </button>
      </div>
    </div>
  )
}
