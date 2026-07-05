import { useRef, useState } from 'react'
import { compressImageFile } from '../lib/imageProcessing'
import type { SpinlySettings } from '../types'

interface BackgroundLogoUploadProps {
  settings: SpinlySettings
  onUpdateSettings: (patch: Partial<SpinlySettings>) => void
}

export default function BackgroundLogoUpload({ settings, onUpdateSettings }: BackgroundLogoUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (backgroundInputRef.current) backgroundInputRef.current.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImageFile(file, { maxDimension: 1920, quality: 0.82 })
      onUpdateSettings({ backgroundImage: dataUrl })
      setError(null)
    } catch {
      setError(`Could not process "${file.name}" - it may be too large or an unsupported format.`)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (logoInputRef.current) logoInputRef.current.value = ''
    if (!file) return
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
        <div className="flex items-center gap-3">
          {settings.backgroundImage ? (
            <img
              src={settings.backgroundImage}
              alt="Background preview"
              className="h-14 w-20 rounded-lg object-cover"
            />
          ) : (
            <div className="h-14 w-20 rounded-lg border border-dashed border-neutral-700" />
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => backgroundInputRef.current?.click()}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700"
            >
              Upload
            </button>
            {settings.backgroundImage && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ backgroundImage: null })}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={backgroundInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Wheel center logo</h3>
        <div className="flex items-center gap-3">
          {settings.centerLogo ? (
            <img src={settings.centerLogo} alt="Logo preview" className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full border border-dashed border-neutral-700" />
          )}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700"
            >
              Upload
            </button>
            {settings.centerLogo && (
              <button
                type="button"
                onClick={() => onUpdateSettings({ centerLogo: null })}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Remove
              </button>
            )}
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
        </div>
      </div>

      {error && <p className="text-sm text-amber-400">{error}</p>}
    </div>
  )
}
