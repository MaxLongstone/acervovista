import { DOCUMENT_TYPE_LABELS } from './documentTypes.js'

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000

const GAP_MAP_COPY = {
  death_certificate: {
    why: 'Required to begin estate administration and notify every institution involved.',
    where:
      'Florida Department of Health, Bureau of Vital Statistics, or the county health department where the death occurred. Order at least 5 certified copies.',
  },
  will: {
    why: 'The court needs the original will to accept it and determine how assets are distributed.',
    where:
      "Check with the decedent's attorney, their safe deposit box, or the clerk of court — wills are sometimes filed for safekeeping before death.",
  },
  letters_testamentary: {
    why: 'This court order gives the Personal Representative legal authority to act on behalf of the estate.',
    where:
      'Issued by the Circuit Court after the will is accepted. Your estate attorney files for these.',
  },
  court_filing: {
    why: 'The Petition for Administration formally opens the estate case with the court.',
    where:
      'Filed by your attorney with the Circuit Court in the county where the decedent lived.',
  },
  // Optional — shown as "Recommended" rather than critical
  life_insurance_policy: {
    why: 'Life insurance proceeds pass directly to named beneficiaries and are not part of the estate — but the policy must be located to file a claim.',
    where:
      "Check the decedent's files, employer HR department (group life), or search the NAIC Life Insurance Policy Locator at naic.org.",
  },
  retirement_account_statement: {
    why: 'IRAs and 401(k)s have named beneficiaries and bypass the estate — but the institution must be notified and accounts properly re-titled.',
    where:
      "Contact the financial institution directly. Look for statements in the decedent's mail or online accounts.",
  },
  beneficiary_designation: {
    why: 'Beneficiary designation forms control who receives accounts and policies — they override the will and must be on file.',
    where:
      "Request directly from each financial institution, insurance company, or employer benefits office.",
  },
  trust_agreement: {
    why: 'If assets were transferred into a trust during life, the trust agreement governs distribution — not the will.',
    where:
      "The decedent's attorney should have a copy. Check the safe deposit box or any estate planning documents.",
  },
  property_tax_record: {
    why: 'Confirms property ownership, assessed value, and any outstanding tax liens on real estate.',
    where:
      "Available online from the county property appraiser's website using the parcel ID or owner name.",
  },
  apostille: {
    why: 'Required to use U.S. documents (like the death certificate) in foreign countries for international estate matters.',
    where:
      'Obtained from the Florida Secretary of State. The document must first be certified by the issuing county or agency.',
  },
  certified_translation: {
    why: 'Any foreign-language document submitted to a U.S. court must be accompanied by a certified English translation.',
    where:
      'A certified translator or translation agency. The American Translators Association (ata-divisions.org) maintains a directory.',
  },
  declaratoria_de_herederos: {
    why: 'Required to transfer assets held in countries like Mexico, Colombia, or Spain — establishes who the legal heirs are under foreign law.',
    where:
      'Issued by a notario público or civil court in the country where the assets are located. A local attorney in that country will need to file.',
  },
}

const TESTATE_REQUIRED_TYPES = ['death_certificate', 'will', 'letters_testamentary', 'court_filing']
const INTESTATE_REQUIRED_TYPES = ['death_certificate', 'letters_testamentary', 'court_filing']

const OPTIONAL_TYPES = [
  'life_insurance_policy',
  'retirement_account_statement',
  'beneficiary_designation',
  'trust_agreement',
  'property_tax_record',
  'apostille',
  'certified_translation',
  'declaratoria_de_herederos',
]

export function computeGapMap({ hasWill, createdAt, documentTypes = [] }) {
  const requiredTypes = hasWill === 'yes' ? TESTATE_REQUIRED_TYPES : INTESTATE_REQUIRED_TYPES
  const uploadedTypes = new Set(documentTypes.filter((type) => type !== 'unknown'))
  const caseAgeMs = Date.now() - new Date(createdAt).getTime()

  const requiredItems = requiredTypes.map((type) => {
    let status
    if (uploadedTypes.has(type)) {
      status = 'green'
    } else if (caseAgeMs > FOURTEEN_DAYS_MS) {
      status = 'red'
    } else {
      status = 'gold'
    }

    return {
      type,
      name: DOCUMENT_TYPE_LABELS[type],
      why: GAP_MAP_COPY[type].why,
      where: GAP_MAP_COPY[type].where,
      status,
      required: true,
    }
  })

  const optionalItems = OPTIONAL_TYPES
    .filter((type) => !uploadedTypes.has(type))
    .map((type) => ({
      type,
      name: DOCUMENT_TYPE_LABELS[type],
      why: GAP_MAP_COPY[type].why,
      where: GAP_MAP_COPY[type].where,
      status: 'optional',
      required: false,
    }))

  return [...requiredItems, ...optionalItems]
}
