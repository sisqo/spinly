import { useState } from 'react'
import { compressImageFile } from '../lib/imageProcessing'
import ImageDropzone from './ImageDropzone'
import type { SpinlySettings } from '../types'

interface BackgroundLogoUploadProps {
  settings: SpinlySettings
  onUpdateSettings: (patch: Partial<SpinlySettings>) => void
}

export default function BackgroundLogoUpload({ settings, onUpdateSettings }: BackgroundLogoUploadProps) {
  const [error, setError] = useState<string | null>(null)

  const handleBackgroundFile = async (file: File) => {
    try {
      const dataUrl = await compressImageFile(file, { maxDimension: 1920, quality: 0.82 })
      onUpdateSettings({ backgroundImage: dataUrl })
      setError(null)
    } catch {
      setError(`Could not process "${file.name}" - it may be too large or an unsupported format.`)
    }
  }

  const handleLogoFile = async (file: File) => {
    try {
      const dataUrl = await compressImageFile(file, { maxDimension: 512, quality: 0.9 })
      onUpdateSettings({ centerLogo: dataUrl })
      setError(null)
    } catch {
      setError(`Could not process "${file.name}" - it may be too large or an unsupported format.`)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Background image</h3>
        <ImageDropzone
          label="Background image"
          value={settings.backgroundImage}
          onFile={handleBackgroundFile}
          onRemove={() => onUpdateSettings({ backgroundImage: null })}
          previewShape="rect"
        />
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Wheel center logo</h3>
        <ImageDropzone
          label="Wheel center logo"
          value={settings.centerLogo}
          onFile={handleLogoFile}
          onRemove={() => onUpdateSettings({ centerLogo: null })}
          previewShape="circle"
        />
      </div>

      {error && <p className="text-sm text-amber-400">{error}</p>}
    </div>
  )
}
