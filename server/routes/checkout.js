import express from 'express'
import Stripe from 'stripe'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

export const checkoutRouter = express.Router()

const PRICE_MAP = {
  consumer:              process.env.STRIPE_PRICE_CONSUMER_EARLY,
  professional_case:     process.env.STRIPE_PRICE_PRO_PER_CASE,
  professional_monthly:  process.env.STRIPE_PRICE_PRO_MONTHLY,
}

// POST /api/checkout/create-session
checkoutRouter.post('/create-session', requireAuth, async (req, res) => {
  const { plan, source, include_handoff } = req.body

  if (!PRICE_MAP[plan]) {
    return res.status(400).json({ error: 'Invalid plan' })
  }

  const userResult = await pool.query(
    'SELECT stripe_customer_id FROM users WHERE id = $1',
    [req.user.user_id]
  )
  if (userResult.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' })
  }

  const { stripe_customer_id } = userResult.rows[0]
  const isSubscription = plan === 'professional_monthly'
  const mode = isSubscription ? 'subscription' : 'payment'

  const lineItems = [{ price: PRICE_MAP[plan], quantity: 1 }]

  // Handoff add-on: only valid for payment-mode plans (not subscription)
  const addHandoff = include_handoff && !isSubscription
  if (addHandoff) {
    lineItems.push({ price: process.env.STRIPE_PRICE_LAWYER_HANDOFF, quantity: 1 })
  }

  const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5173'

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const session = await stripe.checkout.sessions.create({
    customer: stripe_customer_id,
    payment_method_types: ['card'],
    line_items: lineItems,
    mode,
    success_url: `${BASE_URL}/dashboard?checkout=success`,
    cancel_url:  `${BASE_URL}/checkout`,
    metadata: {
      user_id:         req.user.user_id,
      plan,
      entry_source:    source || 'direct',
      handoff_package: addHandoff ? 'true' : 'false',
    },
  })

  res.json({ url: session.url })
})

// POST /api/checkout/sandbox-bypass
// Grants consumer tier directly — only works when STRIPE_SECRET_KEY is not set (sandbox only)
checkoutRouter.post('/sandbox-bypass', requireAuth, async (req, res) => {
  if (process.env.STRIPE_SECRET_KEY) {
    return res.status(403).json({ error: 'Not available in production' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `UPDATE users SET tier = 'consumer' WHERE id = $1`,
      [req.user.user_id]
    )
    const caseResult = await client.query(
      `INSERT INTO cases (user_id, decedent_name, handoff_package_included, plan)
       VALUES ($1, '', false, 'consumer') RETURNING id`,
      [req.user.user_id]
    )
    await client.query('COMMIT')
    res.json({ caseId: caseResult.rows[0].id })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Sandbox bypass error:', err)
    res.status(500).json({ error: 'Bypass failed' })
  } finally {
    client.release()
  }
})
