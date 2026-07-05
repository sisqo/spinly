import ColorSwatch from './ColorSwatch'
import { THEMES, resolveActiveColors } from '../lib/themes'
import { cryptoRandom01 } from '../lib/wheelMath'
import type { SpinlySettings } from '../types'

interface ThemePanelProps {
  settings: SpinlySettings
  onUpdateSettings: (patch: Partial<SpinlySettings>) => void
}

const MIN_COLORS = 2

function randomHexColor(): string {
  const hue = Math.floor(cryptoRandom01() * 360)
  return hslToHex(hue, 70, 55)
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sNorm * Math.min(lNorm, 1 - lNorm)
  const f = (n: number) => lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}

export default function ThemePanel({ settings, onUpdateSettings }: ThemePanelProps) {
  const isCustom = Array.isArray(settings.customColors) && settings.customColors.length > 0
  const activeColors = resolveActiveColors(settings)

  const selectTheme = (themeId: string) => {
    onUpdateSettings({ themeId, customColors: null })
  }

  const updateColorAt = (index: number, value: string) => {
    const next = [...activeColors]
    next[index] = value
    onUpdateSettings({ customColors: next })
  }

  const addColor = () => {
    onUpdateSettings({ customColors: [...activeColors, randomHexColor()] })
  }

  const removeColor = (index: number) => {
    if (activeColors.length <= MIN_COLORS) return
    onUpdateSettings({ customColors: activeColors.filter((_, i) => i !== index) })
  }

  const resetToTheme = () => {
    onUpdateSettings({ customColors: null })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Theme</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEMES.map((theme) => {
            const selected = settings.themeId === theme.id
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => selectTheme(theme.id)}
                className={`flex flex-col gap-2 rounded-lg border px-3 py-2 text-left transition ${
                  selected
                    ? 'border-white bg-neutral-800'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-600'
                }`}
              >
                <div className="flex gap-1">
                  {theme.colors.slice(0, 5).map((c, i) => (
                    <span key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-sm font-medium">{theme.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-800 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Segment colors</h3>
          {isCustom && (
            <button type="button" onClick={resetToTheme} className="text-xs text-neutral-400 hover:text-white">
              Reset to theme
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {activeColors.map((color, index) => (
            <ColorSwatch
              key={index}
              color={color}
              onChange={(hex) => updateColorAt(index, hex)}
              label={`Segment color ${index + 1}`}
              onRemove={activeColors.length > MIN_COLORS ? () => removeColor(index) : undefined}
              removeLabel={activeColors.length > MIN_COLORS ? `Remove color ${index + 1}` : undefined}
            />
          ))}
          <button
            type="button"
            onClick={addColor}
            aria-label="Add color"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-neutral-600 text-neutral-400 hover:border-white hover:text-white"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
