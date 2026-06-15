export const DOCUMENT_TYPES = [
  // Vital records
  'death_certificate', 'birth_certificate', 'marriage_certificate', 'divorce_decree',
  'adoption_record', 'passport', 'social_security_card', 'military_discharge',
  // Testamentary
  'will', 'codicil', 'trust_agreement', 'revocable_living_trust', 'irrevocable_trust',
  'special_needs_trust', 'letters_testamentary',
  // Real property
  'lady_bird_deed', 'life_estate_deed', 'transfer_deed',
  'trustees_deed', 'executors_deed', 'deed_of_correction',
  'quitclaim_deed', 'warranty_deed', 'deed', 'mortgage', 'property_appraisal', 'property_tax_record',
  'lease_agreement', 'vehicle_title',
  // Financial
  'bank_statement', 'brokerage_statement', 'retirement_account_statement',
  'life_insurance_policy', 'insurance_policy', 'annuity_contract',
  'beneficiary_designation', 'stock_certificate', 'savings_bond',
  // Legal / court
  'court_filing', 'power_of_attorney', 'healthcare_surrogate', 'advance_directive',
  'affidavit', 'guardianship_order',
  // Business
  'corporate_record', 'operating_agreement', 'business_valuation', 'partnership_agreement',
  // Tax
  'tax_return', 'estate_tax_return',
  // International
  'apostille', 'certified_translation', 'declaratoria_de_herederos', 'foreign_death_certificate',
  // Debt / liabilities
  'promissory_note', 'credit_card_statement',
  // Other
  'funeral_contract', 'medical_record', 'digital_asset_record', 'safe_deposit_inventory',
  'unknown',
]

export const DOCUMENT_TYPE_LABELS = {
  death_certificate:            'Death Certificate',
  birth_certificate:            'Birth Certificate',
  marriage_certificate:         'Marriage Certificate',
  divorce_decree:               'Divorce Decree',
  adoption_record:              'Adoption Record',
  passport:                     'Passport',
  social_security_card:         'Social Security Card',
  military_discharge:           'Military Discharge (DD-214)',
  will:                         'Will',
  codicil:                      'Codicil (Will Amendment)',
  trust_agreement:              'Trust Agreement',
  revocable_living_trust:       'Revocable Living Trust',
  irrevocable_trust:            'Irrevocable Trust',
  special_needs_trust:          'Special Needs Trust',
  letters_testamentary:         'Letters Testamentary',
  lady_bird_deed:               'Lady Bird Deed',
  life_estate_deed:             'Life Estate Deed',
  transfer_deed:                'Transfer on Death Deed',
  trustees_deed:                "Trustee's Deed",
  executors_deed:               "Executor's Deed",
  deed_of_correction:           'Deed of Correction',
  quitclaim_deed:               'Quitclaim Deed',
  warranty_deed:                'Warranty Deed',
  deed:                         'Deed',
  mortgage:                     'Mortgage',
  property_appraisal:           'Property Appraisal',
  property_tax_record:          'Property Tax Record',
  lease_agreement:              'Lease Agreement',
  vehicle_title:                'Vehicle Title',
  bank_statement:               'Bank Statement',
  brokerage_statement:          'Brokerage Statement',
  retirement_account_statement: 'Retirement Account Statement',
  life_insurance_policy:        'Life Insurance Policy',
  insurance_policy:             'Insurance Policy',
  annuity_contract:             'Annuity Contract',
  beneficiary_designation:      'Beneficiary Designation Form',
  stock_certificate:            'Stock Certificate',
  savings_bond:                 'Savings Bond',
  court_filing:                 'Court Filing',
  power_of_attorney:            'Power of Attorney',
  healthcare_surrogate:         'Healthcare Surrogate',
  advance_directive:            'Advance Directive / Living Will',
  affidavit:                    'Affidavit',
  guardianship_order:           'Guardianship Order',
  corporate_record:             'Corporate Record',
  operating_agreement:          'Operating Agreement',
  business_valuation:           'Business Valuation',
  partnership_agreement:        'Partnership Agreement',
  tax_return:                   'Tax Return',
  estate_tax_return:            'Estate Tax Return',
  apostille:                    'Apostille',
  certified_translation:        'Certified Translation',
  declaratoria_de_herederos:    'Declaratoria de Herederos',
  foreign_death_certificate:    'Foreign Death Certificate',
  promissory_note:              'Promissory Note / Loan',
  credit_card_statement:        'Credit Card Statement',
  funeral_contract:             'Funeral / Pre-Need Contract',
  medical_record:               'Medical Record',
  digital_asset_record:         'Digital Asset Record',
  safe_deposit_inventory:       'Safe Deposit Box Inventory',
  unknown:                      'Unknown',
}

// Brand spec: mono badges — specific types get semantic tints
export function badgeColorClass(documentType) {
  switch (documentType) {
    case 'death_certificate':         return 'bg-present/10 text-present'
    case 'will':
    case 'codicil':
    case 'revocable_living_trust':
    case 'irrevocable_trust':
    case 'trust_agreement':
    case 'special_needs_trust':       return 'bg-navy text-parchment'
    case 'letters_testamentary':      return 'bg-navy-mid text-parchment-dark'
    case 'court_filing':
    case 'affidavit':
    case 'guardianship_order':        return 'bg-navy-light/20 text-navy'
    case 'unknown':                   return 'bg-parchment-deep text-ink-light'
    default:                          return 'bg-parchment-deep text-ink-mid'
  }
}

// Dot color for confidence level
export function confidenceDotClass(confidence) {
  switch (confidence) {
    case 'high':   return 'bg-present'
    case 'medium': return 'bg-gold'
    case 'low':    return 'bg-ink-light'
    default:       return 'bg-parchment-deep'
  }
}
