export const DOCUMENT_TYPES = [
  'death_certificate', 'will', 'deed', 'bank_statement', 'corporate_record',
  'insurance_policy', 'transfer_deed', 'letters_testamentary', 'court_filing', 'unknown',
]

export const DOCUMENT_TYPE_LABELS = {
  death_certificate:   'Death Certificate',
  will:                'Will',
  deed:                'Deed',
  bank_statement:      'Bank Statement',
  corporate_record:    'Corporate Record',
  insurance_policy:    'Insurance Policy',
  transfer_deed:       'Transfer on Death Deed',
  letters_testamentary:'Letters Testamentary',
  court_filing:        'Court Filing',
  unknown:             'Unknown',
}

// Brand spec: mono badges — specific types get semantic background tints
export function badgeColorClass(documentType) {
  switch (documentType) {
    case 'death_certificate':    return 'bg-present/10 text-present'
    case 'will':                 return 'bg-navy text-parchment'
    case 'letters_testamentary': return 'bg-navy-mid text-parchment-dark'
    case 'unknown':              return 'bg-parchment-deep text-ink-light'
    default:                     return 'bg-parchment-deep text-ink-mid'
  }
}
