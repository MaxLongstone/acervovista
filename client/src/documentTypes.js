export const DOCUMENT_TYPES = [
  'death_certificate',
  'will',
  'deed',
  'bank_statement',
  'corporate_record',
  'insurance_policy',
  'transfer_deed',
  'letters_testamentary',
  'court_filing',
  'unknown',
]

export const DOCUMENT_TYPE_LABELS = {
  death_certificate: 'Death Certificate',
  will: 'Will',
  deed: 'Deed',
  bank_statement: 'Bank Statement',
  corporate_record: 'Corporate Record',
  insurance_policy: 'Insurance Policy',
  transfer_deed: 'Transfer on Death Deed',
  letters_testamentary: 'Letters Testamentary',
  court_filing: 'Court Filing',
  unknown: 'Unknown Document',
}

const GREEN_TYPES = new Set(['death_certificate', 'letters_testamentary'])
const NAVY_TYPES = new Set(['will', 'deed'])

export function badgeColorClass(documentType) {
  if (GREEN_TYPES.has(documentType)) return 'bg-green text-white'
  if (NAVY_TYPES.has(documentType)) return 'bg-navy text-white'
  if (documentType === 'unknown') return 'bg-gray text-ink'
  return 'bg-ink text-white'
}
