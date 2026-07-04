interface EntryToolbarProps {
  onShuffle: () => void
  onSortAZ: () => void
  removeWinnerAfterSpin: boolean
  onToggleRemoveWinner: (value: boolean) => void
  disabled?: boolean
}

export default function EntryToolbar({
  onShuffle,
  onSortAZ,
  removeWinnerAfterSpin,
  onToggleRemoveWinner,
  disabled = false,
}: EntryToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2">
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
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-300">Remove winner after spin</span>
        <button
          type="button"
          role="switch"
          aria-checked={removeWinnerAfterSpin}
          aria-label="Remove winner after spin"
          onClick={() => onToggleRemoveWinner(!removeWinnerAfterSpin)}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
            removeWinnerAfterSpin ? 'bg-white' : 'bg-neutral-700'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${
              removeWinnerAfterSpin ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
