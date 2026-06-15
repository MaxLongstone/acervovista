import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { pool } from '../db/pool.js'
import { extractText } from '../lib/ocr.js'
import { classifyDocument } from '../lib/classification.js'
import { claudeClassifyDocument } from '../lib/claudeClassification.js'
import { extractEarliestDate } from '../lib/dateExtraction.js'
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../lib/documentTypes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_ROOT = path.join(__dirname, '..', 'uploads')

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
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
      const extractedDate = extractEarliestDate(ocrText)

      // Layer 1: fast keyword classification
      const keywordType = classifyDocument(ocrText)

      let documentType = keywordType
      let classificationLayer = 'keyword'
      let classificationConfidence = keywordType !== 'unknown' ? 'high' : 'low'
      let documentLanguage = 'en'
      let documentJurisdiction = null
      let plainLanguageSummary = null
      let caseRelevance = null
      let documentMetadata = {}

      // Layer 2: Claude enrichment — runs for every document.
      // Provides metadata, plain-language summary, language, jurisdiction.
      // If Layer 1 returned a generic type (or unknown), Claude can also
      // upgrade the type — but only when it returns 'high' confidence.
      try {
        const caseRow = await pool.query(
          'SELECT decedent_name, has_will, state_of_domicile FROM cases WHERE id = $1',
          [caseId]
        )
        const ctx = caseRow.rows[0] ?? {}

        console.log(`[Layer 2] Triggered for: ${originalname} (Layer 1: ${keywordType})`)

        const claudeResult = await claudeClassifyDocument(ocrText, {
          decedentName: ctx.decedent_name,
          hasWill: ctx.has_will,
          stateOfDomicile: ctx.state_of_domicile,
          layer1Type: keywordType,
        })

        console.log(`[Layer 2] Result: ${claudeResult.document_type} (${claudeResult.confidence})`)

        // Override Layer 1 type when Claude is high-confidence or Layer 1 was unknown
        if (keywordType === 'unknown' || claudeResult.confidence === 'high') {
          documentType = claudeResult.document_type
          classificationLayer = 'claude'
          classificationConfidence = claudeResult.confidence
        }

        // Always use Claude's enrichment data
        documentLanguage = claudeResult.language ?? 'en'
        documentJurisdiction = claudeResult.jurisdiction
        plainLanguageSummary = claudeResult.plain_language_summary
        caseRelevance = claudeResult.case_relevance
        documentMetadata = claudeResult.metadata ?? {}
      } catch (claudeErr) {
        console.error('[Layer 2] Failed, keeping Layer 1 result:', claudeErr.message)
      }

      const result = await pool.query(
        `INSERT INTO documents (
          case_id, filename, file_path, file_type, ocr_text, document_type, extracted_date,
          classification_layer, classification_confidence, document_language,
          document_jurisdiction, plain_language_summary, case_relevance, document_metadata
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
        RETURNING id, case_id, uploaded_at, filename, file_type, document_type,
                  extracted_date, classification_layer, classification_confidence,
                  document_language, document_jurisdiction, plain_language_summary,
                  case_relevance, document_metadata`,
        [
          caseId, originalname, filePath, mimetype, ocrText, documentType, extractedDate,
          classificationLayer, classificationConfidence, documentLanguage,
          documentJurisdiction, plainLanguageSummary, caseRelevance,
          JSON.stringify(documentMetadata),
        ]
      )
      const document = result.rows[0]

      await pool.query(
        `INSERT INTO timeline_events (case_id, event_type, label, document_id)
         VALUES ($1, 'document_uploaded', $2, $3)`,
        [caseId, DOCUMENT_TYPE_LABELS[documentType] ?? documentType, document.id]
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
    `SELECT id, filename, document_type, extracted_date, uploaded_at,
            classification_layer, classification_confidence, document_language,
            document_jurisdiction, plain_language_summary, case_relevance, document_metadata
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

// Re-run classification on an existing document (Layer 1 + Layer 2)
documentsRouter.post('/:id/documents/:docId/reclassify', async (req, res) => {
  const { id: caseId, docId } = req.params

  const docResult = await pool.query(
    'SELECT * FROM documents WHERE id = $1 AND case_id = $2',
    [docId, caseId]
  )
  if (docResult.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' })
  }

  const doc = docResult.rows[0]
  const ocrText = doc.ocr_text

  const keywordType = classifyDocument(ocrText)
  let documentType = keywordType
  let classificationLayer = 'keyword'
  let classificationConfidence = keywordType !== 'unknown' ? 'high' : 'low'
  let documentLanguage = 'en'
  let documentJurisdiction = null
  let plainLanguageSummary = null
  let caseRelevance = null
  let documentMetadata = {}

  try {
    const caseRow = await pool.query(
      'SELECT decedent_name, has_will, state_of_domicile FROM cases WHERE id = $1',
      [caseId]
    )
    const ctx = caseRow.rows[0] ?? {}

    console.log(`[Reclassify] ${doc.filename} — Layer 1: ${keywordType}`)

    const claudeResult = await claudeClassifyDocument(ocrText, {
      decedentName: ctx.decedent_name,
      hasWill: ctx.has_will,
      stateOfDomicile: ctx.state_of_domicile,
      layer1Type: keywordType,
    })

    console.log(`[Reclassify] Layer 2: ${claudeResult.document_type} (${claudeResult.confidence})`)

    if (keywordType === 'unknown' || claudeResult.confidence === 'high') {
      documentType = claudeResult.document_type
      classificationLayer = 'claude'
      classificationConfidence = claudeResult.confidence
    }

    documentLanguage = claudeResult.language ?? 'en'
    documentJurisdiction = claudeResult.jurisdiction
    plainLanguageSummary = claudeResult.plain_language_summary
    caseRelevance = claudeResult.case_relevance
    documentMetadata = claudeResult.metadata ?? {}
  } catch (claudeErr) {
    console.error('[Reclassify] Layer 2 failed:', claudeErr.message)
  }

  const result = await pool.query(
    `UPDATE documents SET
       document_type = $1,
       classification_layer = $2,
       classification_confidence = $3,
       document_language = $4,
       document_jurisdiction = $5,
       plain_language_summary = $6,
       case_relevance = $7,
       document_metadata = $8
     WHERE id = $9 AND case_id = $10
     RETURNING id, filename, document_type, extracted_date, uploaded_at,
               classification_layer, classification_confidence, document_language,
               document_jurisdiction, plain_language_summary, case_relevance, document_metadata`,
    [
      documentType, classificationLayer, classificationConfidence,
      documentLanguage, documentJurisdiction, plainLanguageSummary,
      caseRelevance, JSON.stringify(documentMetadata),
      docId, caseId,
    ]
  )

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
