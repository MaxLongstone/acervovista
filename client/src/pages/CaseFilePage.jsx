import { useEffect, useRef, useState } from 'react'
import { getCase, getGapMap, listDocuments } from '../api'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'
import DocumentCard from '../components/casefile/DocumentCard'
import DocumentUpload from '../components/casefile/DocumentUpload'
import GapMap from '../components/casefile/GapMap'

export default function CaseFilePage({ caseId }) {
  const [caseData, setCaseData] = useState(null)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [gapMap, setGapMap] = useState([])
  const documentsRef = useRef(null)

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

    listDocuments(caseId).then(setDocuments).catch(() => {})
    getGapMap(caseId).then(setGapMap).catch(() => {})
  }, [caseId])

  const refreshGapMap = () => {
    getGapMap(caseId).then(setGapMap).catch(() => {})
  }

  const handleUploadComplete = (document) => {
    setDocuments((prev) => [...prev, document])
    refreshGapMap()
  }

  const handleDocumentTypeChange = (updatedDocument) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc))
    )
    refreshGapMap()
  }

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
    <>
      <CaseSummaryCard
        caseData={caseData}
        onStartUploading={() =>
          documentsRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      />
      <div ref={documentsRef} className="bg-gray px-4 py-8 flex justify-center">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-sm p-8 space-y-6">
          <h1 className="font-serif text-2xl text-navy">Documents</h1>

          <DocumentUpload caseId={caseId} onUploadComplete={handleUploadComplete} />

          {documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  caseId={caseId}
                  document={document}
                  onDocumentTypeChange={handleDocumentTypeChange}
                />
              ))}
            </div>
          )}

          <GapMap gapMap={gapMap} />
        </div>
      </div>
    </>
  )
}
