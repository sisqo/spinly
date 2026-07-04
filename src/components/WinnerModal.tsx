import { useMemo } from 'react'
import type { Entry } from '../types'

interface WinnerModalProps {
  winner: Entry | null
  onClose: () => void
  onRemoveAndClose: () => void
}

export default function WinnerModal({ winner, onClose, onRemoveAndClose }: WinnerModalProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  if (!winner) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes spinly-winner-pop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        className="mx-4 w-full max-w-md rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 text-center text-white shadow-2xl ring-1 ring-white/10"
        style={{
          animation: prefersReducedMotion ? undefined : 'spinly-winner-pop 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">🎉 Winner</p>
        {winner.image ? (
          <img
            src={winner.image}
            alt=""
            className="mx-auto mb-5 h-40 w-40 rounded-full object-cover ring-4 ring-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)]"
          />
        ) : (
          <div className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-full bg-neutral-800 text-6xl font-bold uppercase text-white ring-4 ring-amber-400/80 shadow-[0_0_50px_rgba(251,191,36,0.35)]">
            {winner.name.charAt(0) || '?'}
          </div>
        )}
        <h2 className="mb-8 break-words text-4xl font-extrabold tracking-tight">{winner.name}</h2>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-6 py-3 text-base font-semibold text-black hover:bg-neutral-200"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onRemoveAndClose}
            className="rounded-full bg-neutral-800 px-6 py-2.5 text-sm font-medium hover:bg-neutral-700"
          >
            Remove and close
          </button>
        </div>
      </div>
    </div>
  )
}
