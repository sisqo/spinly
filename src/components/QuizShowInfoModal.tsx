import { useMemo } from 'react'

interface QuizShowInfoModalProps {
  open: boolean
  onClose: () => void
}

export default function QuizShowInfoModal({ open, onClose }: QuizShowInfoModalProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spinly-quiz-show-info-title"
    >
      <style>{`
        @keyframes spinly-quiz-show-info-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="mx-4 w-full max-w-md rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 text-white shadow-2xl ring-1 ring-white/10"
        style={{
          animation: prefersReducedMotion ? undefined : 'spinly-quiz-show-info-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <h2 id="spinly-quiz-show-info-title" className="mb-4 text-2xl font-bold tracking-tight">
          Quiz Show Mode
        </h2>
        <ul className="mb-8 flex flex-col gap-3 text-sm text-neutral-300">
          <li>Every spin now ranks someone instead of picking a single winner — starting from last place and working up.</li>
          <li>Once only 3 entries remain, the wheel gives way to a card-flip podium reveal for 3rd, 2nd, and 1st place.</li>
          <li>The entry list locks for the rest of the run, and the ranking builds up live as you go.</li>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-full bg-white px-6 py-3 text-base font-semibold text-black hover:bg-neutral-200"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
