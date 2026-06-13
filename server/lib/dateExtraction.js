const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]

const NUMERIC_DATE_RE = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g
const MONTH_NAME_DATE_RE = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/gi

function toIsoDate(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null
  }
  return date.toISOString().slice(0, 10)
}

export function extractEarliestDate(ocrText) {
  const text = ocrText || ''
  const isoDates = []

  for (const match of text.matchAll(NUMERIC_DATE_RE)) {
    let [, a, b, year] = match
    a = Number(a)
    b = Number(b)
    year = Number(year)

    // Assume MM/DD/YYYY; if the first number can't be a month, treat as DD/MM/YYYY
    let month = a
    let day = b
    if (month > 12) {
      month = b
      day = a
    }

    const iso = toIsoDate(year, month, day)
    if (iso) isoDates.push(iso)
  }

  for (const match of text.matchAll(MONTH_NAME_DATE_RE)) {
    const [, monthName, day, year] = match
    const month = MONTH_NAMES.indexOf(monthName.toLowerCase()) + 1
    const iso = toIsoDate(Number(year), month, Number(day))
    if (iso) isoDates.push(iso)
  }

  if (isoDates.length === 0) return null

  return isoDates.sort()[0]
}
