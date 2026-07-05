import { useRef } from 'react'
import ToggleSwitch from './ToggleSwitch'
import ThemePanel from './ThemePanel'
import BackgroundLogoUpload from './BackgroundLogoUpload'
import { useArmedConfirm } from '../hooks/useArmedConfirm'
import { MIN_SPIN_SECONDS, MAX_SPIN_SECONDS, MIN_FONT_SCALE, MAX_FONT_SCALE, FONT_SCALE_STEP } from '../lib/constants'
import type { SpinlySettings } from '../types'

interface SettingsPanelProps {
  settings: SpinlySettings
  onUpdateSettings: (patch: Partial<SpinlySettings>) => void
  onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onResetDefaults: () => void
}

export default function SettingsPanel({
  settings,
  onUpdateSettings,
  onDurationChange,
  onResetDefaults,
}: SettingsPanelProps) {
  const { armed, trigger, pauseAutoDisarm, resumeAutoDisarm } = useArmedConfirm(onResetDefaults)
  const fontScaleInputRef = useRef<HTMLInputElement>(null)

  // Chromium's native <input type="range"> abandons its own touch-drag
  // tracking mid-gesture once a touchmove strays far enough perpendicular to
  // the track (easy to trigger with a real finger on a slider this thin) -
  // confirmed via direct touch-event simulation, reproducing even on a bare
  // range input with no scrollable ancestor at all, and unaffected by
  // touch-action. Once abandoned, the thumb freezes for the rest of the
  // drag: it only ever "worked on click", never on a real touch drag.
  // touch-action: none (below) stops the page from stealing the gesture for
  // scrolling, but doesn't rescue the native tracking - so for touch
  // pointers specifically we take over value computation ourselves from a
  // captured pointer's clientX, bypassing the native drag logic entirely.
  // Mouse/pen/keyboard interaction is untouched and keeps working exactly as
  // before.
  const setFontScaleFromClientX = (clientX: number) => {
    const el = fontScaleInputRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = MIN_FONT_SCALE + fraction * (MAX_FONT_SCALE - MIN_FONT_SCALE)
    const stepped = Math.round(raw / FONT_SCALE_STEP) * FONT_SCALE_STEP
    onUpdateSettings({ labelFontScale: Math.round(stepped * 100) / 100 })
  }

  const handleFontScalePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    if (e.pointerType !== 'touch') return
    e.currentTarget.setPointerCapture(e.pointerId)
    setFontScaleFromClientX(e.clientX)
  }

  const handleFontScalePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
    if (e.pointerType !== 'touch' || !e.currentTarget.hasPointerCapture(e.pointerId)) return
    setFontScaleFromClientX(e.clientX)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold tracking-tight text-white">General</h3>
        <div className="flex flex-col gap-1">
          <label htmlFor="spinly-title" className="text-sm text-neutral-300">
            Title
          </label>
          <input
            id="spinly-title"
            type="text"
            value={settings.title}
            onChange={(e) => onUpdateSettings({ title: e.target.value })}
            placeholder="e.g. Who goes first?"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="spinly-duration" className="text-sm text-neutral-300">
            Spin duration (seconds)
          </label>
          <input
            id="spinly-duration"
            type="number"
            min={MIN_SPIN_SECONDS}
            max={MAX_SPIN_SECONDS}
            step={0.5}
            value={settings.spinDurationMs / 1000}
            onChange={onDurationChange}
            className="w-24 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-neutral-800 pt-4">
        <h3 className="text-base font-bold tracking-tight text-white">Appearance</h3>
        <ToggleSwitch
          id="spinly-hide-branding"
          checked={settings.hideBranding}
          onChange={(checked) => onUpdateSettings({ hideBranding: checked })}
          label="Hide Spinly logo"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="spinly-font-scale" className="text-sm text-neutral-300">
            Label font size ({Math.round(settings.labelFontScale * 100)}%)
          </label>
          <input
            id="spinly-font-scale"
            ref={fontScaleInputRef}
            type="range"
            min={MIN_FONT_SCALE}
            max={MAX_FONT_SCALE}
            step={FONT_SCALE_STEP}
            value={settings.labelFontScale}
            onChange={(e) => onUpdateSettings({ labelFontScale: parseFloat(e.target.value) })}
            onPointerDown={handleFontScalePointerDown}
            onPointerMove={handleFontScalePointerMove}
            className="w-full touch-none"
          />
        </div>
        <ThemePanel settings={settings} onUpdateSettings={onUpdateSettings} />
        <BackgroundLogoUpload settings={settings} onUpdateSettings={onUpdateSettings} />
      </div>

      <div className="border-t border-neutral-800 pt-4">
        <button
          type="button"
          onClick={trigger}
          onMouseEnter={pauseAutoDisarm}
          onMouseLeave={resumeAutoDisarm}
          onFocus={pauseAutoDisarm}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeAutoDisarm()
          }}
          aria-label={armed ? 'Confirm reset? This restores all settings to their defaults' : 'Reset to defaults'}
          className={
            armed
              ? 'min-w-[10rem] rounded-lg border border-red-500 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20'
              : 'min-w-[10rem] rounded-lg border border-red-500/80 bg-transparent px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-500 hover:bg-red-500/10'
          }
        >
          {armed ? 'Confirm reset?' : 'Reset to defaults'}
        </button>
      </div>
    </div>
  )
}
