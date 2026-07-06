import type { QuizShowPlacement } from '../types'
import { ordinal } from '../lib/ordinal'
import { PODIUM_COLORS } from '../lib/podiumTheme'

interface QuizShowResultsProps {
  placements: QuizShowPlacement[]
  onPlayAgain: () => void
  onClose: () => void
}

export default function QuizShowResults({ placements, onPlayAgain, onClose }: QuizShowResultsProps) {
  const first = placements.find((p) => p.position === 1)
  const second = placements.find((p) => p.position === 2)
  const third = placements.find((p) => p.position === 3)
  const rest = placements.filter((p) => p.position > 3).sort((a, b) => a.position - b.position)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-y-auto bg-black/85 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <h2 className="text-2xl font-bold tracking-tight text-white">Final results</h2>

      <div className="flex items-end justify-center gap-4">
        {second && <PodiumBlock placement={second} rank={2} />}
        {first && <PodiumBlock placement={first} rank={1} />}
        {third && <PodiumBlock placement={third} rank={3} />}
      </div>

      {rest.length > 0 && (
        <div className="flex w-full max-w-sm flex-col gap-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Standings</h3>
          <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {rest.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3 py-2">
                {p.image ? (
                  <img src={p.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold uppercase">
                    {p.name.charAt(0) || '?'}
                  </div>
                )}
                <span className="truncate text-sm font-medium">
                  {ordinal(p.position)} — {p.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-neutral-800 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          Close
        </button>
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full bg-white px-6 py-3 text-base font-semibold text-black hover:bg-neutral-200"
        >
          Play again
        </button>
      </div>
    </div>
  )
}

interface PodiumBlockProps {
  placement: QuizShowPlacement
  rank: 1 | 2 | 3
}

function PodiumBlock({ placement, rank }: PodiumBlockProps) {
  const accentColor = rank === 1 ? PODIUM_COLORS.gold : rank === 2 ? PODIUM_COLORS.silver : PODIUM_COLORS.bronze
  const heightClass = rank === 1 ? 'h-40 sm:h-48' : rank === 2 ? 'h-28 sm:h-36' : 'h-24 sm:h-28'

  return (
    <div className="flex flex-col items-center gap-2">
      {placement.image ? (
        <img
          src={placement.image}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
          style={{ boxShadow: `0 0 0 3px ${accentColor}` }}
        />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-2xl font-bold uppercase text-white"
          style={{ boxShadow: `0 0 0 3px ${accentColor}` }}
        >
          {placement.name.charAt(0) || '?'}
        </div>
      )}
      <span className="max-w-[7rem] truncate text-sm font-semibold text-white">{placement.name}</span>
      <div
        className={`flex w-24 sm:w-28 ${heightClass} flex-col items-center justify-start rounded-t-2xl pt-2 text-3xl font-extrabold`}
        style={{ backgroundColor: `${accentColor}22`, border: `2px solid ${accentColor}`, color: accentColor }}
      >
        {rank}
      </div>
    </div>
  )
}
