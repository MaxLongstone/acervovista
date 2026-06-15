import Anthropic from '@anthropic-ai/sdk'
import { DOCUMENT_TYPE_LABELS } from './documentTypes.js'

const client = new Anthropic()

const VALID_TYPES = Object.keys(DOCUMENT_TYPE_LABELS)
const TYPE_LIST = VALID_TYPES.filter((t) => t !== 'unknown').join(', ')

const SYSTEM_PROMPT = `You are a document classification specialist for estate administration.
Analyze OCR text from estate documents and return structured JSON classification data.

Respond with a JSON object ONLY — no markdown, no code fences, no explanation.

Valid document_type values: ${TYPE_LIST}, unknown

Confidence levels:
- "high": clear, unambiguous match
- "medium": probable match, some uncertainty
- "low": weak match or very little text

For deed documents, extract ALL of these metadata fields if present:
- grantor: full name of the person conveying property
- grantee: full name(s) of the recipient(s), note life estate vs remainder
- remainder: remainderman's name if different from grantee
- property_address: full street address
- parcel_id: folio or parcel identification number
- recorded_date: date recorded with county (YYYY-MM-DD)
- instrument_number: official recording instrument number
- doc_stamps: documentary stamp tax amount (e.g. "$1,176.00")
- notarized_location: city/country where notarized
- account_number: last 4 digits only if financial document
- policy_number: policy or contract number if insurance
- institution: bank, insurer, or issuing institution name

Return exactly this JSON shape:
{
  "document_type": "<type from list above>",
  "confidence": "high|medium|low",
  "language": "<ISO 639-1 code, e.g. en, es, pt, fr>",
  "jurisdiction": "<US state name or country name if identifiable, else null>",
  "document_date": "<YYYY-MM-DD if found in document, else null>",
  "metadata": {
    "grantor": null,
    "grantee": null,
    "remainder": null,
    "property_address": null,
    "parcel_id": null,
    "recorded_date": null,
    "instrument_number": null,
    "doc_stamps": null,
    "notarized_location": null,
    "account_number": null,
    "policy_number": null,
    "institution": null,
    "notarized": null,
    "recorded": null
  },
  "plain_language_summary": "<1-2 sentence plain English: what this document IS and why it matters for settling the estate>",
  "case_relevance": "<brief note on what the lawyer should review or watch for>"
}`

export async function claudeClassifyDocument(ocrText, caseContext = {}) {
  const contextParts = [
    caseContext.decedentName && `Decedent: ${caseContext.decedentName}`,
    caseContext.hasWill !== undefined && `Has will: ${caseContext.hasWill}`,
    caseContext.stateOfDomicile && `State: ${caseContext.stateOfDomicile}`,
    caseContext.layer1Type && caseContext.layer1Type !== 'unknown'
      && `Layer 1 keyword classification: ${caseContext.layer1Type} (confirm or refine)`,
  ].filter(Boolean)

  const userPrompt = `Classify this estate document and extract all available metadata.
${contextParts.length ? `\nContext: ${contextParts.join(' | ')}` : ''}

Document OCR text (first 8,000 characters):
---
${(ocrText || '').slice(0, 8000) || '(no text extracted from this document)'}
---`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = message.content[0]?.text?.trim() ?? ''

  // Strip markdown code fences defensively
  const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return {
      document_type: caseContext.layer1Type ?? 'unknown',
      confidence: 'low',
      language: 'en',
      jurisdiction: null,
      document_date: null,
      metadata: {},
      plain_language_summary: null,
      case_relevance: null,
    }
  }

  // Ensure document_type is valid
  if (!VALID_TYPES.includes(parsed.document_type)) {
    parsed.document_type = caseContext.layer1Type ?? 'unknown'
  }

  // Strip null values from metadata to keep storage clean
  if (parsed.metadata) {
    parsed.metadata = Object.fromEntries(
      Object.entries(parsed.metadata).filter(([, v]) => v !== null && v !== undefined && v !== '')
    )
  }

  return parsed
}
