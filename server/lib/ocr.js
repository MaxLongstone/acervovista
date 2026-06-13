import fs from 'fs'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import mammoth from 'mammoth'

const client = new ImageAnnotatorClient()

const PDF_MIME_TYPE = 'application/pdf'
const WORD_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function extractText(filePath, mimeType) {
  if (mimeType === PDF_MIME_TYPE) {
    return extractTextFromPdf(filePath)
  }
  if (WORD_MIME_TYPES.includes(mimeType)) {
    return extractTextFromWordDoc(filePath)
  }
  return extractTextFromImage(filePath)
}

async function extractTextFromWordDoc(filePath) {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}

async function extractTextFromImage(filePath) {
  const [result] = await client.documentTextDetection(filePath)
  return result.fullTextAnnotation?.text || ''
}

async function extractTextFromPdf(filePath) {
  const content = fs.readFileSync(filePath).toString('base64')

  const [result] = await client.batchAnnotateFiles({
    requests: [
      {
        inputConfig: { content, mimeType: PDF_MIME_TYPE },
        features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        pages: [1],
      },
    ],
  })

  const responses = result.responses?.[0]?.responses || []
  return responses
    .map((page) => page.fullTextAnnotation?.text || '')
    .join('\n')
}
