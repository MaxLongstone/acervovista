import { DOCUMENT_TYPE_LABELS } from './documentTypes.js'

const COLORS = {
  navy: '#0F1F38',
  red: '#C0392B',
  ink: '#4A4A6A',
  gray: '#F2F4F7',
  green: '#1D9E75',
  gold: '#B8860B',
}

const COMPLEXITY_DESCRIPTIONS = {
  CROSS_BORDER:
    'Cross-border assets or parties detected. Ancillary probate and/or apostille requirements likely apply.',
  CONTESTED:
    'Heirs have indicated disagreement. Will contest risk and fiduciary duty conflicts should be assessed.',
  PRE_DEATH_XFER:
    'Pre-death transfers reported within 2 years of death. Fraudulent transfer analysis may be warranted.',
  BUSINESS:
    'Business interests present. Operating agreement review and valuation will be required.',
  MINOR_CHILDREN:
    'Minor children are heirs. Court approval for distributions and guardian ad litem may be required.',
  INTESTATE: 'No will has been located. Intestate succession rules apply.',
  MULTI_HEIR: 'Multiple heirs recorded.',
}

function fmt(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function boolLabel(val) {
  if (val === true || val === 'yes') return 'Yes'
  if (val === false || val === 'no') return 'No'
  if (val === 'unknown') return 'Unknown'
  if (val === 'complicated') return 'Complicated'
  return val ?? '—'
}

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Arial, sans-serif; font-size: 12px; color: ${COLORS.ink}; }
h3 { font-size: 15px; color: ${COLORS.navy}; text-decoration: underline; margin: 24px 0 12px; }
hr.rule { border: none; border-top: 2px solid ${COLORS.navy}; margin: 16px 0; }
hr.thin { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
table { width: 100%; border-collapse: collapse; }
td { padding: 5px 8px; vertical-align: top; }
td.lbl { font-weight: bold; color: ${COLORS.navy}; width: 38%; }
.page { page-break-after: always; padding: 72px; padding-bottom: 60px; min-height: 100vh; position: relative; }
.page:last-child { page-break-after: auto; }
.footer { position: absolute; bottom: 28px; left: 72px; right: 72px; border-top: 1px solid ${COLORS.navy}; padding-top: 6px; display: flex; justify-content: space-between; font-size: 10px; }
.disclaimer { background: ${COLORS.gray}; border-left: 4px solid ${COLORS.red}; padding: 12px 16px; margin-top: 24px; font-size: 11px; line-height: 1.6; }
.badge-gold { background: ${COLORS.gold}; color: white; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 3px; display: inline-block; margin-right: 6px; }
.badge-red { background: ${COLORS.red}; color: white; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 3px; display: inline-block; margin-right: 6px; }
.tl-row { display: flex; gap: 16px; align-items: baseline; }
.tl-date { font-weight: bold; color: ${COLORS.navy}; min-width: 160px; }
`

function footer(n) {
  return `<div class="footer">
    <span>AcervoVista — Confidential</span>
    <span>Page ${n}</span>
    <span>Not legal advice</span>
  </div>`
}

export function buildHandoffHtml({ caseRow, heirs, documents, timeline, gapMap }) {
  const flags = Array.isArray(caseRow.complexity_flags) ? caseRow.complexity_flags : []
  const today = fmt(new Date())

  // PAGE 1 — COVER
  const page1 = `<div class="page">
    <div style="font-size:28px;font-weight:bold;color:${COLORS.navy};">AcervoVista</div>
    <div style="font-size:18px;color:${COLORS.ink};margin-top:4px;">Lawyer Handoff Package</div>
    <hr class="rule" />
    <div style="margin-top:32px;">
      <div style="font-size:22px;font-weight:bold;color:${COLORS.navy};">${caseRow.decedent_name}</div>
      <div style="margin-top:8px;">Date of death: ${fmt(caseRow.date_of_death)} &nbsp;|&nbsp; State of domicile: ${caseRow.state_of_domicile ?? '—'}</div>
      <div style="margin-top:4px;">Case opened: ${fmt(caseRow.intake_completed_at)}</div>
      <div style="margin-top:4px;">Generated: ${today}</div>
    </div>
    <div class="disclaimer">
      This document is prepared for organizational purposes only. It does not constitute legal advice
      and should not be relied upon as such. All legal conclusions, strategies, and recommendations
      are the sole responsibility of the reviewing attorney.
    </div>
    ${footer(1)}
  </div>`

  // PAGE 2 — CASE SUMMARY & HEIRS
  const flagText = flags.length
    ? flags.map((f) => COMPLEXITY_DESCRIPTIONS[f] ?? f).join('; ')
    : 'None'

  const heirsRows = heirs.length
    ? heirs.map((h) => `<tr><td>${h.full_name}</td><td>${h.relationship}</td><td>${h.residence}</td></tr>`).join('')
    : `<tr><td colspan="3" style="font-style:italic;">No heirs recorded in intake.</td></tr>`

  const page2 = `<div class="page">
    <h3>Case Summary</h3>
    <table>
      <tr><td class="lbl">Decedent full name</td><td>${caseRow.decedent_name}</td></tr>
      <tr><td class="lbl">Date of death</td><td>${fmt(caseRow.date_of_death)}</td></tr>
      <tr><td class="lbl">State of domicile</td><td>${caseRow.state_of_domicile ?? '—'}</td></tr>
      <tr><td class="lbl">Marital status</td><td>${caseRow.marital_status ?? '—'}${caseRow.spouse_name ? ` — ${caseRow.spouse_name}` : ''}</td></tr>
      <tr><td class="lbl">Will</td><td>${boolLabel(caseRow.has_will)} — located: ${boolLabel(caseRow.will_located)}</td></tr>
      <tr><td class="lbl">Heirs in agreement</td><td>${boolLabel(caseRow.heirs_in_agreement)}</td></tr>
      <tr><td class="lbl">Pre-death transfers</td><td>${boolLabel(caseRow.pre_death_transfers)}</td></tr>
      <tr><td class="lbl">Complexity indicators</td><td>${flagText}</td></tr>
    </table>
    <h3>People — Who's Who</h3>
    <table>
      <tr style="font-weight:bold;color:${COLORS.navy};"><td>Full Name</td><td>Relationship</td><td>Residence</td></tr>
      ${heirsRows}
    </table>
    ${footer(2)}
  </div>`

  // PAGE 3 — DOCUMENT INVENTORY
  const docsHtml = documents.length
    ? documents.map((d, i) => `<div>
        <div style="font-weight:bold;color:${COLORS.navy};">${DOCUMENT_TYPE_LABELS[d.document_type] ?? d.document_type}</div>
        <div style="margin-top:2px;">${d.filename}</div>
        ${d.extracted_date ? `<div style="margin-top:2px;">Dated ${fmt(d.extracted_date)}</div>` : ''}
        <div style="margin-top:2px;">Uploaded: ${fmt(d.uploaded_at)}</div>
        ${i < documents.length - 1 ? '<hr class="thin" />' : ''}
      </div>`).join('')
    : `<p style="font-style:italic;">No documents have been uploaded to this case.</p>`

  const page3 = `<div class="page">
    <h3>Documents Collected</h3>
    ${docsHtml}
    ${footer(3)}
  </div>`

  // PAGE 4 — GAP ANALYSIS
  const nonGreen = gapMap.filter((g) => g.status !== 'green')
  const gapHtml = nonGreen.length
    ? nonGreen.map((g) => `<div>
        ${g.status === 'gold'
          ? `<span class="badge-gold">PENDING</span>`
          : `<span class="badge-red">MISSING — CRITICAL</span>`}
        <span style="font-weight:bold;color:${COLORS.navy};">${g.name}</span>
        <div style="font-style:italic;margin-top:4px;">${g.why}</div>
        <div style="margin-top:2px;">Obtain from: ${g.where}</div>
      </div>`).join('<hr class="thin" />')
    : `<p style="font-style:italic;color:${COLORS.green};">All required documents for this case type have been collected.</p>`

  const page4 = `<div class="page">
    <h3>Missing &amp; Pending Documents</h3>
    ${gapHtml}
    ${footer(4)}
  </div>`

  // PAGE 5 — TIMELINE
  const tlHtml = timeline.length
    ? timeline.map((e, i) => `<div>
        <div class="tl-row">
          <span class="tl-date">${fmt(e.event_at)}</span>
          <span>${e.label}${e.document_type ? ` — ${DOCUMENT_TYPE_LABELS[e.document_type] ?? e.document_type}` : ''}</span>
        </div>
        ${i < timeline.length - 1 ? '<hr class="thin" />' : ''}
      </div>`).join('')
    : `<p style="font-style:italic;">No timeline events recorded.</p>`

  const page5 = `<div class="page">
    <h3>Case Timeline</h3>
    ${tlHtml}
    ${footer(5)}
  </div>`

  // PAGE 6 — COMPLEXITY FLAGS
  const flagsHtml = flags.length
    ? flags.map((f) => `<div>
        <div style="font-weight:bold;color:${COLORS.navy};">${f}</div>
        <div style="margin-top:3px;">${COMPLEXITY_DESCRIPTIONS[f] ?? f}</div>
      </div>`).join('<hr class="thin" />')
    : `<p style="font-style:italic;">No complexity flags were detected during intake.</p>`

  const page6 = `<div class="page">
    <h3>Flags for Attorney Review</h3>
    ${flagsHtml}
    ${footer(6)}
  </div>`

  // PAGE 7 — LAWYER QUESTIONS CHECKLIST
  const LAWYER_QUESTIONS_PDF = [
    {
      category: 'The Process',
      questions: [
        'How long will this process take from start to finish?',
        'What is the typical total cost — attorney fees, court fees, and other expenses?',
        'Does this estate qualify for a simplified process, or does it require full administration?',
        'What is the first thing we need to file, and when does that deadline begin?',
        'Are there any immediate deadlines we need to be aware of right now?',
      ],
    },
    {
      category: 'The Will & Distribution',
      questions: [
        'Is the will likely to be admitted to court without issues, or do you see any problems with it?',
        'What happens if an heir cannot be located or is deceased?',
        'How are debts paid — before or after distributions to heirs?',
        hasWill === 'no'
          ? 'How does intestate succession work in this state for our family situation?'
          : 'Are there specific bequests (jewelry, vehicles, etc.) we need to set aside before anything is sold?',
      ],
    },
    {
      category: 'Real Estate & Assets',
      questions: [
        'What steps are needed to transfer the home or other real estate into the heirs\' names?',
        'Which accounts pass directly to beneficiaries outside of the estate process?',
        'How do we notify and access bank accounts that were solely in the decedent\'s name?',
        'Are retirement accounts (IRA, 401k) part of the estate or do they go directly to named beneficiaries?',
      ],
    },
    {
      category: 'Taxes',
      questions: [
        'Will the estate be required to file a federal or state estate tax return?',
        'Does someone need to file a final individual income tax return for the decedent?',
        'What is the step-up in basis and how does it affect inherited assets?',
      ],
    },
    flags.includes('CROSS_BORDER') && {
      category: 'Cross-Border Matters (flagged)',
      questions: [
        'Do we need separate legal proceedings in another state or country?',
        'What apostille or certified translation requirements apply?',
        'How does a Declaratoria de Herederos or foreign heirship document interact with this estate?',
      ],
    },
    flags.includes('BUSINESS') && {
      category: 'Business Interests (flagged)',
      questions: [
        'How do we handle the business during administration and what is our liability?',
        'Is a business valuation required, and who orders it?',
      ],
    },
    flags.includes('CONTESTED') && {
      category: 'Contested Estate (flagged)',
      questions: [
        'If someone contests the will, what is the process and what are our options?',
        'What fiduciary duties does the Personal Representative have when heirs disagree?',
      ],
    },
    flags.includes('PRE_DEATH_XFER') && {
      category: 'Pre-Death Transfers (flagged)',
      questions: [
        'Could pre-death transfers be challenged as fraudulent conveyances?',
        'What documentation do we need to defend those transfers?',
      ],
    },
  ].filter(Boolean)

  const questionsHtml = LAWYER_QUESTIONS_PDF.map((section) => `
    <div style="margin-bottom:18px;">
      <div style="font-weight:bold;color:${COLORS.navy};font-size:12px;margin-bottom:8px;">${section.category}</div>
      ${section.questions.map((q) => `
        <div style="display:flex;gap:10px;margin-bottom:6px;align-items:baseline;">
          <span style="flex-shrink:0;width:12px;height:12px;border:1.5px solid ${COLORS.ink};border-radius:2px;display:inline-block;margin-top:1px;"></span>
          <span style="font-size:11px;line-height:1.55;color:${COLORS.ink};">${q}</span>
        </div>`).join('')}
    </div>`).join('')

  const page7 = `<div class="page">
    <h3>Questions to Ask Your Attorney</h3>
    <p style="font-size:11px;color:${COLORS.ink};margin-bottom:20px;line-height:1.6;">
      The following questions are organized by topic and are provided as a preparation aid for your first attorney meeting.
      Questions in flagged sections were generated based on complexity indicators identified during intake.
    </p>
    ${questionsHtml}
    ${footer(7)}
  </div>`

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><style>${CSS}</style></head>
<body>${page1}${page2}${page3}${page4}${page5}${page6}${page7}</body>
</html>`
}
