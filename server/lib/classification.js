// Layer 1: keyword pre-pass classification
// Rules are checked in order — first match wins.
// CRITICAL: More-specific deed types (lady_bird_deed, life_estate_deed, transfer_deed)
// must appear BEFORE the generic 'deed' rule, because those documents also contain
// grantor/grantee keywords that would incorrectly match the generic rule.

const CLASSIFICATION_RULES = [
  // ── Vital Records ──────────────────────────────────────────────────────────
  {
    type: 'death_certificate',
    keywords: ['certificate of death', 'cause of death', 'date of death', 'department of health', 'certify that death occurred'],
  },
  {
    type: 'birth_certificate',
    keywords: ['certificate of birth', 'date of birth', 'place of birth', 'birth registration', 'bureau of vital statistics'],
  },
  {
    type: 'marriage_certificate',
    keywords: ['certificate of marriage', 'marriage license', 'solemnized', 'officiant', 'wed on'],
  },
  {
    type: 'divorce_decree',
    keywords: ['decree of dissolution', 'final judgment of divorce', 'dissolution of marriage', 'divorce decree'],
  },
  {
    type: 'adoption_record',
    keywords: ['decree of adoption', 'petition for adoption', 'adoptive parent', 'adopted child'],
  },
  {
    type: 'military_discharge',
    keywords: ['dd-214', 'dd 214', 'certificate of release', 'discharge from active duty', 'armed forces'],
  },
  {
    type: 'passport',
    keywords: ['united states of america passport', 'passport number', 'date of expiry', 'nationality'],
  },
  {
    type: 'social_security_card',
    keywords: ['social security number', 'social security administration', 'this number has been established'],
  },

  // ── Testamentary ───────────────────────────────────────────────────────────
  {
    type: 'codicil',
    keywords: ['codicil to my last will', 'codicil to the will', 'amend my will', 'this codicil'],
  },
  {
    type: 'will',
    keywords: ['last will and testament', 'testator', 'bequeath', 'devise and bequeath', 'i hereby revoke'],
  },
  {
    type: 'special_needs_trust',
    keywords: ['special needs trust', 'supplemental needs trust', 'disability trust', 'government benefits shall not'],
  },
  {
    type: 'irrevocable_trust',
    keywords: ['irrevocable trust', 'this trust shall be irrevocable', 'cannot be amended or revoked'],
  },
  {
    type: 'revocable_living_trust',
    keywords: ['revocable living trust', 'revocable trust agreement', 'settlor reserves the right to revoke'],
  },
  {
    type: 'trust_agreement',
    keywords: ['trust agreement', 'trustee shall', 'trust estate', 'grantor hereby transfers to trustee', 'declaration of trust'],
  },
  {
    type: 'letters_testamentary',
    keywords: ['letters testamentary', 'letters of administration', 'personal representative', 'duly appointed'],
  },

  // ── Real Property — SPECIFIC DEED TYPES (most specific first, generic last) ──
  // Order matters: first match wins. lady_bird_deed must precede life_estate_deed
  // because Lady Bird deeds also contain "life estate" / "life tenant" / "remainderman".
  // "without joinder" is the legally defining phrase of a Florida Lady Bird deed.
  {
    type: 'lady_bird_deed',
    keywords: [
      'without joinder', 'without the joinder',
      'lady bird deed', 'enhanced life estate deed',
      'enhanced life estate', 'retain the right to sell',
    ],
  },
  {
    type: 'life_estate_deed',
    keywords: ['life estate', 'life tenant', 'remainderman', 'remainder interest'],
  },
  {
    type: 'transfer_deed',
    keywords: ['transfer on death', 'tod deed', 'beneficiary deed', 'on death of grantor'],
  },
  {
    type: 'trustees_deed',
    keywords: ["trustee's deed", 'trustees deed', 'as trustee of the', 'trust no.', 'trust number'],
  },
  {
    type: 'executors_deed',
    keywords: ["executor's deed", 'executors deed', 'as executor of the estate', 'personal representative deed'],
  },
  {
    type: 'deed_of_correction',
    keywords: ['deed of correction', 'corrective deed', 'scrivener\'s error', 'correct a scrivener'],
  },
  {
    type: 'quitclaim_deed',
    keywords: ['quitclaim deed', 'quit claim deed', 'remise, release and quitclaim', 'quitclaim and convey'],
  },
  {
    type: 'warranty_deed',
    keywords: ['warranty deed', 'general warranty', 'special warranty deed', 'warrant and forever defend'],
  },
  {
    type: 'deed',
    keywords: ['grantor', 'grantee', 'property appraiser', 'parcel identification', 'legal description'],
  },
  {
    type: 'mortgage',
    keywords: ['mortgage', 'deed of trust', 'mortgagor', 'mortgagee', 'lien on the property', 'promissory note secured'],
  },
  {
    type: 'property_appraisal',
    keywords: ['appraisal report', 'appraised value', 'market value as of', 'certified appraisal', 'uniform residential appraisal'],
  },
  {
    type: 'property_tax_record',
    keywords: ['property tax', 'ad valorem', 'tax bill', 'assessed value', 'millage rate', 'folio number'],
  },
  {
    type: 'vehicle_title',
    keywords: ['certificate of title', 'vehicle identification number', 'vin', 'motor vehicle', 'odometer reading'],
  },
  {
    type: 'lease_agreement',
    keywords: ['lease agreement', 'rental agreement', 'landlord', 'tenant agrees', 'monthly rent', 'security deposit'],
  },

  // ── Financial Accounts ─────────────────────────────────────────────────────
  {
    type: 'beneficiary_designation',
    keywords: ['beneficiary designation', 'primary beneficiary', 'contingent beneficiary', 'change of beneficiary'],
  },
  {
    type: 'retirement_account_statement',
    keywords: ['401(k)', '403(b)', 'ira statement', 'individual retirement account', 'required minimum distribution', 'rmd'],
  },
  {
    type: 'annuity_contract',
    keywords: ['annuity contract', 'annuity payment', 'annuitant', 'surrender charge', 'fixed annuity', 'variable annuity'],
  },
  {
    type: 'life_insurance_policy',
    keywords: ['life insurance policy', 'death benefit', 'face amount', 'whole life', 'term life', 'universal life'],
  },
  {
    type: 'insurance_policy',
    keywords: ['policy number', 'premium', 'insured', 'declarations page', 'effective date of coverage'],
  },
  {
    type: 'brokerage_statement',
    keywords: ['brokerage account', 'portfolio value', 'securities held', 'dividends reinvested', 'cost basis'],
  },
  {
    type: 'stock_certificate',
    keywords: ['stock certificate', 'shares of common stock', 'registered shareholder', 'transfer agent', 'cusip'],
  },
  {
    type: 'savings_bond',
    keywords: ['series ee', 'series i bond', 'us savings bond', 'department of the treasury', 'bond serial number'],
  },
  {
    type: 'bank_statement',
    keywords: ['account balance', 'account number', 'statement period', 'deposits', 'withdrawals', 'available balance'],
  },

  // ── Legal / Court ──────────────────────────────────────────────────────────
  {
    type: 'power_of_attorney',
    keywords: ['power of attorney', 'durable power of attorney', 'attorney-in-fact', 'principal hereby appoints'],
  },
  {
    type: 'healthcare_surrogate',
    keywords: ['healthcare surrogate', 'health care proxy', 'medical power of attorney', 'healthcare decisions'],
  },
  {
    type: 'advance_directive',
    keywords: ['advance directive', 'living will', 'do not resuscitate', 'dnr', 'end of life wishes'],
  },
  {
    type: 'guardianship_order',
    keywords: ['order of guardianship', 'guardian of the person', 'ward of the court', 'appointment of guardian'],
  },
  {
    type: 'affidavit',
    keywords: ['affidavit', 'sworn statement', 'being duly sworn', 'affiant states', 'before me the undersigned notary'],
  },
  {
    type: 'court_filing',
    keywords: ['circuit court', 'probate division', 'petition', 'in re estate', 'case number', 'honorable judge'],
  },

  // ── Business ───────────────────────────────────────────────────────────────
  {
    type: 'business_valuation',
    keywords: ['business valuation', 'fair market value of the business', 'enterprise value', 'goodwill', 'ebitda'],
  },
  {
    type: 'partnership_agreement',
    keywords: ['partnership agreement', 'general partner', 'limited partner', 'profit and loss sharing'],
  },
  {
    type: 'operating_agreement',
    keywords: ['operating agreement', 'managing member', 'member interest', 'limited liability company'],
  },
  {
    type: 'corporate_record',
    keywords: ['articles of incorporation', 'registered agent', 'bylaws', 'board of directors', 'corporate resolution'],
  },

  // ── Tax ────────────────────────────────────────────────────────────────────
  {
    type: 'estate_tax_return',
    keywords: ['form 706', 'estate tax return', 'federal estate tax', 'unified credit', 'gross estate'],
  },
  {
    type: 'tax_return',
    keywords: ['form 1040', 'form 1041', 'adjusted gross income', 'internal revenue service', 'tax year'],
  },

  // ── International ──────────────────────────────────────────────────────────
  {
    type: 'apostille',
    keywords: ['apostille', 'hague convention', 'competent authority', 'authentication of documents'],
  },
  {
    type: 'declaratoria_de_herederos',
    keywords: ['declaratoria de herederos', 'sucesión', 'herederos legítimos', 'juzgado de primera instancia'],
  },
  {
    type: 'foreign_death_certificate',
    keywords: ['defunción', 'acta de defunción', 'partida de óbito', 'certificado de fallecimiento', 'extrait d\'acte de décès'],
  },
  {
    type: 'certified_translation',
    keywords: ['certified translation', 'i certify that the translation', 'sworn translator', 'translated from'],
  },

  // ── Debt / Liabilities ─────────────────────────────────────────────────────
  {
    type: 'promissory_note',
    keywords: ['promissory note', 'i promise to pay', 'principal amount', 'interest rate per annum', 'maturity date'],
  },
  {
    type: 'credit_card_statement',
    keywords: ['credit card statement', 'minimum payment due', 'statement balance', 'credit limit', 'purchase apr'],
  },

  // ── Other ──────────────────────────────────────────────────────────────────
  {
    type: 'funeral_contract',
    keywords: ['funeral home', 'pre-need contract', 'burial arrangements', 'cremation agreement', 'funeral services'],
  },
  {
    type: 'digital_asset_record',
    keywords: ['cryptocurrency', 'bitcoin', 'ethereum', 'wallet address', 'private key', 'seed phrase', 'exchange account'],
  },
  {
    type: 'safe_deposit_inventory',
    keywords: ['safe deposit box', 'vault inventory', 'contents of box', 'safety deposit'],
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
