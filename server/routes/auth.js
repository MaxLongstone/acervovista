import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import { pool } from '../db/pool.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = express.Router()

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

// Countries that trigger the LATAM data-transfer notice
const NON_LATAM = new Set(['US', 'CA', 'GB', 'AU'])

function signToken(user) {
  return jwt.sign(
    { user_id: user.id, email: user.email, role: user.role, tier: user.tier },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  const { email, password, first_name, role, country } = req.body

  // Validate
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required' })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  if (!['heir', 'lawyer', 'advisor'].includes(role)) {
    return res.status(400).json({ error: 'Role must be heir, lawyer, or advisor' })
  }
  if (!first_name?.trim()) {
    return res.status(400).json({ error: 'First name required' })
  }
  if (!country) {
    return res.status(400).json({ error: 'Country required' })
  }

  const client = await pool.connect()
  try {
    // Check for existing account
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }

    const password_hash = await bcrypt.hash(password, 12)

    // Create Stripe customer
    let stripe_customer_id = null
    try {
      const stripe = getStripe()
      if (!stripe) throw new Error('Stripe not configured')
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        name: first_name.trim(),
        metadata: { role, country },
      })
      stripe_customer_id = customer.id
    } catch (stripeErr) {
      console.error('Stripe customer creation failed:', stripeErr.message)
      // Non-fatal — proceed without stripe_customer_id
    }

    const result = await client.query(
      `INSERT INTO users (email, password_hash, first_name, role, country, stripe_customer_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, role, country, tier`,
      [email.toLowerCase(), password_hash, first_name.trim(), role, country, stripe_customer_id]
    )
    const user = result.rows[0]
    const token = signToken(user)

    const response = { token, user }
    if (!NON_LATAM.has(country)) response.latam_notice = true

    res.status(201).json(response)
  } finally {
    client.release()
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' })
  }

  const result = await pool.query(
    'SELECT id, email, first_name, role, country, tier, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  )

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'no_account' })
  }

  const user = result.rows[0]
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: 'invalid_credentials' })
  }

  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

  const token = signToken(user)
  const redirect = user.tier !== 'none' ? '/dashboard' : '/checkout'

  res.json({
    token,
    user: { id: user.id, email: user.email, first_name: user.first_name, role: user.role, country: user.country, tier: user.tier },
    redirect,
  })
})

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, first_name, role, country, tier, early_access FROM users WHERE id = $1',
    [req.user.user_id]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(result.rows[0])
})
