import express from 'express'
import cors from 'cors'
import { casesRouter } from './routes/cases.js'
import { assistantRouter } from './routes/assistant.js'
import { documentsRouter } from './routes/documents.js'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/cases', casesRouter)
app.use('/api/cases', assistantRouter)
app.use('/api/cases', documentsRouter)
