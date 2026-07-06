import type { Entry } from '../types'

interface FinalistCardsProps {
  finalists: Entry[]
  onActivate: () => void
  disabled?: boolean
}

export default function FinalistCards({ finalists, onActivate, disabled = false }: FinalistCardsProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      disabled={disabled}
      aria-label="Reveal the podium"
      className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-6 disabled:cursor-not-allowed enabled:cursor-pointer"
    >
      <div className="flex items-center justify-center gap-4">
        {finalists.map((entry) => (
          <div
            key={entry.id}
            className="flex h-40 w-28 items-center justify-center rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-4xl font-bold text-neutral-600 ring-1 ring-white/10 sm:h-52 sm:w-36"
          >
            ?
          </div>
        ))}
      </div>
      <span className="rounded-full bg-white px-6 py-3 text-base font-semibold text-black">Reveal the podium</span>
    </button>
  )
}
