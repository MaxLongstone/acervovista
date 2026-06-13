import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { pool } from '../db/pool.js'
import { DOCUMENT_TYPE_LABELS } from '../lib/documentTypes.js'

export const assistantRouter = express.Router()

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are the AcervoVista assistant. You help heirs and families understand their estate case file. You answer questions about documents, the process, and what things mean in plain language.

STRICT RULES:
- Never give legal advice or legal conclusions
- Never characterize any event as suspicious, fraudulent, improper, or a red flag
- Never tell the user what their legal rights are or what they should do legally
- When a question requires legal judgment, say: "That's a question for a lawyer — it goes beyond what I can help with here. Would you like me to explain what to ask them?"
- You may state facts from the documents and timeline
- You may explain what a document type is in plain language
- You may explain what a process step means generally
- Keep answers concise and warm. This person is grieving.`

function buildCaseContext(caseRow, heirs, documents) {
  const docList = documents.length > 0
    ? documents.map((d) => {
        const label = DOCUMENT_TYPE_LABELS[d.document_type] ?? d.document_type
        const date = d.extracted_date ? ` (dated ${d.extracted_date})` : ''
        return `  - ${label}${date}: "${d.filename}"`
      }).join('\n')
    : '  (none uploaded yet)'

  const heirList = heirs.map((h) => `  - ${h.full_name} (${h.relationship}, ${h.residence})`).join('\n')

  return `CASE SUMMARY:
Decedent: ${caseRow.decedent_name}
Date of death: ${caseRow.date_of_death}
State of domicile: ${caseRow.state_of_domicile}
Has will: ${caseRow.has_will ? 'Yes' : 'No'}
Marital status: ${caseRow.marital_status}${caseRow.spouse_name ? `\nSurviving spouse: ${caseRow.spouse_name}` : ''}

HEIRS:
${heirList}

UPLOADED DOCUMENTS:
${docList}`
}

assistantRouter.post('/:id/assistant', async (req, res) => {
  const { id } = req.params
  const { message } = req.body

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' })
  }

  const caseResult = await pool.query(
    'SELECT * FROM cases WHERE id = $1',
    [id]
  )
  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const caseRow = caseResult.rows[0]
  const { assistant_turns_used: turnsUsed, assistant_cap: cap } = caseRow

  if (turnsUsed >= cap) {
    return res.status(429).json({
      error: 'cap_reached',
      turns_used: turnsUsed,
      cap,
      message: `You have used all ${cap} included assistant turns for this case.`,
    })
  }

  const [updateResult, heirsResult, documentsResult] = await Promise.all([
    pool.query(
      `UPDATE cases SET assistant_turns_used = assistant_turns_used + 1
       WHERE id = $1
       RETURNING assistant_turns_used, assistant_cap`,
      [id]
    ),
    pool.query(
      'SELECT full_name, relationship, residence FROM heirs WHERE case_id = $1',
      [id]
    ),
    pool.query(
      `SELECT filename, document_type, extracted_date
       FROM documents WHERE case_id = $1 ORDER BY uploaded_at ASC`,
      [id]
    ),
  ])

  const { assistant_turns_used: newTurnsUsed, assistant_cap: newCap } = updateResult.rows[0]
  const caseContext = buildCaseContext(caseRow, heirsResult.rows, documentsResult.rows)
  const userMessage = `${caseContext}\n\nUSER QUESTION:\n${message.trim()}`

  try {
    const aiResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const reply = aiResponse.content[0].text

    res.json({
      reply,
      turns_used: newTurnsUsed,
      cap: newCap,
      remaining: newCap - newTurnsUsed,
    })
  } catch (err) {
    console.error('Claude API error:', err)
    res.status(502).json({ error: 'Assistant unavailable. Please try again.' })
  }
})
