import fs from 'fs'
import { ImageAnnotatorClient } from '@google-cloud/vision'

const client = new ImageAnnotatorClient()

const PDF_MIME_TYPE = 'application/pdf'

export async function extractText(filePath, mimeType) {
  if (mimeType === PDF_MIME_TYPE) {
    return extractTextFromPdf(filePath)
  }
  return extractTextFromImage(filePath)
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
