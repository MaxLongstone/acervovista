import { useRef, useState } from 'react'
import { uploadDocument } from '../../api'

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_FILE_SIZE = 20 * 1024 * 1024

export default function DocumentUpload({ caseId, onUploadComplete }) {
  const [uploads, setUploads] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        window.alert(`${file.name} isn't a supported file type. Please upload a JPG, PNG, PDF, DOC, or DOCX.`)
        continue
      }
      if (file.size > MAX_FILE_SIZE) {
        window.alert(`${file.name} is larger than 20MB.`)
        continue
      }

      const uploadId = `${Date.now()}-${Math.random()}`
      setUploads((prev) => [...prev, { id: uploadId, filename: file.name, progress: 0, status: 'uploading' }])

      uploadDocument(caseId, file, (progress) => {
        setUploads((prev) => prev.map((u) =>
          u.id === uploadId
            ? { ...u, progress, status: progress >= 100 ? 'processing' : 'uploading' }
            : u
        ))
      })
        .then((document) => {
          setUploads((prev) => prev.filter((u) => u.id !== uploadId))
          onUploadComplete(document)
        })
        .catch(() => {
          setUploads((prev) => prev.map((u) =>
            u.id === uploadId ? { ...u, status: 'error' } : u
          ))
        })
    }
  }

  return (
    <div className="space-y-3 animate-settle">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer
                    transition-colors duration-150
                    ${isDragging
                      ? 'border-navy bg-parchment'
                      : 'border-parchment-deep hover:border-navy-light bg-white'}`}
      >
        <p className="text-sm text-ink-mid">Drag and drop a document here, or click to select</p>
        <p className="text-xs text-ink-light mt-1">JPG, PNG, PDF, DOC, or DOCX — up to 20MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
        />
      </div>

      {uploads.map((u) => (
        <div key={u.id} className="bg-white border border-parchment-deep rounded-md p-4">
          <p className="text-sm text-ink font-medium">{u.filename}</p>
          {u.status === 'uploading' && (
            <>
              <div className="mt-2 h-1 bg-parchment-deep rounded-full overflow-hidden">
                <div className="h-full bg-navy rounded-full transition-all duration-150"
                  style={{ width: `${u.progress}%` }} />
              </div>
              <p className="text-xs text-ink-light mt-1">Uploading… {u.progress}%</p>
            </>
          )}
          {u.status === 'processing' && (
            <p className="text-xs text-ink-light mt-1">Reading document…</p>
          )}
          {u.status === 'error' && (
            <p className="text-xs text-ink-mid mt-1">Upload failed. Please try again.</p>
          )}
        </div>
      ))}
    </div>
  )
}
