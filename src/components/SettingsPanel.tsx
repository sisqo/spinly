import ToggleSwitch from './ToggleSwitch'
import ThemePanel from './ThemePanel'
import BackgroundLogoUpload from './BackgroundLogoUpload'
import { useArmedConfirm } from '../hooks/useArmedConfirm'
import { MIN_SPIN_SECONDS, MAX_SPIN_SECONDS } from '../lib/constants'
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
          label="Hide logo and title"
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="spinly-font-scale" className="text-sm text-neutral-300">
            Label font size ({Math.round(settings.labelFontScale * 100)}%)
          </label>
          <input
            id="spinly-font-scale"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.labelFontScale}
            onChange={(e) => onUpdateSettings({ labelFontScale: parseFloat(e.target.value) })}
            className="w-full"
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
