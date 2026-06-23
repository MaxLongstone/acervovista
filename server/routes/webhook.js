import express from 'express'
import Stripe from 'stripe'
import { pool } from '../db/pool.js'

export const webhookRouter = express.Router()

// Stripe initialized lazily so missing key doesn't crash startup
let _stripe
function getStripe() {
  if (!_stripe && process.env.STRIPE_SECRET_KEY) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  return _stripe
}

// Raw body needed for Stripe signature verification
webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  const stripe = getStripe()
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { user_id, plan, entry_source, handoff_package } = session.metadata

    const tier = plan === 'consumer' ? 'consumer' : 'professional'
    const isSubscription = plan === 'professional_monthly'
    const includesHandoff = handoff_package === 'true'

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update user tier
      const updateFields = ['tier = $2']
      const updateValues = [user_id, tier]

      if (isSubscription && session.subscription) {
        updateFields.push(`stripe_subscription_id = $${updateValues.length + 1}`)
        updateValues.push(session.subscription)
      }

      await client.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $1`,
        updateValues
      )

      // Create case record
      const caseResult = await client.query(
        `INSERT INTO cases (user_id, decedent_name, handoff_package_included, stripe_checkout_session_id, plan)
         VALUES ($1, '', $2, $3, $4)
         RETURNING id`,
        [user_id, includesHandoff, session.id, plan]
      )
      const caseId = caseResult.rows[0].id

      await client.query('COMMIT')

      // Send confirmation email — best-effort, non-blocking
      if (!process.env.RESEND_API_KEY) {
        console.warn('Confirmation email skipped: RESEND_API_KEY not set')
      } else {
        try {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)

          const userResult = await pool.query(
            'SELECT email, first_name FROM users WHERE id = $1',
            [user_id]
          )
          if (userResult.rows.length > 0) {
            const { email, first_name } = userResult.rows[0]
            const { error: sendError } = await resend.emails.send({
              from:    'AcervoVista <onboarding@resend.dev>',
              to:      email,
              subject: 'Your case file is open — AcervoVista',
              html:    `<p>Hi ${first_name},</p><p>Your case file is ready. <a href="${process.env.CLIENT_URL}/dashboard">Open your case →</a></p>`,
            })
            if (sendError) {
              console.error('Confirmation email failed (non-fatal):', sendError.message)
            } else {
              console.log(`Confirmation email sent: to=${email} case=${caseId}`)
            }
          }
        } catch (emailErr) {
          console.error('Confirmation email failed (non-fatal):', emailErr.message)
        }
      }

      console.log(`Checkout complete: user=${user_id} plan=${plan} case=${caseId}`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('Webhook handler error:', err)
      return res.status(500).json({ error: 'Internal error processing webhook' })
    } finally {
      client.release()
    }
  }

  res.json({ received: true })
})
