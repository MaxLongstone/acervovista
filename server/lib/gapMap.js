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
}

const TESTATE_REQUIRED_TYPES = ['death_certificate', 'will', 'letters_testamentary', 'court_filing']
const INTESTATE_REQUIRED_TYPES = ['death_certificate', 'letters_testamentary', 'court_filing']

export function computeGapMap({ hasWill, createdAt, documentTypes = [] }) {
  const requiredTypes = hasWill === 'yes' ? TESTATE_REQUIRED_TYPES : INTESTATE_REQUIRED_TYPES
  const uploadedTypes = new Set(documentTypes.filter((type) => type !== 'unknown'))
  const caseAgeMs = Date.now() - new Date(createdAt).getTime()

  return requiredTypes.map((type) => {
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
    }
  })
}
