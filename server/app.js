import express from 'express'
import cors from 'cors'
import { casesRouter }    from './routes/cases.js'
import { assistantRouter } from './routes/assistant.js'
import { documentsRouter } from './routes/documents.js'
import { handoffRouter }   from './routes/handoff.js'
import { authRouter }      from './routes/auth.js'
import { checkoutRouter }  from './routes/checkout.js'
import { webhookRouter }   from './routes/webhook.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))

// Stripe webhook must receive raw body before express.json() parses it
app.use('/api/webhook', webhookRouter)

app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

if (process.env.NODE_ENV !== 'production') {
  const { devRouter } = await import('./routes/dev.js')
  app.use('/api/dev', devRouter)
  console.log('⚠️  Dev routes enabled (/api/dev/*)')
}

app.use('/api/auth',     authRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/cases',    casesRouter)
app.use('/api/cases',    assistantRouter)
app.use('/api/cases',    documentsRouter)
app.use('/api/cases',    handoffRouter)
