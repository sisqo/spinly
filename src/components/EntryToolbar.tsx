import { useArmedConfirm } from '../hooks/useArmedConfirm'

interface EntryToolbarProps {
  onShuffle: () => void
  onSortAZ: () => void
  onResetSample: () => void
  onClearAll: () => void
  disabled?: boolean
  hasEntries?: boolean
}

export default function EntryToolbar({
  onShuffle,
  onSortAZ,
  onResetSample,
  onClearAll,
  disabled = false,
  hasEntries = true,
}: EntryToolbarProps) {
  const { armed, trigger, pauseAutoDisarm, resumeAutoDisarm } = useArmedConfirm(onClearAll, {
    disarmWhen: disabled || !hasEntries,
  })
  const {
    armed: resetArmed,
    trigger: triggerReset,
    pauseAutoDisarm: pauseResetAutoDisarm,
    resumeAutoDisarm: resumeResetAutoDisarm,
  } = useArmedConfirm(onResetSample, { disarmWhen: disabled })

  const handleClearClick = () => {
    if (!hasEntries) return
    trigger()
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onShuffle}
        disabled={disabled}
        className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Shuffle
      </button>
      <button
        type="button"
        onClick={onSortAZ}
        disabled={disabled}
        className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sort A–Z
      </button>
      <button
        type="button"
        onClick={triggerReset}
        onMouseEnter={pauseResetAutoDisarm}
        onMouseLeave={resumeResetAutoDisarm}
        onFocus={pauseResetAutoDisarm}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeResetAutoDisarm()
        }}
        disabled={disabled}
        aria-label={resetArmed ? 'Confirm reset? This replaces all entries with the sample names' : 'Reset to sample entries'}
        className={
          resetArmed
            ? 'min-w-[8.5rem] rounded-lg border border-red-500 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40'
            : 'min-w-[8.5rem] rounded-lg border border-red-500/80 bg-transparent px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40'
        }
      >
        {resetArmed ? 'Confirm reset?' : 'Reset to sample'}
      </button>
      <button
        type="button"
        onClick={handleClearClick}
        onMouseEnter={pauseAutoDisarm}
        onMouseLeave={resumeAutoDisarm}
        onFocus={pauseAutoDisarm}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeAutoDisarm()
        }}
        disabled={disabled}
        aria-label={armed ? 'Confirm clear? This removes all entries from the wheel' : 'Clear all entries'}
        className={
          armed
            ? 'min-w-[8.5rem] rounded-lg border border-red-500 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40'
            : 'min-w-[8.5rem] rounded-lg border border-red-500/80 bg-transparent px-3 py-1.5 text-sm font-medium text-red-400 hover:border-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40'
        }
      >
        {armed ? 'Confirm clear?' : 'Clear all'}
      </button>
    </div>
  )
}
