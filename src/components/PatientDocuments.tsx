import { useCallback, useEffect, useState } from 'react'
import { Download, FileText, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { api, ApiError } from '@/lib/api'
import {
  DOC_TYPE_LABELS,
  MAX_UPLOAD_BYTES,
  type DocumentType,
  type PatientDocument,
} from '@/types/documents'

const DOC_TYPES = Object.keys(DOC_TYPE_LABELS) as DocumentType[]

interface Props {
  token: string
  mode: 'staff' | 'portal'
  patientId?: string
  canDelete?: boolean
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export default function PatientDocuments({ token, mode, patientId, canDelete = true }: Props) {
  const [docs, setDocs] = useState<PatientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState<DocumentType>('aadhaar')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = mode === 'portal'
        ? await api.portalListDocuments(token)
        : await api.listPatientDocuments(token, patientId!)
      setDocs(list)
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Could not load documents')
    } finally {
      setLoading(false)
    }
  }, [token, mode, patientId])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('File exceeds 5 MB limit')
      return
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      toast.error('Use PDF, JPEG, or PNG files only')
      return
    }

    setUploading(true)
    try {
      const fileData = await readFileAsDataUrl(file)
      const payload = {
        docType,
        fileName: file.name,
        mimeType: file.type,
        fileData,
      }
      const created = mode === 'portal'
        ? await api.portalUploadDocument(token, payload)
        : await api.uploadPatientDocument(token, patientId!, payload)
      setDocs(prev => [created, ...prev])
      toast.success('Document uploaded')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const openDoc = async (doc: PatientDocument) => {
    try {
      const full = mode === 'portal'
        ? await api.portalGetDocument(token, doc.id)
        : await api.getPatientDocument(token, patientId!, doc.id)
      if (!full.fileData) {
        toast.error('File data not available')
        return
      }
      const w = window.open()
      if (!w) {
        toast.error('Allow pop-ups to view the document')
        return
      }
      if (full.mimeType === 'application/pdf') {
        w.document.write(`<iframe src="${full.fileData}" style="width:100%;height:100%;border:0" title="${full.fileName}"></iframe>`)
      } else {
        w.document.write(`<img src="${full.fileData}" alt="${full.fileName}" style="max-width:100%;height:auto" />`)
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not open document')
    }
  }

  const removeDoc = async (doc: PatientDocument) => {
    if (!confirm(`Delete ${doc.fileName}?`)) return
    try {
      if (mode === 'portal') {
        await api.portalDeleteDocument(token, doc.id)
      } else {
        await api.deletePatientDocument(token, patientId!, doc.id)
      }
      setDocs(prev => prev.filter(d => d.id !== doc.id))
      toast.success('Document removed')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="card p-4 md:p-5 border border-dashed border-gray-300 bg-gray-50/50 lg:max-w-xl">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Upload document</h4>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="label">Document type</label>
            <select
              className="input-field text-sm"
              value={docType}
              onChange={e => setDocType(e.target.value as DocumentType)}
            >
              {DOC_TYPES.map(t => (
                <option key={t} value={t}>{DOC_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <label className="btn-primary text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Choose file'}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">PDF, JPEG, or PNG · max 5 MB</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-6">Loading documents…</p>
      ) : docs.length === 0 ? (
        <div className="text-center py-10">
          <FileText size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No documents on file</p>
        </div>
      ) : (
        <div className={`gap-2 ${mode === 'portal' ? 'grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'space-y-2'}`}>
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between gap-3 p-3 md:p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {DOC_TYPE_LABELS[doc.docType]} · {formatSize(doc.fileSize)} · {new Date(doc.createdAt).toLocaleDateString('en-IN')}
                  {mode === 'staff' && doc.uploadedBy ? ` · ${doc.uploadedBy}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openDoc(doc)}
                  className="p-2 rounded-lg text-gray-500 hover:text-[#1B4332] hover:bg-white border border-transparent hover:border-gray-200"
                  title="View / download"
                >
                  <Download size={15} />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => removeDoc(doc)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-100"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
