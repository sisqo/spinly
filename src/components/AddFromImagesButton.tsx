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
    if (succeeded.length > 0) onAdd(succeeded)
    setError(results.some((r) => r.status === 'rejected') ? 'Some images could not be processed.' : null)
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
    </div>
  )
}
