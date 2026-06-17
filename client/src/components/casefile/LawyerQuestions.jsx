import { useState } from 'react'

const QUESTION_BANK = [
  {
    category: 'The Process',
    questions: [
      { id: 'p1', text: 'How long will this process take from start to finish?' },
      { id: 'p2', text: 'What is the typical total cost — attorney fees, court fees, and other expenses?' },
      { id: 'p3', text: 'Does this estate qualify for a simplified process, or does it require full administration?' },
      { id: 'p4', text: 'What is the first thing we need to file, and when does that deadline begin?' },
      { id: 'p5', text: 'Are there any immediate deadlines we need to be aware of right now?' },
      { id: 'p6', text: 'Who will be our main point of contact at your office, and how quickly do you typically respond?' },
    ],
  },
  {
    category: 'The Will & Distribution',
    questions: [
      { id: 'w1', text: 'Is the will likely to be admitted to court without issues, or do you see any problems with it?' },
      { id: 'w2', text: 'Are there any provisions in the will that seem unusual or hard to enforce?' },
      { id: 'w3', text: 'What happens if an heir cannot be located or is deceased?' },
      { id: 'w4', text: 'Are there specific bequests (jewelry, vehicles, etc.) we need to set aside before anything is sold?' },
      { id: 'w5', text: 'How are debts paid — does that happen before or after distributions to heirs?' },
      { id: 'w6', text: 'If there is no will, how does intestate succession work in this state for our family situation?' },
    ],
  },
  {
    category: 'Real Estate',
    questions: [
      { id: 'r1', text: 'What steps are needed to transfer the home into the heirs\' names?' },
      { id: 'r2', text: 'If we want to sell the property, what is the process and who has to sign?' },
      { id: 'r3', text: 'Is there a mortgage? What happens to it during administration?' },
      { id: 'r4', text: 'The property may have a Lady Bird deed or life estate — how does that affect the process?' },
      { id: 'r5', text: 'Are there any property tax exemptions (homestead, senior) that could be lost and need to be addressed?' },
      { id: 'r6', text: 'Do we need a property appraisal, and if so, how does that affect estate value and taxes?' },
    ],
  },
  {
    category: 'Financial Accounts & Assets',
    questions: [
      { id: 'f1', text: 'Which accounts pass directly to beneficiaries outside of the estate process?' },
      { id: 'f2', text: 'How do we notify and access bank accounts that were solely in the decedent\'s name?' },
      { id: 'f3', text: 'What should we do about joint accounts that are still active?' },
      { id: 'f4', text: 'Are retirement accounts (IRA, 401k) part of the estate, or do they go directly to named beneficiaries?' },
      { id: 'f5', text: 'How do we file a life insurance claim, and how long does that typically take?' },
      { id: 'f6', text: 'Are there digital assets (cryptocurrency, online accounts) we need to inventory and address?' },
    ],
  },
  {
    category: 'Taxes',
    questions: [
      { id: 't1', text: 'Will the estate be required to file a federal or state estate tax return?' },
      { id: 't2', text: 'Does someone need to file a final individual income tax return for the decedent?' },
      { id: 't3', text: 'Will the estate itself need to file income tax returns during administration?' },
      { id: 't4', text: 'Are there capital gains implications if we sell property or investments?' },
      { id: 't5', text: 'What is the step-up in basis and how does it affect inherited assets?' },
    ],
  },
  {
    category: 'Family & Heir Dynamics',
    questions: [
      { id: 'h1', text: 'One of the heirs lives in another country — does that complicate the process?' },
      { id: 'h2', text: 'Not all heirs are in agreement about how to proceed — what options do we have?' },
      { id: 'h3', text: 'Can an heir disclaim or waive their inheritance, and why might they want to?' },
      { id: 'h4', text: 'If there are minor heirs, how are distributions handled and does the court need to approve?' },
      { id: 'h5', text: 'Are there creditors we know about — do they have rights that take priority over heirs?' },
    ],
  },
  {
    category: 'Special Circumstances',
    questions: [
      { id: 's1', text: 'There were transfers of property or money in the two years before death — could those be challenged?' },
      { id: 's2', text: 'The decedent owned a business — how do we handle it during administration and what is our liability?' },
      { id: 's3', text: 'There are assets in another state or country — do we need separate legal proceedings there?' },
      { id: 's4', text: 'The estate has outstanding loans or mortgages — what is our responsibility for those?' },
      { id: 's5', text: 'If someone contests the will, what is the process and what are our options?' },
      { id: 's6', text: 'Are there any pending lawsuits involving the decedent or their estate?' },
    ],
  },
]

const ALL_QUESTIONS = QUESTION_BANK.flatMap((cat) => cat.questions)

export default function LawyerQuestions() {
  const [checked, setChecked] = useState(new Set())
  const [isExpanded, setIsExpanded] = useState(false)

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const checkedCount = checked.size
  const totalCount = ALL_QUESTIONS.length
  const pct = Math.round((checkedCount / totalCount) * 100)

  return (
    <section className="bg-white border border-parchment-deep rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full px-5 py-5 flex items-start justify-between gap-4 text-left
                   hover:bg-parchment/40 transition-colors duration-150"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-display text-[17px] font-semibold text-navy">
              Questions for Your Lawyer
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-wider
                             bg-parchment-deep text-ink-mid px-2 py-0.5 rounded-sm">
              {totalCount} questions
            </span>
          </div>
          <p className="text-sm text-ink-mid leading-[1.7]">
            A preparation checklist for your first attorney meeting. Check off
            questions as you discuss them.
          </p>

          {/* Progress bar */}
          {checkedCount > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-parchment-deep overflow-hidden">
                <div
                  className="h-full rounded-full bg-present transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-ink-light shrink-0">
                {checkedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>
        <span className="text-ink-light mt-1 shrink-0 text-lg leading-none">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {/* Question list */}
      {isExpanded && (
        <div className="border-t border-parchment-deep divide-y divide-parchment-deep">
          {QUESTION_BANK.map((cat) => (
            <div key={cat.category} className="px-5 py-4">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-light mb-3">
                {cat.category}
              </h3>
              <ul className="space-y-2.5">
                {cat.questions.map((q) => {
                  const isChecked = checked.has(q.id)
                  return (
                    <li key={q.id}>
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <span
                          className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center
                                      transition-colors duration-150
                                      ${isChecked
                                        ? 'bg-navy border-navy'
                                        : 'border-parchment-deep group-hover:border-navy-light'
                                      }`}
                          onClick={() => toggle(q.id)}
                        >
                          {isChecked && (
                            <svg className="w-2.5 h-2.5 text-parchment" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span
                          className={`text-[14px] leading-[1.65] transition-colors duration-150
                                      ${isChecked ? 'text-ink-light line-through' : 'text-ink'}`}
                          onClick={() => toggle(q.id)}
                        >
                          {q.text}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="border-t border-parchment-deep px-5 py-3 text-xs text-ink-light">
        These questions are for preparation purposes only and do not constitute legal advice.
      </p>
    </section>
  )
}
