import { useCallback, useState } from 'react'
import type { Entry, QuizShowPhase, QuizShowPlacement } from '../types'
import type { useSpinlyStore } from './useSpinlyStore'
import type { ConfettiIntensity } from '../lib/confetti'
import type { FanfareIntensity } from './useSpinAudio'

type Store = ReturnType<typeof useSpinlyStore>

function deriveDisplayPhase(store: Pick<Store, 'settings' | 'entries' | 'quizShowRun'>): QuizShowPhase {
  if (store.quizShowRun.active) return store.quizShowRun.phase
  if (store.settings.quizShowMode && store.entries.length === 3) return 'finalists'
  return 'elimination'
}

interface UseQuizShowParams {
  store: Store
  spin: () => Promise<number>
  isSpinning: boolean
  showRemovedToast: (name: string) => void
  playChime: () => void
  playDrumroll: () => void
  playFanfare: (intensity?: FanfareIntensity) => void
  fireConfetti: (intensity?: ConfettiIntensity) => void
}

export function useQuizShow({ store, spin, isSpinning, showRemovedToast, playChime, fireConfetti }: UseQuizShowParams) {
  const [rankReveal, setRankReveal] = useState<{ entry: Entry; position: number } | null>(null)
  const [podiumRunning, setPodiumRunning] = useState(false)

  const displayPhase = deriveDisplayPhase(store)
  // displayPhase can already be 'finalists' before quizShowRun.active flips true
  // (a host who enables the toggle with exactly 3 entries skips the
  // elimination phase entirely) - lock as soon as the finalist cards are
  // showing, not just once a run has formally recorded a placement, so
  // editing the entry list can't shrink the pool out from under the podium.
  const isLocked = store.quizShowRun.active || podiumRunning || displayPhase === 'finalists'

  const handleQuizSpin = useCallback(async () => {
    if (rankReveal || isSpinning || store.entries.length < 4) return
    let winnerIndex: number
    try {
      winnerIndex = await spin()
    } catch {
      return
    }
    const winnerEntry = store.entries[winnerIndex]
    const position = store.entries.length
    store.assignRankAndRemove(winnerEntry.id, position)
    setRankReveal({ entry: winnerEntry, position })
    playChime()
    fireConfetti('minimal')
  }, [rankReveal, isSpinning, store, spin, playChime, fireConfetti])

  const handleContinueRankReveal = useCallback(() => {
    if (!rankReveal) return
    showRemovedToast(rankReveal.entry.name)
    setRankReveal(null)
  }, [rankReveal, showRemovedToast])

  const handleRevealPodium = useCallback(() => {
    if (podiumRunning) return
    setPodiumRunning(true)
  }, [podiumRunning])

  const handlePodiumComplete = useCallback(
    (placements: [QuizShowPlacement, QuizShowPlacement, QuizShowPlacement]) => {
      store.completeQuizShowRun(placements)
      setPodiumRunning(false)
    },
    [store],
  )

  const handlePlayAgain = useCallback(() => store.restoreAllRemoved(), [store])
  const handleCloseResults = useCallback(() => store.endQuizShowRun(), [store])

  return {
    displayPhase,
    rankReveal,
    podiumRunning,
    isLocked,
    handleQuizSpin,
    handleContinueRankReveal,
    handleRevealPodium,
    handlePodiumComplete,
    handlePlayAgain,
    handleCloseResults,
  }
}
