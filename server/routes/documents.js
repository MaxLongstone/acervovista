import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { pool } from '../db/pool.js'
import { extractText } from '../lib/ocr.js'
import { classifyDocument } from '../lib/classification.js'
import { extractEarliestDate } from '../lib/dateExtraction.js'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../lib/documentTypes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads')

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseDir = path.join(UPLOADS_ROOT, req.params.id)
    fs.mkdirSync(caseDir, { recursive: true })
    cb(null, caseDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'))
    }
    cb(null, true)
  },
})

export const documentsRouter = express.Router()

documentsRouter.post('/:id/documents', (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(400).json({ error: 'Invalid case id' })
  }

  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const { id: caseId } = req.params
    const { path: filePath, mimetype, originalname } = req.file

    const caseResult = await pool.query('SELECT id FROM cases WHERE id = $1', [caseId])
    if (caseResult.rows.length === 0) {
      fs.unlinkSync(filePath)
      return res.status(404).json({ error: 'Case not found' })
    }

    try {
      const ocrText = await extractText(filePath, mimetype)
      const documentType = classifyDocument(ocrText)
      const extractedDate = extractEarliestDate(ocrText)

      const result = await pool.query(
        `INSERT INTO documents (case_id, filename, file_path, file_type, ocr_text, document_type, extracted_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [caseId, originalname, filePath, mimetype, ocrText, documentType, extractedDate]
      )
      const document = result.rows[0]

      await pool.query(
        `INSERT INTO timeline_events (case_id, event_type, label, document_id)
         VALUES ($1, 'document_uploaded', $2, $3)`,
        [caseId, DOCUMENT_TYPE_LABELS[documentType], document.id]
      )

      res.status(201).json(document)
    } catch (ocrErr) {
      console.error(ocrErr)
      res.status(500).json({ error: 'Failed to process document' })
    }
  })
})

documentsRouter.get('/:id/documents', async (req, res) => {
  const { id: caseId } = req.params

  const result = await pool.query(
    `SELECT id, filename, document_type, extracted_date, uploaded_at
     FROM documents WHERE case_id = $1 ORDER BY uploaded_at ASC`,
    [caseId]
  )

  res.json(result.rows)
})

documentsRouter.get('/:id/documents/:docId', async (req, res) => {
  const { id: caseId, docId } = req.params

  const result = await pool.query(
    'SELECT * FROM documents WHERE id = $1 AND case_id = $2',
    [docId, caseId]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' })
  }

  res.json(result.rows[0])
})

documentsRouter.patch('/:id/documents/:docId', async (req, res) => {
  const { id: caseId, docId } = req.params
  const { document_type: documentType } = req.body

  if (!DOCUMENT_TYPES.includes(documentType)) {
    return res.status(400).json({ error: 'Invalid document_type' })
  }

  const result = await pool.query(
    `UPDATE documents SET document_type = $1
     WHERE id = $2 AND case_id = $3
     RETURNING *`,
    [documentType, docId, caseId]
  )
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' })
  }

  res.json(result.rows[0])
})
