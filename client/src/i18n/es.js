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

  // ── Dwell page (Block 6) ──────────────────────────────────────────────────
  'dwell.back':           'Volver al expediente',
  'dwell.onFileStates':   'El documento en el expediente indica',
  'dwell.youDescribed':   'Tú describiste',

  // [VERBATIM] [HUMAN_REVIEW] Legal-neutral and emotionally careful phrasing.
  'dwell.limitOfKnowledge':
    'No estamos diciendo quién tiene razón, ni que haya ocurrido algo irregular — solo que no coinciden, y eso vale la pena entender.',

  'dwell.whatYouCanDo':   'Qué puedes hacer',
  'dwell.selfServe1.title': 'Consultar el historial público de escrituras del condado',
  'dwell.selfServe1.desc':  'Miami-Dade lleva un registro público de transferencias de propiedad. Busca en los Registros Oficiales por dirección para ver el historial completo de esta propiedad.',
  'dwell.selfServe1.link':  'Abrir Registros Oficiales de Miami-Dade →',
  'dwell.selfServe2.title': 'Agregar lo que recuerdas',
  'dwell.selfServe2.desc':  'Todo lo que sepas sobre la propiedad o esta transferencia queda en tu expediente.',
  'dwell.selfServe2.cta':   'Agregar una nota',

  // [VERBATIM] [HUMAN_REVIEW]
  'dwell.lawyerBand':
    'Una propiedad que sale del nombre de alguien mientras aún vive puede ser perfectamente normal — o no. Solo un abogado puede decirte cuál es el caso. Tu expediente está preparado para entregar.',

  'dwell.touches':          'Cómo se relaciona con el resto',
  'dwell.touchTimeline':    'Línea de tiempo · agosto 2023',
  'dwell.touchEstimate':    'Estimación del patrimonio',
  'dwell.breathFlag':       'Este tema puede remover cosas. Tómate el tiempo que necesites.',  // [HUMAN_REVIEW]

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

  // ── Estimate card + popup (Block 7) ──────────────────────────────────────
  'estimate.cardTitle':     'Valor estimado de la herencia',
  'estimate.headline':      '{low}–{high} (neto estimado)',
  'estimate.seeBreakdown':  'Ver desglose →',

  'estimate.confidence.confirmed':        'Estas cifras se basan en documentos confirmados.',
  'estimate.confidence.mostly_confirmed': 'Se basa principalmente en documentos confirmados, con algunas cifras que nos compartiste.',  // [HUMAN_REVIEW]
  'estimate.confidence.mixed':            'Se basa en una combinación de documentos y cifras que nos indicaste.',                        // [HUMAN_REVIEW]
  'estimate.confidence.mostly_declared':  'Se basa en gran medida en cifras que nos indicaste. Se irá afinando a medida que lleguen los documentos.',  // [HUMAN_REVIEW]

  'estimate.assets':        'Bienes estimados',
  'estimate.debts':         'Reducciones estimadas',
  'estimate.net':           'Neto estimado',
  'estimate.noItems':       'Ninguno en el expediente.',

  'estimate.provenance.document': 'Documento en el expediente',
  'estimate.provenance.declared': 'Nos lo indicaste',

  'estimate.footer':        'Esto es una estimación, no una valuación. No es asesoramiento legal ni fiscal. Basado en las cifras de tu expediente a la fecha de hoy.',

  // Legacy keys
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
  'lawyer.disclaimer':      'Estas preguntas se generan a partir de su expediente para ayudarle a prepararse para una consulta legal. Están bajo revisión de un abogado y pueden actualizarse. No constituyen asesoramiento jurídico.',

  // ── Handoff ───────────────────────────────────────────────────────────────
  'handoff.title':          'Generar documento de traspaso',
  'handoff.subtitle':       'Un resumen en PDF de tu expediente para tu abogado.',
  'handoff.button':         'Generar PDF',
  'handoff.generating':     'Generando…',

  // ── What you know (Block 8) ──────────────────────────────────────────────
  'wyk.title':       'Lo que sabes',
  'wyk.subtitle':    'Cuéntanos lo que recuerdas. Lo guardamos hasta que lleguen los documentos.',  // [STANCE] [HUMAN_REVIEW]
  'wyk.placeholder': 'Una propiedad, una cuenta bancaria, algo que ocurrió antes de su fallecimiento — cuéntanos lo que sabes.',
  'wyk.submit':      'Agregar a tu expediente',
  'wyk.processing':  'Leyendo…',
  'wyk.held':        'En espera — aguardando un documento',   // [STANCE] [HUMAN_REVIEW]
  'wyk.graduated':   'Ya lo sabías — confirmado.',            // [STANCE] [HUMAN_REVIEW]

  'wyk.hook.deed':      'Una escritura o constancia de transferencia lo confirmaría — Subir →',
  'wyk.hook.account':   'Un estado de cuenta o registro bancario lo confirmaría — Subir →',
  'wyk.hook.insurance': 'Una póliza o carta de beneficiarios lo confirmaría — Subir →',
  'wyk.hook.will':      'Una copia del testamento o fideicomiso lo confirmaría — Subir →',
  'wyk.hook.general':   'Un recibo, contrato o registro lo confirmaría — Subir →',
  'wyk.hook.vague':     'Una nota, transferencia o mensaje podría respaldar esto más adelante — Subir →',  // [STANCE] [HUMAN_REVIEW]

  'wyk.empty':       'Aún no se agregó nada. Cuéntanos lo que recuerdas y lo guardaremos aquí.',

    // ── Things you can do now (Block 9) ─────────────────────
  // [STANCE] [HUMAN_REVIEW] Spanish phrasing: "cómo suele hacerse" not "deberías hacer".
  'actions.title':       'Lo que puedes hacer ahora',
  'actions.subtitle':    'Cómo suele manejarse esto — según lo que hay en tu expediente.',
  'actions.self':        'Puedes hacerlo tú mismo',
  'actions.lawyerTouch': 'Puedes empezar — esto llega a un abogado',
  'actions.haveReady':   'Qué tener a mano',
  'actions.timeEst':     'Aproximadamente',
  'actions.phoneScript': 'Cómo abrir la llamada',
  'actions.expand':      'Cómo →',
  'actions.collapse':    'Cerrar',
  'actions.lawyerStop':  'Aquí es donde interviene un abogado. Tu expediente está preparado para entregar.',

  'action.deathCert.title':  'Solicitar copias certificadas del acta de defunción',
  'action.deathCert.what':   'El acta de defunción es el documento que desbloquea casi todo lo demás — cuentas bancarias, transferencias de bienes, reclamos de beneficios. En Florida, la oficina de registros vitales del condado emite copias certificadas.',
  'action.deathCert.ready':  'Nombre legal completo del fallecido|Fecha y lugar de fallecimiento|Tu identificación y tu relación con el fallecido|El costo (generalmente $10–15 por copia — solicita varias)',
  'action.deathCert.time':   '1–3 semanas por correo; a veces el mismo día en persona',
  'action.deathCert.script': 'Llamo para solicitar copias certificadas de un acta de defunción. El fallecido es [nombre], quien falleó el [fecha]. Soy el/la [relación]. ¿Cuántas copias recomienda para una sucesión con cuenta bancaria e inmueble?',

  'action.notifyBank.title':  'Notificar a la institución financiera',
  'action.notifyBank.what':   'Esta es una llamada de notificación, no un reclamo. Estás informándoles que el titular de la cuenta falleció y preguntando qué necesita su departamento de sucesiones. El dinero no se mueve aún — eso requiere documentación legal que todavía estás reuniendo.',
  'action.notifyBank.ready':  'Una copia del acta de defunción|Números de cuenta, si los tienes|Tu propia identificación',
  'action.notifyBank.time':   '30–60 minutos por teléfono; generalmente sigue documentación',
  'action.notifyBank.script': 'Llamo para reportar el fallecimiento de un titular de cuenta y preguntar qué necesita su departamento de sucesiones. El titular es [nombre], quien falleó el [fecha]. Soy el/la [relación]. ¿Me puede comunicar con quien maneja estos casos?',

  'action.deedHistory.title': 'Consultar el historial público de escrituras del condado',
  'action.deedHistory.what':  'Miami-Dade lleva un registro público de cada transferencia de propiedad. Puedes buscar por dirección tú mismo — no se necesita abogado para este paso. Lo que encuentres puede aclarar la escritura en tu expediente, o plantear preguntas para tu abogado.',
  'action.deedHistory.ready': 'La dirección del inmueble',
  'action.deedHistory.time':  '15 minutos en línea',

  'action.declaratoria.title':  'Iniciar el proceso de declaratoria de herederos argentina',
  'action.declaratoria.what':   'Argentina requiere una declaración judicial formal — la declaratoria de herederos — antes de que una sucesión pueda distribuirse allí. El primer paso es contactar al consulado argentino para entender qué documentación necesitarán de ti.',
  'action.declaratoria.ready':  'El acta de defunción (certificada, con apostilla cuando esté lista)|Documentos de nacimiento o matrimonio que acrediten tu relación con el fallecido',
  'action.declaratoria.time':   'El proceso completo lleva meses; la llamada al consulado toma unos 30 minutos',
  'action.declaratoria.script': 'Llamo por la sucesión de un ciudadano argentino recientemente fallecido. Estoy tratando de entender qué documentación necesita el consulado para apoyar el proceso de declaratoria de herederos en Argentina.',

// ── General ───────────────────────────────────────────────────────────────
  // ── Ask launcher (Block 10) ─────────────────
  'ask.label':     'Preguntar sobre esta herencia',
  'ask.close':     'Cerrar',
  'ask.promise':   'Puedo explicar documentos y pasos del proceso en términos simples. No asesoro — cualquier decisión corresponde a tu abogado.',
  'ask.placeholder': 'Pregunta sobre un documento, un término o el proceso…',
  'ask.send':      'Enviar',
  'ask.remaining': '{n} de {cap} restantes',
  'ask.capReached': 'Usaste todas las {cap} preguntas incluidas. Contacta a tu asesor de Acervo Vista para continuar.',

  // ── Take a Breath inline band (Block 10) ───────────────
  'breath.inline':  'Esto puede ser difícil. Tómate un minuto si lo necesitas.',
  'breath.commit':  'una pausa breve · alrededor de un minuto',
  'breath.dismiss': 'Ahora no',

  'error.loadCase':         'No se pudo cargar tu expediente.',
  'loading':                'Cargando…',
  'yes':                    'Sí',
  'no':                     'No',
  'notSure':                'No estoy seguro',
  'complicated':            'Es complicado',
}

export default es
