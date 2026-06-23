/**
 * Dev-only routes — NEVER enabled in production (guarded by NODE_ENV check in app.js).
 * Simulates the Stripe webhook so the full post-payment flow can be tested locally
 * without Stripe keys or the Stripe CLI.
 */
import express from 'express'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

export const devRouter = express.Router()

// POST /api/dev/fake-checkout
// Simulates a successful checkout.session.completed webhook.
// Body: { plan: 'consumer' | 'professional_case' | 'professional_monthly', include_handoff?: boolean }
devRouter.post('/fake-checkout', requireAuth, async (req, res) => {
  const { plan = 'consumer', include_handoff = false } = req.body
  const user_id = req.user.user_id

  const tier = plan === 'consumer' ? 'consumer' : 'professional'
  const includesHandoff = !!include_handoff

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query('UPDATE users SET tier = $2 WHERE id = $1', [user_id, tier])

    const caseResult = await client.query(
      `INSERT INTO cases (user_id, decedent_name, handoff_package_included, plan)
       VALUES ($1, 'Test Case', $2, $3)
       RETURNING id`,
      [user_id, includesHandoff, plan]
    )
    const caseId = caseResult.rows[0].id

    await client.query('COMMIT')

    res.json({ ok: true, tier, caseId, message: 'Fake checkout complete — tier updated, case created.' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// POST /api/dev/reset-user
// Resets the signed-in user back to tier='none' and deletes their cases (for re-testing).
devRouter.post('/reset-user', requireAuth, async (req, res) => {
  const user_id = req.user.user_id
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM cases WHERE user_id = $1', [user_id])
    await client.query("UPDATE users SET tier = 'none', stripe_subscription_id = NULL WHERE id = $1", [user_id])
    await client.query('COMMIT')
    res.json({ ok: true, message: 'User reset to tier=none, cases deleted.' })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})
