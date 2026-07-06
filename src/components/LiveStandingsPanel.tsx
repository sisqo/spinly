import type { QuizShowPlacement } from '../types'
import { ordinal } from '../lib/ordinal'

interface LiveStandingsPanelProps {
  placements: QuizShowPlacement[]
}

export default function LiveStandingsPanel({ placements }: LiveStandingsPanelProps) {
  if (placements.length === 0) return null

  const newestFirst = [...placements].reverse()

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Standings</h3>
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
        {newestFirst.map((placement) => (
          <li
            key={placement.id}
            className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3 py-2"
          >
            {placement.image ? (
              <img src={placement.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold uppercase">
                {placement.name.charAt(0) || '?'}
              </div>
            )}
            <span className="truncate text-sm font-medium">
              {ordinal(placement.position)} — {placement.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
