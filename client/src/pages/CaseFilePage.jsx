import { useEffect, useState } from 'react'
import { getCase } from '../api'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'

export default function CaseFilePage({ caseId }) {
  const [caseData, setCaseData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCase(caseId)
      .then((data) =>
        setCaseData({
          decedentName: data.decedent_name,
          dateOfDeath: data.date_of_death,
          stateOfDomicile: data.state_of_domicile,
          maritalStatus: data.marital_status,
          spouseName: data.spouse_name,
          heirs: data.heirs.map((heir) => ({
            fullName: heir.full_name,
            relationship: heir.relationship,
            residence: heir.residence,
          })),
          heirsInAgreement: data.heirs_in_agreement,
          assets: data.assets || [],
          preDeathTransfers: data.pre_death_transfers,
          complexity_flags: data.complexity_flags || [],
        })
      )
      .catch(() => setError('Could not load your case file.'))
  }, [caseId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red">{error}</p>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink">Loading your case file...</p>
      </div>
    )
  }

  return (
    <CaseSummaryCard
      caseData={caseData}
      onStartUploading={() => alert('Document uploads are coming soon.')}
    />
  )
}
