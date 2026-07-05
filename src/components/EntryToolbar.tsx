import { useEffect, useRef, useState } from 'react'

interface EntryToolbarProps {
  onShuffle: () => void
  onSortAZ: () => void
  onClearAll: () => void
  disabled?: boolean
  hasEntries?: boolean
}

const CLEAR_CONFIRM_WINDOW_MS = 3000

export default function EntryToolbar({
  onShuffle,
  onSortAZ,
  onClearAll,
  disabled = false,
  hasEntries = true,
}: EntryToolbarProps) {
  const [armed, setArmed] = useState(false)
  const armedTimeoutRef = useRef<number | null>(null)

  const disarm = () => {
    if (armedTimeoutRef.current !== null) {
      window.clearTimeout(armedTimeoutRef.current)
      armedTimeoutRef.current = null
    }
    setArmed(false)
  }

  useEffect(() => {
    if (armed && (disabled || !hasEntries)) disarm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, hasEntries])

  useEffect(() => () => disarm(), [])

  const handleClearClick = () => {
    if (!hasEntries) return
    if (armed) {
      disarm()
      onClearAll()
      return
    }
    setArmed(true)
    armedTimeoutRef.current = window.setTimeout(disarm, CLEAR_CONFIRM_WINDOW_MS)
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
        onClick={handleClearClick}
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
