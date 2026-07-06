import { useRef, useState } from 'react'
import { compressImageFile, cropToSquare } from '../lib/imageProcessing'
import type { Entry } from '../types'

interface EntryListProps {
  entries: Entry[]
  onUpdateEntry: (id: string, patch: Partial<Entry>) => void
  onRemoveEntry: (id: string) => void
  disabled?: boolean
}

export default function EntryList({ entries, onUpdateEntry, onRemoveEntry, disabled = false }: EntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [pendingPhotoId, setPendingPhotoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cancelledRef = useRef(false)

  const startEditing = (entry: Entry) => {
    cancelledRef.current = false
    setEditingId(entry.id)
    setEditValue(entry.name)
  }

  const commitEdit = () => {
    if (cancelledRef.current) {
      cancelledRef.current = false
      return
    }
    if (editingId) {
      const trimmed = editValue.trim()
      if (trimmed.length > 0) onUpdateEntry(editingId, { name: trimmed })
    }
    setEditingId(null)
  }

  const cancelEdit = () => {
    cancelledRef.current = true
    setEditingId(null)
  }

  const triggerPhotoUpload = (id: string) => {
    setPendingPhotoId(id)
    fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const id = pendingPhotoId
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPendingPhotoId(null)
    if (!file || !id) return
    try {
      const compressed = await compressImageFile(file)
      const cropped = await cropToSquare(compressed)
      onUpdateEntry(id, { image: cropped })
      setError(null)
    } catch {
      setError(`Could not process "${file.name}" - it may be too large or an unsupported format.`)
    }
  }

  if (entries.length === 0) {
    return <p className="text-sm text-neutral-400">No entries yet — add some names to get started.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3 py-2">
            {entry.image ? (
              <img src={entry.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold uppercase">
                {entry.name.charAt(0) || '?'}
              </div>
            )}

            {editingId === entry.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitEdit()
                  if (e.key === 'Escape') cancelEdit()
                }}
                className="min-w-0 flex-1 rounded bg-neutral-800 px-2 py-1 text-sm text-white outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => startEditing(entry)}
                disabled={disabled}
                aria-label={`Rename ${entry.name}`}
                className="min-w-0 flex-1 truncate text-left text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline"
              >
                {entry.name}
              </button>
            )}

            <button
              type="button"
              onClick={() => triggerPhotoUpload(entry.id)}
              disabled={disabled}
              className="flex-shrink-0 rounded-lg px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Photo
            </button>

            <button
              type="button"
              onClick={() => onRemoveEntry(entry.id)}
              disabled={disabled}
              aria-label={`Remove ${entry.name}`}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-red-400/90 hover:bg-neutral-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      {error && <p className="text-sm text-amber-400">{error}</p>}
    </div>
  )
}
