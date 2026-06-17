/**
 * Spanish strings — app interface language for the heir.
 *
 * STANCE REVIEW REQUIRED before launch.
 * This is not a translation dump — it is a stance review.
 * Every [STANCE] and [HUMAN_REVIEW] line below must be read by the founding
 * network for tone before this goes live in LATAM markets.
 *
 * Editorial principles carried into Spanish:
 *   1. The chronology-not-judgment wall holds. A document "indica" or "consta" —
 *      never "contradice", "desmiente", or "cuestiona". The heir is never implied
 *      to have done something wrong.
 *   2. "Held / Unknown" → "En espera" — NEVER "No verificado" (that reimports
 *      the rejection tone we specifically avoided in English). [HUMAN_REVIEW]
 *   3. "Flagged" → "Con observación" — factual administrative note, not an alarm.
 *      [HUMAN_REVIEW] — the founding network should confirm this is the right
 *      register for the target markets (MX, AR, CO, VE diaspora).
 *   4. "Missing" document → "No recibido" — the document hasn't arrived yet,
 *      not that the heir failed to produce it. [HUMAN_REVIEW]
 *   5. Grief-adjacent strings (Take a Breath) carry the same pause intentionality
 *      in Spanish. Do not shorten or make more efficient.
 *   6. "Herencia" is used for "estate" throughout — it is the natural LATAM term
 *      for what the heir is navigating, more accessible than "patrimonio" or
 *      "sucesión" which signal lawyer-land.
 *
 * SCOPE: App interface only. This file does NOT govern public marketing content,
 * blog posts, or jurisdiction guides on the marketing site. Those are separate
 * Spanish-language pages with their own editorial workflow.
 */

const es = {
  // ── Navigation / top band ──────────────────────────────────────────────────
  'band.switchCase':        'Cambiar caso',
  'band.account':           'Cuenta',
  'band.estateOf':          'Herencia de',
  'band.crossBorder':       'Internacional',

  // ── Case switcher ──────────────────────────────────────────────────────────
  'switcher.title':         'Tus casos',
  'switcher.enter':         'Abrir',
  'switcher.opened':        'Abierto el',
  'switcher.active':        'Activo',
  'switcher.closed':        'Cerrado',
  'switcher.empty':         'No se encontraron casos.',

  // ── Item states ───────────────────────────────────────────────────────────
  // [STANCE] [HUMAN_REVIEW] All four non-confirmed states need founding-network
  // sign-off before launch. See editorial notes at top of file.
  'state.confirmed':        'Confirmado',
  'state.pending':          'Pendiente',
  'state.missing':          'No recibido',      // [STANCE] [HUMAN_REVIEW] document not yet received — NOT "faltante" or "omitido"
  'state.flagged':          'Con observación',   // [STANCE] [HUMAN_REVIEW] administrative note — NOT "sospechoso" or "marcado"
  'state.unknown':          'En espera',         // [STANCE] [HUMAN_REVIEW] NEVER "No verificado"

  // ── Conflict / flagged item copy ──────────────────────────────────────────
  // [STANCE] [HUMAN_REVIEW] Chronology-not-judgment wall must hold in Spanish.
  // "indica" and "consta" are the approved verbs. Do not swap for "contradice",
  // "desmiente", "cuestiona", or any verb that implies wrongdoing.
  'conflict.documentIndicates': 'Un documento indica:',    // [STANCE] "indica" not "contradice"
  'conflict.youStated':         'Lo que declaraste:',
  'conflict.callout':           'Este elemento tiene una observación que debe resolverse antes de que la herencia pueda continuar.',  // [STANCE]
  'conflict.limitOfKnowledge':  'Acervo Vista puede mostrarte ambas versiones. Determinar cuál es correcta legalmente requiere la asistencia de tu abogado.',  // [STANCE] [HUMAN_REVIEW]

  // ── Item peek (Block 5) ───────────────────────────────────────────────────
  'peek.close':           'Cerrar',
  'peek.whereToGet':      'Dónde conseguirlo',         // [HUMAN_REVIEW]
  'peek.lookMore':        'Ver esto más de cerca',      // [HUMAN_REVIEW] [STANCE]
  'peek.fullRecord':      'Ver el registro completo',
  'peek.onFileStates':    'El documento en el expediente indica:',  // [HUMAN_REVIEW] [STANCE]
  'peek.youDescribed':    'Tú describiste:',
  'peek.filed':           'Presentado',

  // ── Dashboard body (Block 4) ──────────────────────────────────────────────
  'body.file':           'Tu expediente',
  'body.happened':       'Lo que ocurrió',
  'body.viewAll':        'Ver todo →',
  'body.fullTimeline':   'Línea de tiempo completa →',
  'body.noDate':         'Sin fecha',

  // ── Standing panel (Block 3) ──────────────────────────────────────────────
  'standing.strong':          'Estás más avanzado que la mayoría.',         // [HUMAN_REVIEW]
  'standing.mid':             'Has hecho un progreso real aquí.',            // [HUMAN_REVIEW]
  'standing.thin':            'Has construido un expediente sólido.',        // [HUMAN_REVIEW]
  'standing.orient':          'Esto es lo que aún necesita atención.',
  'standing.deadline':        '{title} se acerca pronto.',
  'standing.missing':         '{title} aún no ha llegado — es clave para los próximos pasos.',  // [HUMAN_REVIEW]
  'standing.conflict':        'Un documento indica una cuenta diferente para {title}. Tu abogado puede confirmar cuál aplica.',  // [HUMAN_REVIEW] [WALL: "indica" not "contradice"]

  'standing.confirmed':       'Confirmado',
  'standing.pending':         'Pendiente',
  'standing.missing.label':   'No recibido',    // [HUMAN_REVIEW]
  'standing.flagged':         'Con observación', // [HUMAN_REVIEW]
  'standing.unknown':         'En espera',       // [HUMAN_REVIEW]

  // ── Gap map ───────────────────────────────────────────────────────────────
  'gapMap.required':        'Lista de documentos',
  'gapMap.optional':        'También vale la pena obtener',
  'gapMap.noItems':         'Aún no hay elementos.',

  // ── Item types ─────────────────────────────────────────────────────────────
  'type.document':          'Documento',
  'type.event':             'Evento',
  'type.asset':             'Bien',
  'type.debt':              'Pasivo',
  'type.known_fact':        'Dato conocido',

  // ── Timeline ──────────────────────────────────────────────────────────────
  'timeline.title':         'Cronología',
  'timeline.noDate':        'Sin fecha',
  'timeline.caseOpened':    'Caso abierto',

  // ── Estimate ──────────────────────────────────────────────────────────────
  'estimate.title':         'Valor estimado de la herencia',
  'estimate.disclaimer':    'Estimado a partir de los valores declarados y confirmados. No es una valuación legal.',

  // ── Assistant ─────────────────────────────────────────────────────────────
  'assistant.title':        'Hacer una pregunta',
  'assistant.subtitle':     'Puedo explicar documentos y pasos del proceso en términos simples.',
  'assistant.placeholder':  'Pregunta sobre un documento, un término o el proceso…',
  'assistant.send':         'Enviar',
  'assistant.remaining':    '{n} de {cap} restantes',
  'assistant.capReached':   'Usaste todas las {cap} preguntas incluidas. Contacta a tu asesor de Acervo Vista para continuar.',

  // ── Document upload ───────────────────────────────────────────────────────
  'upload.prompt':          'Subir un documento',
  'upload.dragDrop':        'Arrastra y suelta, o haz clic para seleccionar un archivo',
  'upload.processing':      'Procesando…',
  'upload.success':         'Documento agregado',

  // ── Take a breath ─────────────────────────────────────────────────────────
  // [STANCE] [HUMAN_REVIEW] These must carry the same gentle pause as English.
  // Do not shorten. The grief-aware tone must hold in Spanish.
  'breath.banner':          'Tómate el tiempo que necesites. Tu caso está guardado.',  // [STANCE]
  'breath.after':           'Respira. Tu caso va a estar aquí.',                       // [STANCE] [HUMAN_REVIEW]
  'breath.continue':        'Continuar',

  // ── Case summary card ─────────────────────────────────────────────────────
  'summary.decedent':       'Fallecido',
  'summary.heirs':          'Herederos',
  'summary.assets':         'Bienes',
  'summary.complexity':     'Algunas cosas que vale la pena saber',
  'summary.startUploading': 'Comenzar a subir documentos',
  'summary.dateOfDeath':    'Fecha de fallecimiento:',
  'summary.state':          'Estado:',
  'summary.spouse':         'Cónyuge sobreviviente:',
  'summary.agreement':      'Herederos en acuerdo:',
  'summary.preTransfers':   'Transferencias previas al fallecimiento:',
  'summary.activeCaseLabel': 'Caso activo',

  // ── Intake ─────────────────────────────────────────────────────────────────
  'intake.next':            'Continuar',
  'intake.back':            'Volver',

  // ── Lawyer questions ──────────────────────────────────────────────────────
  'lawyer.title':           'Preguntas para hacerle a tu abogado',

  // ── Handoff ───────────────────────────────────────────────────────────────
  'handoff.title':          'Generar documento de traspaso',
  'handoff.subtitle':       'Un resumen en PDF de tu expediente para tu abogado.',
  'handoff.button':         'Generar PDF',
  'handoff.generating':     'Generando…',

  // ── General ───────────────────────────────────────────────────────────────
  'error.loadCase':         'No se pudo cargar tu expediente.',
  'loading':                'Cargando…',
  'yes':                    'Sí',
  'no':                     'No',
  'notSure':                'No estoy seguro',
  'complicated':            'Es complicado',
}

export default es
