import express from 'express'
import { pool } from '../db/pool.js'

export const assistantRouter = express.Router()

assistantRouter.post('/:id/assistant', async (req, res) => {
  const { id } = req.params

  const caseResult = await pool.query(
    'SELECT assistant_turns_used, assistant_cap FROM cases WHERE id = $1',
    [id]
  )
  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const { assistant_turns_used: turnsUsed, assistant_cap: cap } = caseResult.rows[0]

  if (turnsUsed >= cap) {
    return res.status(429).json({
      error: 'cap_reached',
      turns_used: turnsUsed,
      cap,
      message: `You have used all ${cap} included assistant turns for this case.`,
    })
  }

  const updateResult = await pool.query(
    `UPDATE cases SET assistant_turns_used = assistant_turns_used + 1
     WHERE id = $1
     RETURNING assistant_turns_used, assistant_cap`,
    [id]
  )
  const { assistant_turns_used: newTurnsUsed, assistant_cap: newCap } = updateResult.rows[0]

  res.json({
    turns_used: newTurnsUsed,
    cap: newCap,
    remaining: newCap - newTurnsUsed,
  })
})
