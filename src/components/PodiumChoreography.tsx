import { useEffect, useMemo, useRef, useState } from 'react'
import type { Entry, QuizShowPlacement } from '../types'
import { pickWinnerIndex } from '../lib/wheelMath'
import { PODIUM_COLORS } from '../lib/podiumTheme'
import type { PodiumRevealTier } from '../hooks/useSpinAudio'
import type { ConfettiIntensity } from '../lib/confetti'

interface PodiumChoreographyProps {
  finalists: Entry[]
  onComplete: (placements: [QuizShowPlacement, QuizShowPlacement, QuizShowPlacement]) => void
  playDrumroll: (durationSeconds?: number) => void
  playPodiumReveal: (tier: PodiumRevealTier) => void
  playVictoryFanfare: () => void
  fireConfetti: (intensity?: ConfettiIntensity) => void
}

function toPlacement(entry: Entry, position: number): QuizShowPlacement {
  return { id: entry.id, name: entry.name, image: entry.image, position }
}

// Draws 3rd, then 2nd, from the finalist pool via the same fair uniform-random
// primitive the wheel itself uses (crypto rejection sampling) - computed once,
// synchronously, before any visual shuffle begins. The shuffle animation below
// has zero data dependency on this result: it never re-derives or re-rolls
// anything, it only reveals these three already-known placements at scripted
// moments.
function drawPodiumOrder(finalists: Entry[]): [QuizShowPlacement, QuizShowPlacement, QuizShowPlacement] {
  const pool = [...finalists]
  const thirdIndex = pickWinnerIndex(pool.length)
  const third = pool.splice(thirdIndex, 1)[0]
  const secondIndex = pickWinnerIndex(pool.length)
  const second = pool.splice(secondIndex, 1)[0]
  const first = pool[0]
  return [toPlacement(third, 3), toPlacement(second, 2), toPlacement(first, 1)]
}

const SHUFFLE_MS = 3200
const REDUCED_SHUFFLE_MS = 300
const BEAT_MS = 1800
const REDUCED_BEAT_MS = 700
// The gap between the 1st-place reveal and onComplete — longer than a
// regular BEAT so the victory fanfare (triggered partway through it) has
// room to finish before the podium hands off to the results screen.
const FINALE_MS = 2800
const REDUCED_FINALE_MS = 2200
const VICTORY_FANFARE_DELAY_MS = 500
const REDUCED_VICTORY_FANFARE_DELAY_MS = 300

export default function PodiumChoreography({
  finalists,
  onComplete,
  playDrumroll,
  playPodiumReveal,
  playVictoryFanfare,
  fireConfetti,
}: PodiumChoreographyProps) {
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const [placements] = useState(() => drawPodiumOrder(finalists))
  const [thirdPlacement, secondPlacement, firstPlacement] = placements

  const [shuffleDone, setShuffleDone] = useState(false)
  const [revealedThird, setRevealedThird] = useState(false)
  const [revealedSecond, setRevealedSecond] = useState(false)
  const [revealedFirst, setRevealedFirst] = useState(false)

  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const audioRef = useRef({ playDrumroll, playPodiumReveal, playVictoryFanfare, fireConfetti })
  audioRef.current = { playDrumroll, playPodiumReveal, playVictoryFanfare, fireConfetti }

  useEffect(() => {
    const shuffleMs = prefersReducedMotion ? REDUCED_SHUFFLE_MS : SHUFFLE_MS
    const beatMs = prefersReducedMotion ? REDUCED_BEAT_MS : BEAT_MS
    const finaleMs = prefersReducedMotion ? REDUCED_FINALE_MS : FINALE_MS
    const victoryFanfareDelayMs = prefersReducedMotion ? REDUCED_VICTORY_FANFARE_DELAY_MS : VICTORY_FANFARE_DELAY_MS
    const firstRevealAt = shuffleMs + beatMs * 2

    audioRef.current.playDrumroll(shuffleMs / 1000)

    const timeouts = [
      window.setTimeout(() => setShuffleDone(true), shuffleMs),
      window.setTimeout(() => {
        setRevealedThird(true)
        audioRef.current.playPodiumReveal('third')
        audioRef.current.fireConfetti('big')
      }, shuffleMs),
      window.setTimeout(() => {
        setRevealedSecond(true)
        audioRef.current.playPodiumReveal('second')
        audioRef.current.fireConfetti('big')
      }, shuffleMs + beatMs),
      window.setTimeout(() => {
        setRevealedFirst(true)
        audioRef.current.playPodiumReveal('first')
        audioRef.current.fireConfetti('huge')
      }, firstRevealAt),
      window.setTimeout(() => {
        audioRef.current.playVictoryFanfare()
      }, firstRevealAt + victoryFanfareDelayMs),
      window.setTimeout(() => {
        onCompleteRef.current(placements)
      }, firstRevealAt + finaleMs),
    ]

    return () => timeouts.forEach((id) => window.clearTimeout(id))
    // Runs exactly once per mount — placements are drawn once via the lazy
    // useState initializer above and never change for the life of this run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion])

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-center justify-center gap-6">
      <style>{`
        @keyframes spinly-podium-shuffle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
      `}</style>
      {!shuffleDone ? (
        <div className="flex items-center justify-center gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex h-40 w-28 items-center justify-center rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-4xl font-bold text-neutral-600 ring-1 ring-white/10 sm:h-52 sm:w-36"
              style={
                prefersReducedMotion ? undefined : { animation: `spinly-podium-shuffle 0.6s ease-in-out ${i * 0.15}s infinite` }
              }
            >
              ?
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end justify-center gap-4">
          <PodiumSlot rank={2} placement={secondPlacement} revealed={revealedSecond} prefersReducedMotion={prefersReducedMotion} />
          <PodiumSlot rank={1} placement={firstPlacement} revealed={revealedFirst} prefersReducedMotion={prefersReducedMotion} />
          <PodiumSlot rank={3} placement={thirdPlacement} revealed={revealedThird} prefersReducedMotion={prefersReducedMotion} />
        </div>
      )}
    </div>
  )
}

interface PodiumSlotProps {
  rank: 1 | 2 | 3
  placement: QuizShowPlacement
  revealed: boolean
  prefersReducedMotion: boolean
}

function PodiumSlot({ rank, placement, revealed, prefersReducedMotion }: PodiumSlotProps) {
  const accentColor = rank === 1 ? PODIUM_COLORS.gold : rank === 2 ? PODIUM_COLORS.silver : PODIUM_COLORS.bronze
  const heightClass = rank === 1 ? 'h-56 sm:h-64' : rank === 2 ? 'h-44 sm:h-52' : 'h-36 sm:h-44'
  const flipTransitionClass = prefersReducedMotion ? '' : 'transition-transform duration-500'
  const rankLabel = rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative w-28 sm:w-36 ${heightClass} [perspective:1000px]`}>
        <div
          className={`relative h-full w-full [transform-style:preserve-3d] ${flipTransitionClass}`}
          style={{ transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-4xl font-bold text-neutral-600 ring-1 ring-white/10 [backface-visibility:hidden]">
            ?
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ boxShadow: `0 0 40px ${accentColor}66` }}
          >
            {placement.image ? (
              <img
                src={placement.image}
                alt=""
                className="h-14 w-14 rounded-full object-cover"
                style={{ boxShadow: `0 0 0 3px ${accentColor}` }}
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-xl font-bold uppercase text-white"
                style={{ boxShadow: `0 0 0 3px ${accentColor}` }}
              >
                {placement.name.charAt(0) || '?'}
              </div>
            )}
            <span className="truncate text-sm font-semibold text-white">{placement.name}</span>
          </div>
        </div>
      </div>
      <span className="text-2xl font-extrabold" style={{ color: accentColor }}>
        {rankLabel}
      </span>
    </div>
  )
}
