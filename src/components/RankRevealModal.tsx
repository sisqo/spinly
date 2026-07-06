import { useEffect, useMemo, useState } from 'react'
import type { Entry } from '../types'
import { ordinal } from '../lib/ordinal'

interface RankRevealModalProps {
  reveal: { entry: Entry; position: number } | null
  onContinue: () => void
}

const EXIT_ANIMATION_MS = 250

export default function RankRevealModal({ reveal, onContinue }: RankRevealModalProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (reveal) setPendingAction(null)
  }, [reveal])

  useEffect(() => {
    if (pendingAction && prefersReducedMotion) {
      pendingAction()
    }
  }, [pendingAction, prefersReducedMotion])

  if (!reveal) return null

  const { entry, position } = reveal
  const closing = pendingAction !== null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes spinly-rank-reveal-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spinly-rank-reveal-close {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.85); opacity: 0; }
        }
      `}</style>
      <div
        className="mx-4 w-full max-w-md rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 text-center text-white shadow-2xl ring-1 ring-white/10"
        onAnimationEnd={() => pendingAction?.()}
        style={{
          animation: prefersReducedMotion
            ? undefined
            : closing
              ? `spinly-rank-reveal-close ${EXIT_ANIMATION_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`
              : 'spinly-rank-reveal-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          {ordinal(position)} place
        </p>
        {entry.image ? (
          <img
            src={entry.image}
            alt=""
            className="mx-auto mb-5 h-40 w-40 rounded-full object-cover ring-4 ring-neutral-700"
          />
        ) : (
          <div className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-full bg-neutral-800 text-6xl font-bold uppercase text-white ring-4 ring-neutral-700">
            {entry.name.charAt(0) || '?'}
          </div>
        )}
        <h2 className="mb-8 break-words text-4xl font-extrabold tracking-tight">{entry.name}</h2>
        <button
          type="button"
          onClick={() => setPendingAction(() => onContinue)}
          disabled={closing}
          className="w-full rounded-full bg-white px-6 py-3 text-base font-semibold text-black hover:bg-neutral-200 disabled:opacity-60"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
