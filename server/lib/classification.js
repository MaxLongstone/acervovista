const CLASSIFICATION_RULES = [
  {
    type: 'death_certificate',
    keywords: ['certificate of death', 'cause of death', 'date of death', 'department of health'],
  },
  {
    type: 'will',
    keywords: ['last will and testament', 'testator', 'bequeath', 'executor'],
  },
  {
    type: 'deed',
    keywords: ['warranty deed', 'quitclaim', 'grantor', 'grantee', 'property appraiser'],
  },
  {
    type: 'bank_statement',
    keywords: ['account balance', 'account number', 'statement period', 'deposits'],
  },
  {
    type: 'corporate_record',
    keywords: ['articles of incorporation', 'operating agreement', 'registered agent', 'member'],
  },
  {
    type: 'insurance_policy',
    keywords: ['policy number', 'beneficiary', 'premium', 'insured'],
  },
  {
    type: 'transfer_deed',
    keywords: ['transfer on death', 'quit claim', 'convey and warrant'],
  },
  {
    type: 'letters_testamentary',
    keywords: ['letters testamentary', 'letters of administration', 'personal representative'],
  },
  {
    type: 'court_filing',
    keywords: ['circuit court', 'probate division', 'petition', 'in re estate'],
  },
]

export function classifyDocument(ocrText) {
  const text = (ocrText || '').toLowerCase()

  for (const rule of CLASSIFICATION_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) {
      return rule.type
    }
  }

  return 'unknown'
}
