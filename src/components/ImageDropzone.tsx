import { useRef } from 'react'

interface ImageDropzoneProps {
  label: string
  value: string | null
  onFile: (file: File) => void
  onRemove: () => void
  previewShape: 'rect' | 'circle'
}

export default function ImageDropzone({ label, value, onFile, onRemove, previewShape }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (inputRef.current) inputRef.current.value = ''
    if (file) onFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex min-h-[8rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-700 p-4 text-center hover:border-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      >
        {value ? (
          <img
            src={value}
            alt={`${label} preview`}
            className={`h-24 w-24 object-cover ${previewShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
          />
        ) : (
          <p className="text-sm text-neutral-400">Drag an image here, or click to upload</p>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      </div>
      {value && (
        <button
          type="button"
          onClick={onRemove}
          className="self-start text-xs text-neutral-400 hover:text-white"
        >
          Remove
        </button>
      )}
    </div>
  )
}
