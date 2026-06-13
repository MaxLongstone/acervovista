import express from 'express'
import { pool } from '../db/pool.js'
import { computeComplexityFlags } from '../lib/complexity.js'
import { computeGapMap } from '../lib/gapMap.js'

export const casesRouter = express.Router()

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
