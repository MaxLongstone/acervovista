import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are helping an heir record what they remember about an estate.
Extract structured information from their free-text entry and return JSON only — no markdown, no explanation.

Return exactly this shape:
{
  "item_type": "asset" | "event" | "known_fact",
  "title": "<short descriptive title, under 80 chars>",
  "summary": "<the heir's original phrasing, preserved closely>",
  "item_date": "<YYYY-MM-DD if a date is mentioned, else null>",
  "value_cents": <integer in cents if an amount is mentioned, else null>,
  "value_currency": "<ISO currency code if amount found, else null>",
  "hook_type": "deed" | "account" | "insurance" | "will" | "general" | "vague"
}

hook_type rules:
- "deed": real estate, property, apartment, house, land, mortgage
- "account": bank account, brokerage, investment, stocks, savings, IRA, 401k
- "insurance": life insurance, policy, beneficiary
- "will": will, testament, trust
- "general": car, vehicle, jewelry, business, other asset with a clear paper trail
- "vague": no clear asset type, missing amount, missing date, or just a memory

item_type rules:
- "asset": something of value the decedent owned
- "event": something that happened (transfer, sale, gift, death)
- "known_fact": something the heir knows that does not fit asset or event

Keep the title concise and factual. Do not add judgment or implication.`

export async function claudeExtractDeclaration(text) {
  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: text }],
  })

  const raw     = message.content[0]?.text?.trim() ?? ''
  const cleaned = raw.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

  try {
    const parsed = JSON.parse(cleaned)
    return {
      item_type:      parsed.item_type      ?? 'known_fact',
      title:          parsed.title          ?? text.slice(0, 80),
      summary:        parsed.summary        ?? text,
      item_date:      parsed.item_date      ?? null,
      value_cents:    typeof parsed.value_cents === 'number' ? parsed.value_cents : null,
      value_currency: parsed.value_currency ?? null,
      hook_type:      parsed.hook_type      ?? 'vague',
    }
  } catch {
    return {
      item_type:      'known_fact',
      title:          text.slice(0, 80),
      summary:        text,
      item_date:      null,
      value_cents:    null,
      value_currency: null,
      hook_type:      'vague',
    }
  }
}
