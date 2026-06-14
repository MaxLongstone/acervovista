import {
  COMPLEXITY_MESSAGES,
  AGREEMENT_LABELS,
  TRANSFER_LABELS,
} from '../../complexityMessages'
import GriefResources from './GriefResources'

export default function CaseSummaryCard({ caseData, onStartUploading }) {
  const complexityFlags = caseData.complexity_flags || []
  const messages = complexityFlags.map((flag) => COMPLEXITY_MESSAGES[flag]).filter(Boolean)

  // Build context label: state · will status
  const contextParts = [
    caseData.stateOfDomicile,
    caseData.hasWill === 'yes' ? 'With Will' : caseData.hasWill === 'no' ? 'Intestate' : null,
  ].filter(Boolean)

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment px-4 py-12">
      <div className="max-w-xl w-full animate-page-enter">

        {/* Case header */}
        <div className="mb-6">
          {contextParts.length > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-2">
              Active Case · {contextParts.join(' · ')}
            </p>
          )}
          <h1 className="font-display font-bold text-[28px] text-navy leading-tight">
            Estate of {caseData.decedentName}
          </h1>
        </div>

        {/* White card — no shadow, parchment border */}
        <div className="bg-white border border-parchment-deep rounded-lg p-8 space-y-6">

          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
              Decedent
            </h2>
            <p className="text-[15px] text-ink leading-[1.7]">
              Date of death:{' '}
              <span className="font-mono text-[13px] text-ink-mid">{caseData.dateOfDeath}</span>
            </p>
            <p className="text-[15px] text-ink leading-[1.7]">State: {caseData.stateOfDomicile}</p>
            {caseData.maritalStatus === 'Married' && (
              <p className="text-[15px] text-ink leading-[1.7]">
                Surviving spouse: {caseData.spouseName}
              </p>
            )}
          </section>

          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
              Heirs
            </h2>
            <ul className="space-y-1">
              {caseData.heirs.map((heir, i) => (
                <li key={i} className="text-[15px] text-ink leading-[1.7]">
                  {heir.fullName}
                  <span className="text-ink-mid"> · {heir.relationship}, {heir.residence}</span>
                </li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-mid mt-2">
              Heirs in agreement: {AGREEMENT_LABELS[caseData.heirsInAgreement]}
            </p>
          </section>

          <section>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
              Assets
            </h2>
            <ul className="space-y-1">
              {caseData.assets.map((asset) => (
                <li key={asset} className="text-[15px] text-ink leading-[1.7]">{asset}</li>
              ))}
            </ul>
            <p className="text-[13px] text-ink-mid mt-2">
              Pre-death transfers: {TRANSFER_LABELS[caseData.preDeathTransfers]}
            </p>
          </section>

          {messages.length > 0 && (
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
                A Few Things Worth Knowing
              </h2>
              <ul className="space-y-2">
                {messages.map((msg) => (
                  <li key={msg}
                    className="text-[14px] text-ink-mid bg-parchment border border-parchment-deep
                               rounded-md px-4 py-3 leading-[1.7]">
                    {msg}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="text-[15px] text-ink leading-[1.7]">
            Your case file is started. The next step is to begin uploading documents.
          </p>

          <button
            type="button"
            onClick={onStartUploading}
            className="w-full bg-navy text-parchment h-11 rounded-md text-sm font-medium
                       hover:bg-navy-mid transition-colors duration-150"
          >
            Start uploading documents
          </button>

          {/* Grief resources — quiet, separate, after the CTA */}
          <GriefResources heirs={caseData.heirs} stateOfDomicile={caseData.stateOfDomicile} />

        </div>
      </div>
    </div>
  )
}
