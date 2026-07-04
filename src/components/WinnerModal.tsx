import type { Entry } from '../types'

interface WinnerModalProps {
  winner: Entry | null
  onClose: () => void
  onRemoveAndSpinAgain: () => void
  onKeepAndSpinAgain: () => void
}

export default function WinnerModal({ winner, onClose, onRemoveAndSpinAgain, onKeepAndSpinAgain }: WinnerModalProps) {
  if (!winner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-neutral-900 p-8 text-center text-white">
        {winner.image && (
          <img src={winner.image} alt="" className="mx-auto mb-4 h-24 w-24 rounded-full object-cover" />
        )}
        <p className="mb-1 text-sm uppercase tracking-wide text-neutral-400">Winner</p>
        <h2 className="mb-6 text-3xl font-bold">{winner.name}</h2>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRemoveAndSpinAgain}
              className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700"
            >
              Remove &amp; spin again
            </button>
            <button
              type="button"
              onClick={onKeepAndSpinAgain}
              className="flex-1 rounded-full bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700"
            >
              Keep &amp; spin again
            </button>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white px-6 py-2 font-medium text-black">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
