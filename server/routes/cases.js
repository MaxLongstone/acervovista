import express from 'express'
import { pool } from '../db/pool.js'
import { computeComplexityFlags } from '../lib/complexity.js'
import { computeGapMap } from '../lib/gapMap.js'
import { requireAuth } from '../middleware/auth.js'

export const casesRouter = express.Router()

// List cases for the signed-in user
casesRouter.get('/', requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT c.id, c.decedent_name, c.date_of_death, c.state_of_domicile,
            c.jurisdictions, c.has_will, c.intake_completed_at, c.closed_at,
            (SELECT h.relationship FROM heirs h WHERE h.case_id = c.id ORDER BY h.id LIMIT 1)
              AS viewer_relationship
     FROM cases c
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [req.user.user_id]
  )
  res.json(result.rows)
})

casesRouter.post('/', async (req, res) => {
  const {
    userType,
    decedentName,
    dateOfDeath,
    stateOfDomicile,
    diedInFlorida,
    maritalStatus,
    spouseName,
    hasWill,
    willLocated,
    heirsInAgreement,
    assets,
    preDeathTransfers,
    heirs,
  } = req.body

  if (!decedentName || !dateOfDeath || !Array.isArray(heirs) || heirs.length < 1) {
    return res.status(400).json({
      error: 'decedentName, dateOfDeath, and at least one heir are required',
    })
  }

  const complexityFlags = computeComplexityFlags({
    assets,
    heirsInAgreement,
    preDeathTransfers,
    hasWill,
    heirs,
  })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const caseResult = await client.query(
      `INSERT INTO cases (
        user_type, decedent_name, date_of_death, state_of_domicile,
        died_in_florida, marital_status, spouse_name, has_will,
        will_located, heirs_in_agreement, assets, pre_death_transfers,
        complexity_flags, intake_completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING id`,
      [
        userType,
        decedentName,
        dateOfDeath,
        stateOfDomicile,
        diedInFlorida,
        maritalStatus,
        spouseName,
        hasWill,
        willLocated,
        heirsInAgreement,
        JSON.stringify(assets || []),
        preDeathTransfers,
        JSON.stringify(complexityFlags),
      ]
    )
    const caseId = caseResult.rows[0].id

    for (const heir of heirs) {
      await client.query(
        `INSERT INTO heirs (case_id, full_name, relationship, residence)
         VALUES ($1, $2, $3, $4)`,
        [caseId, heir.fullName, heir.relationship, heir.residence]
      )
    }

    await client.query(
      `INSERT INTO timeline_events (case_id, event_type, label)
       VALUES ($1, 'case_opened', 'Case file opened')`,
      [caseId]
    )

    await client.query('COMMIT')
    res.status(201).json({ id: caseId, complexityFlags })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: 'Failed to create case' })
  } finally {
    client.release()
  }
})

casesRouter.get('/:id', async (req, res) => {
  const { id } = req.params

  const caseResult = await pool.query('SELECT * FROM cases WHERE id = $1', [id])
  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const heirsResult = await pool.query(
    'SELECT id, full_name, relationship, residence FROM heirs WHERE case_id = $1',
    [id]
  )

  res.json({
    ...caseResult.rows[0],
    heirs: heirsResult.rows,
  })
})

// All case_items for a case — dashboard body reads this once and splits for each column.
casesRouter.get('/:id/items', async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `SELECT id, item_type, state, provenance, title, summary,
            item_date, value_cents, value_currency, conflict,
            linked_item_ids, document_id, jurisdiction
     FROM case_items
     WHERE case_id = $1
     ORDER BY item_date ASC NULLS LAST, created_at ASC`,
    [id]
  )
  res.json(result.rows)
})

// Standing summary — state counts + single highest-priority flag for the hero panel.
casesRouter.get('/:id/standing', async (req, res) => {
  const { id } = req.params

  const countsResult = await pool.query(
    `SELECT state, COUNT(*)::int AS n FROM case_items WHERE case_id = $1 GROUP BY state`,
    [id]
  )
  const counts = { confirmed: 0, pending: 0, missing: 0, flagged: 0, unknown: 0 }
  for (const row of countsResult.rows) {
    if (counts[row.state] !== undefined) counts[row.state] = row.n
  }

  let priority = null

  // (a) live deadline — upcoming event items within 90 days
  const deadlineResult = await pool.query(
    `SELECT title, item_date FROM case_items
     WHERE case_id = $1 AND item_type = 'event' AND state != 'missing'
       AND item_date IS NOT NULL AND item_date <= NOW() + INTERVAL '90 days'
       AND item_date >= NOW()
     ORDER BY item_date ASC LIMIT 1`,
    [id]
  )
  if (deadlineResult.rows.length > 0) {
    const row = deadlineResult.rows[0]
    priority = { type: 'deadline', title: row.title, date: row.item_date }
  }

  // (b) critical missing document
  if (!priority) {
    const missingResult = await pool.query(
      `SELECT title FROM case_items
       WHERE case_id = $1 AND item_type = 'document' AND state = 'missing'
       ORDER BY created_at ASC LIMIT 1`,
      [id]
    )
    if (missingResult.rows.length > 0) {
      priority = { type: 'missing', title: missingResult.rows[0].title }
    }
  }

  // (c) flagged conflict — calmest last
  if (!priority) {
    const flaggedResult = await pool.query(
      `SELECT title, conflict FROM case_items
       WHERE case_id = $1 AND state = 'flagged'
       ORDER BY created_at ASC LIMIT 1`,
      [id]
    )
    if (flaggedResult.rows.length > 0) {
      const row = flaggedResult.rows[0]
      priority = { type: 'conflict', title: row.title, conflict: row.conflict }
    }
  }

  res.json({ counts, priority })
})

// GET /api/cases/:id/estimate
casesRouter.get('/:id/estimate', async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `SELECT item_type, state, provenance, title, value_cents, value_currency
     FROM case_items
     WHERE case_id = $1 AND item_type IN ('asset', 'debt') AND value_cents IS NOT NULL
     ORDER BY value_cents DESC`,
    [id]
  )

  const assets = result.rows.filter(r => r.item_type === 'asset')
    .map(r => ({ ...r, value_cents: parseInt(r.value_cents, 10) }))
  const debts  = result.rows.filter(r => r.item_type === 'debt')
    .map(r => ({ ...r, value_cents: parseInt(r.value_cents, 10) }))

  // Low = only document-confirmed assets; High = all assets including declared
  const lowAssets  = assets
    .filter(a => a.provenance === 'document' && a.state === 'confirmed')
    .reduce((s, a) => s + a.value_cents, 0)
  const highAssets = assets.reduce((s, a) => s + a.value_cents, 0)
  const totalDebts = debts.reduce((s, d) => s + d.value_cents, 0)

  const lowNet  = Math.max(0, lowAssets  - totalDebts)
  const highNet = Math.max(0, highAssets - totalDebts)

  // Confidence tier — drives the softening copy
  const declaredCents = assets
    .filter(a => a.provenance === 'declared')
    .reduce((s, a) => s + a.value_cents, 0)
  const declaredRatio = highAssets > 0 ? declaredCents / highAssets : 0

  let confidence
  if (declaredRatio === 0)       confidence = 'confirmed'
  else if (declaredRatio < 0.35) confidence = 'mostly_confirmed'
  else if (declaredRatio < 0.75) confidence = 'mixed'
  else                           confidence = 'mostly_declared'

  res.json({
    low_cents:  lowNet,
    high_cents: highNet,
    currency:   'USD',
    confidence,
    assets: assets.map(a => ({
      title:       a.title,
      value_cents: a.value_cents,
      currency:    a.value_currency,
      provenance:  a.provenance,
      state:       a.state,
    })),
    debts: debts.map(d => ({
      title:       d.title,
      value_cents: d.value_cents,
      currency:    d.value_currency,
      provenance:  d.provenance,
      state:       d.state,
    })),
  })
})

// POST /api/cases/:id/declare — free-text entry → declared case_item
casesRouter.post('/:id/declare', async (req, res) => {
  const { id }   = req.params
  const { text } = req.body
  if (!text?.trim()) return res.status(400).json({ error: 'text required' })

  const { claudeExtractDeclaration } = await import('../lib/claudeDeclare.js')
  const extracted = await claudeExtractDeclaration(text.trim())

  const result = await pool.query(
    `INSERT INTO case_items
       (case_id, item_type, state, provenance, title, summary,
        item_date, value_cents, value_currency, conflict)
     VALUES ($1, $2, 'unknown', 'declared', $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      extracted.item_type,
      extracted.title,
      extracted.summary,
      extracted.item_date,
      extracted.value_cents,
      extracted.value_currency,
      JSON.stringify({ hook_type: extracted.hook_type }),
    ]
  )

  res.status(201).json(result.rows[0])
})

casesRouter.get('/:id/gap-map', async (req, res) => {
  const { id } = req.params

  const caseResult = await pool.query(
    'SELECT has_will, created_at FROM cases WHERE id = $1',
    [id]
  )
  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const documentsResult = await pool.query(
    'SELECT document_type FROM documents WHERE case_id = $1',
    [id]
  )

  const gapMap = computeGapMap({
    hasWill: caseResult.rows[0].has_will,
    createdAt: caseResult.rows[0].created_at,
    documentTypes: documentsResult.rows.map((row) => row.document_type),
  })

  res.json(gapMap)
})
