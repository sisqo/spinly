import { useRef, useState } from 'react'
import { compressImageFile, cropToSquare } from '../lib/imageProcessing'

interface AddFromImagesButtonProps {
  onAdd: (items: Array<{ name: string; image: string }>) => void
  disabled?: boolean
}

function stripExtension(filename: string): string {
  const idx = filename.lastIndexOf('.')
  return idx > 0 ? filename.slice(0, idx) : filename
}

export default function AddFromImagesButton({ onAdd, disabled = false }: AddFromImagesButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRenameHint, setShowRenameHint] = useState(false)
  const renameHintShownRef = useRef(false)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (inputRef.current) inputRef.current.value = ''
    if (files.length === 0) return

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const compressed = await compressImageFile(file)
        const cropped = await cropToSquare(compressed)
        return { name: stripExtension(file.name), image: cropped }
      }),
    )

    const succeeded = results
      .filter((r): r is PromiseFulfilledResult<{ name: string; image: string }> => r.status === 'fulfilled')
      .map((r) => r.value)
    const failedNames = results
      .map((r, i) => (r.status === 'rejected' ? files[i].name : null))
      .filter((name): name is string => name !== null)

    if (succeeded.length > 0) {
      onAdd(succeeded)
      if (!renameHintShownRef.current) {
        renameHintShownRef.current = true
        setShowRenameHint(true)
      }
    }

    if (failedNames.length === 0) {
      setError(null)
    } else if (failedNames.length <= 3) {
      const quoted = failedNames.map((name) => `"${name}"`).join(', ')
      const pronoun = failedNames.length === 1 ? 'it' : 'they'
      setError(`Could not process ${quoted} - ${pronoun} may be too large or an unsupported format.`)
    } else {
      setError(`Could not process ${failedNames.length} images - they may be too large or an unsupported format.`)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="self-start rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add from images
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      {error && <p className="text-sm text-amber-400">{error}</p>}
      {showRenameHint && (
        <p className="flex items-center gap-2 text-xs text-neutral-400">
          Tip: tap a name below to rename it.
          <button
            type="button"
            onClick={() => setShowRenameHint(false)}
            aria-label="Dismiss tip"
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </p>
      )}
    </div>
  )
}
