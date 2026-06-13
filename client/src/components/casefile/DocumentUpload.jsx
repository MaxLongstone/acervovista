import { useRef, useState } from 'react'
import { uploadDocument } from '../../api'

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

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
      setUploads((prev) => [
        ...prev,
        { id: uploadId, filename: file.name, progress: 0, status: 'uploading' },
      ])

      uploadDocument(caseId, file, (progress) => {
        setUploads((prev) =>
          prev.map((upload) =>
            upload.id === uploadId
              ? { ...upload, progress, status: progress >= 100 ? 'processing' : 'uploading' }
              : upload
          )
        )
      })
        .then((document) => {
          setUploads((prev) => prev.filter((upload) => upload.id !== uploadId))
          onUploadComplete(document)
        })
        .catch(() => {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.id === uploadId ? { ...upload, status: 'error' } : upload
            )
          )
        })
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded p-8 text-center cursor-pointer ${
          isDragging ? 'border-navy bg-gray' : 'border-ink'
        }`}
      >
        <p className="text-ink">Drag and drop a document here, or click to select a file</p>
        <p className="text-sm text-ink mt-1">JPG, PNG, PDF, DOC, or DOCX, up to 20MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </div>

      {uploads.map((upload) => (
        <div key={upload.id} className="bg-gray rounded p-4">
          <p className="text-sm text-ink">{upload.filename}</p>
          {upload.status === 'uploading' && (
            <p className="text-sm text-ink mt-1">Uploading... {upload.progress}%</p>
          )}
          {upload.status === 'processing' && (
            <p className="text-sm text-ink mt-1">Processing...</p>
          )}
          {upload.status === 'error' && (
            <p className="text-sm text-red mt-1">Upload failed. Please try again.</p>
          )}
        </div>
      ))}
    </div>
  )
}
