/**
 * English strings — source of record for all user-facing copy.
 *
 * Keys are logical names, never raw English text, so Spanish (and future
 * languages) can diverge in structure without hunting for string literals.
 *
 * STANCE STRINGS: Lines marked // [STANCE] carry deliberate editorial weight
 * (the chronology-not-judgment wall). Any change to these requires the same
 * editorial review as the original English.
 *
 * [HUMAN_REVIEW] lines must be reviewed by the founding network before launch.
 */

const en = {
  // ── Navigation / top band ──────────────────────────────────────────────────
  'band.switchCase':        'Switch case',
  'band.account':           'Account',
  'band.estateOf':          'Estate of',        // fallback: "Estate of Rafael Morales"
  'band.crossBorder':       'Cross-border',

  // ── Case switcher ──────────────────────────────────────────────────────────
  'switcher.title':         'Your cases',
  'switcher.enter':         'Enter',
  'switcher.opened':        'Opened',
  'switcher.active':        'Active',
  'switcher.closed':        'Closed',
  'switcher.empty':         'No cases found.',

  // ── Item states (gap map, timeline, dwell page) ───────────────────────────
  // [STANCE] These labels appear next to every item. They describe document
  // status, never the heir's conduct. Review before changing.
  'state.confirmed':        'Confirmed',
  'state.pending':          'Pending',
  'state.missing':          'Missing',          // [STANCE] document absent, not heir's fault
  'state.flagged':          'Flagged',          // [STANCE] factual note, not accusation
  'state.unknown':          'Held',             // [STANCE] "Held" not "Unverified" — deliberate

  // ── Conflict / flagged item copy ──────────────────────────────────────────
  // [STANCE] The conflict description must state facts from each source without
  // implying fraud, error, or suspicion. "indicates" / "states" not "contradicts".
  'conflict.documentIndicates': 'A document indicates:',  // [STANCE] not "shows conflict"
  'conflict.youStated':         'You stated:',
  'conflict.callout':           'This item has a conflict that needs attention before the estate can proceed.',  // [STANCE]
  'conflict.limitOfKnowledge':  'Acervo Vista can show you both accounts. Resolving which is legally correct requires your attorney.',  // [STANCE] [HUMAN_REVIEW]

  // ── Standing panel (Block 3) ──────────────────────────────────────────────
  // [STANCE] Three-beat structure: reassure → orient → point.
  // Beat 1 degrades honestly — never says more than the case earns.
  'standing.strong':          'You’re further along than most.',   // [STANCE]
  'standing.mid':             'You’ve made real progress here.',   // [STANCE]
  'standing.thin':            'You’ve built a solid file.',        // [STANCE]
  'standing.orient':          'Here’s what still needs attention.',
  // Point — deadline (red)
  'standing.deadline':        '{title} is coming up soon.',
  // Point — missing critical doc (blue)
  'standing.missing':         '{title} hasn’t arrived yet — it unlocks several next steps.',  // [STANCE]
  // Point — flagged conflict (soft blue, calmest)  [WALL: "lists" not "contradicts"]
  'standing.conflict':        'One document lists a different account for {title}. Your attorney can confirm which record applies.',  // [STANCE]

  // ── Five-state counts row ─────────────────────────────────────────────────
  'standing.confirmed':       'Confirmed',
  'standing.pending':         'Pending',
  'standing.missing.label':   'Missing',
  'standing.flagged':         'Flagged',
  'standing.unknown':         'Held',

  // ── Dwell page (Block 6) ──────────────────────────────────────────────────
  // [VERBATIM] The limit-of-knowledge and lawyer-band copy below must not be
  // paraphrased. Wording was reviewed for legal neutrality and emotional safety.
  'dwell.back':           'Back to case file',
  'dwell.onFileStates':   'The deed on file states',
  'dwell.youDescribed':   'You described',

  // [VERBATIM] [STANCE]
  'dwell.limitOfKnowledge':
    'We’re not saying which is right, or that anything improper happened — only that they don’t match, and that’s worth understanding.',

  'dwell.whatYouCanDo':   'What you can do',
  'dwell.selfServe1.title': 'Pull the public county deed history',
  'dwell.selfServe1.desc':  'Miami-Dade keeps deed transfers in the public record. Search the Official Records by address to see the full transfer history for this property.',
  'dwell.selfServe1.link':  'Open Miami-Dade Official Records →',
  'dwell.selfServe2.title': 'Add what you remember',
  'dwell.selfServe2.desc':  'Anything you know about the property or this transfer goes into your file.',
  'dwell.selfServe2.cta':   'Add a note',

  // [VERBATIM] [STANCE] Both possibilities held open — never implies outcome.
  'dwell.lawyerBand':
    'A property leaving someone’s name while they’re alive can be perfectly ordinary — or not. Only a lawyer can tell you which. Your file is built to hand over.',

  'dwell.touches':          'Where this touches the rest',
  'dwell.touchTimeline':    'Timeline · August 2023',
  'dwell.touchEstimate':    'Estate estimate',

  // [STANCE] "stir things up" — gentle, honest, not alarming.
  'dwell.breathFlag':       'This one can stir things up. Take your time.',  // [STANCE]

  // ── Item peek (Block 5) ───────────────────────────────────────────────────
  // [STANCE] CTAs are verbs of attention, never alarm.
  // "Look at this more closely" — never "Resolve conflict" / "Fix"
  // "Where to get it" — never "Obtain" / "Provide"
  'peek.close':           'Close',
  'peek.whereToGet':      'Where to get it',         // [STANCE] missing items
  'peek.lookMore':        'Look at this more closely', // [STANCE] flagged items
  'peek.fullRecord':      'See the full record',      // confirmed / pending
  'peek.onFileStates':    'The document on file states:',  // [STANCE] not "shows" / "claims"
  'peek.youDescribed':    'You described:',
  'peek.filed':           'Filed',

  // ── Dashboard body (Block 4) ──────────────────────────────────────────────
  'body.file':           'Your file',
  'body.happened':       'What happened',
  'body.viewAll':        'View all →',
  'body.fullTimeline':   'Full timeline →',
  'body.noDate':         'No date',

  // ── Gap map ───────────────────────────────────────────────────────────────
  'gapMap.required':        'Document checklist',
  'gapMap.optional':        'Also worth gathering',
  'gapMap.noItems':         'No items yet.',

  // ── Item types ─────────────────────────────────────────────────────────────
  'type.document':          'Document',
  'type.event':             'Event',
  'type.asset':             'Asset',
  'type.debt':              'Liability',
  'type.known_fact':        'Known fact',

  // ── Timeline ──────────────────────────────────────────────────────────────
  'timeline.title':         'Timeline',
  'timeline.noDate':        'No date',
  'timeline.caseOpened':    'Case opened',

  // ── Estimate card + popup (Block 7) ──────────────────────────────────────
  'estimate.cardTitle':     'Estimated inheritance value',
  'estimate.headline':      '{low}–{high} (estimated net)',
  'estimate.seeBreakdown':  'See breakdown →',

  // Confidence softening lines — degrades honestly as declared ratio rises
  'estimate.confidence.confirmed':        'These figures rest on confirmed documents.',
  'estimate.confidence.mostly_confirmed': 'This rests mainly on confirmed documents, with some figures you’ve shared.',  // [STANCE]
  'estimate.confidence.mixed':            'This rests on a mix of documents and figures you’ve told us.',               // [STANCE]
  'estimate.confidence.mostly_declared':  'This rests largely on figures you’ve told us. It will sharpen as documents come in.',  // [STANCE]

  // Popup sections — "Estimated" in every header
  'estimate.assets':        'Estimated assets',
  'estimate.debts':         'Estimated reductions',
  'estimate.net':           'Estimated net',
  'estimate.noItems':       'None on file.',

  // Provenance labels
  'estimate.provenance.document': 'Document on file',
  'estimate.provenance.declared': 'You told us',

  // Footer — not a valuation, not legal or tax advice
  'estimate.footer':        'This is an estimate, not a valuation. Not legal or tax advice. Based on figures in your file as of today.',

  // Legacy keys kept for existing components
  'estimate.title':         'Estimated estate value',
  'estimate.disclaimer':    'Estimated from declared and confirmed asset values. Not a legal valuation.',

  // ── Assistant ─────────────────────────────────────────────────────────────
  'assistant.title':        'Ask a question',
  'assistant.subtitle':     'I can explain documents and process steps in plain language.',
  'assistant.placeholder':  'Ask about a document, a term, or the process…',
  'assistant.send':         'Send',
  'assistant.remaining':    '{n} of {cap} remaining',
  'assistant.capReached':   'You’ve used all {cap} included questions. Contact your Acervo Vista advisor to continue.',

  // ── Document upload ───────────────────────────────────────────────────────
  'upload.prompt':          'Upload a document',
  'upload.dragDrop':        'Drag and drop, or click to choose a file',
  'upload.processing':      'Processing…',
  'upload.success':         'Document added',

  // ── Take a breath ─────────────────────────────────────────────────────────
  // [STANCE] These are the gentlest strings in the product. Do not make them
  // more efficient or shorter. The pause is intentional.
  'breath.banner':          'Take your time. Your case is saved.',  // [STANCE]
  'breath.after':           'Take a breath. Your case will be here.',  // [STANCE]
  'breath.continue':        'Continue',

  // ── Case summary card ─────────────────────────────────────────────────────
  'summary.decedent':       'Decedent',
  'summary.heirs':          'Heirs',
  'summary.assets':         'Assets',
  'summary.complexity':     'A few things worth knowing',
  'summary.startUploading': 'Start uploading documents',
  'summary.dateOfDeath':    'Date of death:',
  'summary.state':          'State:',
  'summary.spouse':         'Surviving spouse:',
  'summary.agreement':      'Heirs in agreement:',
  'summary.preTransfers':   'Pre-death transfers:',
  'summary.activeCaseLabel': 'Active case',

  // ── Intake ─────────────────────────────────────────────────────────────────
  'intake.next':            'Continue',
  'intake.back':            'Back',

  // ── Lawyer questions ──────────────────────────────────────────────────────
  'lawyer.title':           'Questions to ask your lawyer',
  'lawyer.disclaimer':      'These questions are generated from your case file to help you prepare for a legal consultation. They are under attorney review and may be updated. They are not legal advice.',

  // ── Handoff ───────────────────────────────────────────────────────────────
  'handoff.title':          'Generate handoff document',
  'handoff.subtitle':       'A PDF summary of your case file for your attorney.',
  'handoff.button':         'Generate PDF',
  'handoff.generating':     'Generating…',

  // ── What you know (Block 8) ───────────────────────────────────────────────
  'wyk.title':       'What you know',
  'wyk.subtitle':    'Tell us what you remember. We’ll hold it until documents arrive.',  // [STANCE]
  'wyk.placeholder': 'A property your father owned, a bank account, something that happened before he passed — tell us what you know.',
  'wyk.submit':      'Add to your file',
  'wyk.processing':  'Reading…',
  'wyk.held':        'Held — waiting for a document',   // [STANCE] never "Unverified"
  'wyk.graduated':   'You knew this — confirmed.',      // [STANCE]

  // Document hook lines — "Estimated" appears; Upload → is the action
  'wyk.hook.deed':      'A deed or transfer record would confirm this — Upload →',
  'wyk.hook.account':   'A bank statement or account record would confirm this — Upload →',
  'wyk.hook.insurance': 'A policy or beneficiary statement would confirm this — Upload →',
  'wyk.hook.will':      'A copy of the will or trust would confirm this — Upload →',
  'wyk.hook.general':   'A receipt, contract, or record would confirm this — Upload →',
  'wyk.hook.vague':     'A note, transfer, or message could support this later — Upload →',  // [STANCE]

  'wyk.empty':       'Nothing added yet. Tell us what you remember and we’ll hold it here.',

    // ── Things you can do now (Block 9) ─────────────────────
  // [STANCE] Framing: "how people usually do this" not "you should do this".
  // Lawyer-touch actions give safe first steps then stop at the referral wall.
  'actions.title':       'Things you can do now',
  'actions.subtitle':    'How people usually handle this — based on what’s in your file.',
  'actions.self':        'You can do this yourself',
  'actions.lawyerTouch': 'You can start — this reaches a lawyer',
  'actions.haveReady':   'What to have ready',
  'actions.timeEst':     'Roughly',
  'actions.phoneScript': 'How to open the call',
  'actions.expand':      'See how →',
  'actions.collapse':    'Close',
  'actions.lawyerStop':  'This is where a lawyer steps in. Your file is built to hand over.',

  'action.deathCert.title':  'Request certified copies of the death certificate',
  'action.deathCert.what':   'The death certificate unlocks almost everything else — bank accounts, property transfers, benefit claims. In Florida, the county vital records office issues certified copies.',
  'action.deathCert.ready':  'Full legal name of the deceased|Date and place of death|Your ID and your relationship to the deceased|The fee (usually $10–15 per copy — request several)',
  'action.deathCert.time':   '1–3 weeks by mail; often same-day in person',
  'action.deathCert.script': 'I am calling to request certified copies of a death certificate. The deceased is [name], who passed on [date]. I am the [relationship]. How many copies do you recommend for an estate with a bank account and real property?',

  'action.notifyBank.title':  'Let the financial institution know',
  'action.notifyBank.what':   'This is a notification call, not a claim. You are telling them the account holder has passed and asking what their estate department needs. The money does not move yet — that takes legal paperwork you are still gathering.',
  'action.notifyBank.ready':  'A copy of the death certificate|Account numbers, if you have them|Your own ID',
  'action.notifyBank.time':   '30–60 minutes on the phone; paperwork usually follows',
  'action.notifyBank.script': 'I am calling to report the death of an account holder and ask what your estate department needs. The account holder is [name], who passed on [date]. I am the [relationship]. Can you connect me with whoever handles this?',

  'action.deedHistory.title': 'Pull the public county deed history',
  'action.deedHistory.what':  'Miami-Dade keeps a public record of every property transfer. You can search by address yourself — no attorney needed for this step. What you find may clarify the deed in your file, or surface questions worth bringing to your attorney.',
  'action.deedHistory.ready': 'The property address',
  'action.deedHistory.time':  '15 minutes online',

  'action.declaratoria.title':  'Start the Argentine heir declaration process',
  'action.declaratoria.what':   'Argentina requires a formal court declaration — the declaratoria de herederos — before an estate there can be distributed. The first step is contacting the Argentine consulate to understand what they will need from you.',
  'action.declaratoria.ready':  'The death certificate (certified, with apostille when ready)|Birth or marriage records showing your relationship to the deceased',
  'action.declaratoria.time':   'The full process takes months; the consulate call takes about 30 minutes',
  'action.declaratoria.script': 'I am calling about the estate of an Argentine citizen who recently passed. I am trying to understand what documentation the consulate needs to support the declaratoria de herederos process in Argentina.',

// ── General ───────────────────────────────────────────────────────────────
  // ── Ask launcher (Block 10) ─────────────────
  'ask.label':     'Ask about this estate',
  'ask.close':     'Close',
  'ask.promise':   'I can explain documents and process steps in plain language. I don’t advise — anything that needs a decision goes to your attorney.',
  'ask.placeholder': 'Ask about a document, a term, or the process…',
  'ask.send':      'Send',
  'ask.remaining': '{n} of {cap} remaining',
  'ask.capReached': 'You’ve used all {cap} included questions. Contact your Acervo Vista advisor to continue.',

  // ── Take a Breath inline band (Block 10) ───────────────
  'breath.inline':  'This one can be hard. Take a minute if you need it.',
  'breath.commit':  'a short pause · about a minute',
  'breath.dismiss': 'Not now',

  'error.loadCase':         'Could not load your case file.',
  'loading':                'Loading…',
  'yes':                    'Yes',
  'no':                     'No',
  'notSure':                'Not sure',
  'complicated':            'It’s complicated',
}

export default en
