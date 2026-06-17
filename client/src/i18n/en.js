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

  // ── Estimate ──────────────────────────────────────────────────────────────
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

  // ── Handoff ───────────────────────────────────────────────────────────────
  'handoff.title':          'Generate handoff document',
  'handoff.subtitle':       'A PDF summary of your case file for your attorney.',
  'handoff.button':         'Generate PDF',
  'handoff.generating':     'Generating…',

  // ── General ───────────────────────────────────────────────────────────────
  'error.loadCase':         'Could not load your case file.',
  'loading':                'Loading…',
  'yes':                    'Yes',
  'no':                     'No',
  'notSure':                'Not sure',
  'complicated':            'It’s complicated',
}

export default en
