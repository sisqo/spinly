interface EntryToolbarProps {
  onShuffle: () => void
  onSortAZ: () => void
  onClearAll: () => void
  onRestoreLast: () => void
  onRestoreAll: () => void
  canRestoreLast: boolean
  canRestoreAll: boolean
  disabled?: boolean
}

export default function EntryToolbar({
  onShuffle,
  onSortAZ,
  onClearAll,
  onRestoreLast,
  onRestoreAll,
  canRestoreLast,
  canRestoreAll,
  disabled = false,
}: EntryToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
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
          onClick={onClearAll}
          disabled={disabled}
          className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear all
        </button>
      </div>

      {(canRestoreLast || canRestoreAll) && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRestoreLast}
            disabled={disabled || !canRestoreLast}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Restore last removed
          </button>
          <button
            type="button"
            onClick={onRestoreAll}
            disabled={disabled || !canRestoreAll}
            className="rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Restore all removed
          </button>
        </div>
      )}
    </div>
  )
}
