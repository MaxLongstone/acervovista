import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'
import { pool } from '../db/pool.js'
import { computeGapMap } from '../lib/gapMap.js'
import { buildHandoffHtml } from '../lib/handoffTemplate.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const HANDOFFS_ROOT = path.join(__dirname, '..', 'handoffs')

export const handoffRouter = express.Router()

handoffRouter.post('/:id/handoff', async (req, res) => {
  const { id } = req.params

  const [caseResult, heirsResult, docsResult, timelineResult] = await Promise.all([
    pool.query('SELECT * FROM cases WHERE id = $1', [id]),
    pool.query('SELECT full_name, relationship, residence FROM heirs WHERE case_id = $1', [id]),
    pool.query(
      `SELECT filename, document_type, extracted_date, uploaded_at
       FROM documents WHERE case_id = $1 ORDER BY uploaded_at ASC`,
      [id]
    ),
    pool.query(
      `SELECT te.event_at, te.label, d.document_type
       FROM timeline_events te
       LEFT JOIN documents d ON d.id = te.document_id
       WHERE te.case_id = $1
       ORDER BY te.event_at ASC`,
      [id]
    ),
  ])

  if (caseResult.rows.length === 0) {
    return res.status(404).json({ error: 'Case not found' })
  }

  const caseRow = caseResult.rows[0]
  const gapMap = computeGapMap({
    hasWill: caseRow.has_will,
    createdAt: caseRow.created_at,
    documentTypes: docsResult.rows.map((d) => d.document_type),
  })

  const html = buildHandoffHtml({
    caseRow,
    heirs: heirsResult.rows,
    documents: docsResult.rows,
    timeline: timelineResult.rows,
    gapMap,
  })

  const outDir = path.join(HANDOFFS_ROOT, id)
  fs.mkdirSync(outDir, { recursive: true })
  const filename = `handoff-${Date.now()}.pdf`
  const outPath = path.join(outDir, filename)

  let browser
  try {
    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.pdf({
      path: outPath,
      format: 'Letter',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
    })
  } finally {
    await browser?.close()
  }

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  fs.createReadStream(outPath).pipe(res)
})
