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
