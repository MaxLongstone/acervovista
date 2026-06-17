import { useEffect, useRef, useState } from 'react'
import { getCase, getGapMap, listDocuments } from '../api'
import CaseStanding from '../components/casefile/CaseStanding'
import DashboardBody from '../components/casefile/DashboardBody'
import ItemDwellPage from '../components/casefile/ItemDwellPage'
import EstimateCard from '../components/casefile/EstimateCard'
import WhatYouKnow from '../components/casefile/WhatYouKnow'
import ActionsCard from '../components/casefile/ActionsCard'
import AssistantPanel from '../components/casefile/AssistantPanel'
import HandoffCard from '../components/casefile/HandoffCard'
import CaseSummaryCard from '../components/casefile/CaseSummaryCard'
import DocumentCard from '../components/casefile/DocumentCard'
import DocumentUpload from '../components/casefile/DocumentUpload'
import GapMap from '../components/casefile/GapMap'
import LawyerQuestions from '../components/casefile/LawyerQuestions'
import TakeABreath from '../components/TakeABreath'

export default function CaseFilePage({ caseId }) {
  const [dwellItemId, setDwellItemId] = useState(null)
  const [caseData, setCaseData] = useState(null)
  const [assistantMeta, setAssistantMeta] = useState(null)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [gapMap, setGapMap] = useState([])
  const [breathTriggerId, setBreathTriggerId] = useState(null)
  const documentsRef = useRef(null)

  function handleBreathTrigger(triggerId) {
    if (!localStorage.getItem(`breath_dismissed_${triggerId}`)) {
      setBreathTriggerId(triggerId)
    }
  }

  useEffect(() => {
    getCase(caseId)
      .then((data) => {
        setCaseData({
          decedentName: data.decedent_name,
          dateOfDeath: data.date_of_death,
          stateOfDomicile: data.state_of_domicile,
          maritalStatus: data.marital_status,
          spouseName: data.spouse_name,
          hasWill: data.has_will,
          heirs: data.heirs.map((h) => ({
            fullName: h.full_name,
            relationship: h.relationship,
            residence: h.residence,
          })),
          heirsInAgreement: data.heirs_in_agreement,
          assets: data.assets || [],
          preDeathTransfers: data.pre_death_transfers,
          complexity_flags: data.complexity_flags || [],
        })
        setAssistantMeta({
          turnsUsed: data.assistant_turns_used ?? 0,
          cap: data.assistant_cap ?? 10,
        })
      })
      .catch(() => setError('Could not load your case file.'))

    listDocuments(caseId).then(setDocuments).catch(() => {})
    getGapMap(caseId).then(setGapMap).catch(() => {})
  }, [caseId])

  const refreshGapMap = () => getGapMap(caseId).then(setGapMap).catch(() => {})

  const handleUploadComplete = (doc) => {
    setDocuments((prev) => [...prev, doc])
    refreshGapMap()
  }

  const handleDocumentTypeChange = (updated) => {
    setDocuments((prev) => prev.map((d) => d.id === updated.id ? updated : d))
    refreshGapMap()
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment">
        <p className="text-ink-mid">{error}</p>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-parchment">
        <p className="text-ink-light font-mono text-sm tracking-wide">Loading…</p>
      </div>
    )
  }

  if (dwellItemId) {
    return <ItemDwellPage caseId={caseId} itemId={dwellItemId} onBack={() => setDwellItemId(null)} onBreathTrigger={handleBreathTrigger} />
  }

  return (
    <>
      {breathTriggerId && (
        <TakeABreath triggerId={breathTriggerId} onDismiss={() => setBreathTriggerId(null)} />
      )}
      <CaseStanding caseId={caseId} onBreathTrigger={handleBreathTrigger} />
      <DashboardBody caseId={caseId} onDwell={setDwellItemId} />
      <EstimateCard caseId={caseId} />
      <WhatYouKnow caseId={caseId} onUpload={() => documentsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      <ActionsCard caseId={caseId} caseData={caseData} />

      <CaseSummaryCard
        caseData={caseData}
        onStartUploading={() => documentsRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Documents section */}
      <div ref={documentsRef} className="bg-off-white px-4 py-12 flex justify-center">
        <div className="max-w-xl w-full space-y-8">

          {/* Section header */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
              Case · {caseId.slice(0, 8)}
            </p>
            <h2 className="font-display font-bold text-2xl text-navy">Documents</h2>
          </div>

          {/* Upload zone */}
          <div className="bg-white border border-parchment-deep rounded-lg p-6">
            <DocumentUpload caseId={caseId} onUploadComplete={handleUploadComplete} />
          </div>

          {/* Document cards — Signature stagger */}
          {documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <DocumentCard
                  key={doc.id}
                  caseId={caseId}
                  document={doc}
                  index={i}
                  onDocumentTypeChange={handleDocumentTypeChange}
                />
              ))}
            </div>
          )}

          {/* Gap map */}
          <div className="bg-white border border-parchment-deep rounded-lg p-6">
            <GapMap gapMap={gapMap} onBreathTrigger={handleBreathTrigger} />
          </div>

          {/* Assistant */}
          {assistantMeta && (
            <AssistantPanel
              caseId={caseId}
              initialTurnsUsed={assistantMeta.turnsUsed}
              cap={assistantMeta.cap}
            />
          )}

          {/* Lawyer questions prep checklist */}
          <LawyerQuestions />

          {/* Handoff */}
          <HandoffCard caseId={caseId} />

        </div>
      </div>
    </>
  )
}
