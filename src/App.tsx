import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import WheelCanvas, { type WheelCanvasHandle } from './components/WheelCanvas'
import EntryInput from './components/EntryInput'
import EntryList from './components/EntryList'
import EntryToolbar from './components/EntryToolbar'
import HistoryPanel from './components/HistoryPanel'
import WinnerModal from './components/WinnerModal'
import ThemePanel from './components/ThemePanel'
import BackgroundLogoUpload from './components/BackgroundLogoUpload'
import IntroAnimation from './components/IntroAnimation'
import SeoBlurb from './components/SeoBlurb'
import { useSpinlyStore } from './hooks/useSpinlyStore'
import { useSpin } from './hooks/useSpin'
import { useSpinAudio } from './hooks/useSpinAudio'
import { useFullscreen } from './hooks/useFullscreen'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { THEMES, resolveActiveColors } from './lib/themes'
import { fireWinnerConfetti } from './lib/confetti'
import type { Entry } from './types'

const INTRO_SESSION_KEY = 'spinly-intro-shown'

function App() {
  const store = useSpinlyStore()
  const wheelRef = useRef<WheelCanvasHandle>(null)
  const [winner, setWinner] = useState<Entry | null>(null)
  const [autoSpinRequested, setAutoSpinRequested] = useState(false)
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SESSION_KEY) !== '1',
  )

  const { playTick, playFanfare, primeAudio } = useSpinAudio(store.settings.muted)
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const draw = useCallback((rotation: number) => {
    wheelRef.current?.draw(rotation)
  }, [])

  const { spin, isSpinning, rotation } = useSpin(store.entries.length, draw, { onTick: playTick })

  const activeColors = useMemo(() => resolveActiveColors(store.settings), [store.settings])
  const activeTheme = THEMES.find((t) => t.id === store.settings.themeId) ?? THEMES[0]

  useEffect(() => {
    if (!isSpinning) {
      wheelRef.current?.draw(rotation.current)
    }
  }, [store.entries, activeColors, store.settings.centerLogo, isSpinning, rotation])

  const handleSpin = useCallback(async () => {
    if (showIntro || winner || isSpinning || store.entries.length < 2) return
    primeAudio()
    let winnerIndex: number
    try {
      winnerIndex = await spin()
    } catch {
      return
    }
    const winnerEntry = store.entries[winnerIndex]
    store.addHistoryRecord({
      id: winnerEntry.id,
      name: winnerEntry.name,
      image: winnerEntry.image,
      timestamp: Date.now(),
    })
    setWinner(winnerEntry)
    playFanfare()
    fireWinnerConfetti()
  }, [showIntro, winner, isSpinning, store, primeAudio, spin, playFanfare])

  useEffect(() => {
    if (autoSpinRequested && !winner && !isSpinning) {
      setAutoSpinRequested(false)
      handleSpin()
    }
  }, [autoSpinRequested, winner, isSpinning, handleSpin])

  const handleCloseWinner = useCallback(() => {
    if (winner && store.settings.removeWinnerAfterSpin) {
      store.removeEntry(winner.id)
    }
    setWinner(null)
  }, [winner, store])

  const handleRemoveAndSpinAgain = useCallback(() => {
    if (winner) store.removeEntry(winner.id)
    setWinner(null)
    setAutoSpinRequested(true)
  }, [winner, store])

  const handleKeepAndSpinAgain = useCallback(() => {
    setWinner(null)
    setAutoSpinRequested(true)
  }, [])

  const handleIntroDone = useCallback(() => {
    if (typeof window !== 'undefined') sessionStorage.setItem(INTRO_SESSION_KEY, '1')
    setShowIntro(false)
  }, [])

  const handleToggleMute = useCallback(() => {
    store.updateSettings({ muted: !store.settings.muted })
  }, [store])

  const handleExitFullscreen = useCallback(() => {
    if (isFullscreen) toggleFullscreen()
  }, [isFullscreen, toggleFullscreen])

  useKeyboardShortcuts({
    onSpin: handleSpin,
    onToggleFullscreen: toggleFullscreen,
    onToggleMute: handleToggleMute,
    onExitFullscreen: handleExitFullscreen,
  })

  const pageStyle: CSSProperties = store.settings.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${store.settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundColor: activeTheme.background }

  return (
    <div className="min-h-screen text-white" style={pageStyle}>
      {showIntro && <IntroAnimation onDone={handleIntroDone} />}

      <div className="flex flex-col items-center gap-8 p-6">
        {!isFullscreen && (
          <header className="flex w-full max-w-5xl items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Spinly</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                aria-pressed={store.settings.muted}
                className="rounded-full bg-neutral-800/80 px-4 py-2 text-sm font-medium hover:bg-neutral-700"
              >
                {store.settings.muted ? 'Unmute' : 'Mute'}
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-pressed={isFullscreen}
                className="rounded-full bg-neutral-800/80 px-4 py-2 text-sm font-medium hover:bg-neutral-700"
              >
                Fullscreen
              </button>
            </div>
          </header>
        )}

        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4">
            <WheelCanvas
              ref={wheelRef}
              entries={store.entries}
              colors={activeColors}
              pointerColor={activeTheme.pointerColor}
              size={420}
              centerImageUrl={store.settings.centerLogo}
            />
            <button
              type="button"
              onClick={handleSpin}
              disabled={store.entries.length < 2 || isSpinning}
              className="rounded-full bg-white px-8 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSpinning ? 'Spinning…' : 'Spin'}
            </button>
          </div>

          {!isFullscreen && (
            <div className="flex w-full max-w-sm flex-col gap-8">
              <div className="flex flex-col gap-3">
                <EntryInput onAdd={store.addEntries} disabled={isSpinning} />
                <EntryToolbar
                  onShuffle={store.shuffleEntries}
                  onSortAZ={store.sortEntriesAZ}
                  removeWinnerAfterSpin={store.settings.removeWinnerAfterSpin}
                  onToggleRemoveWinner={(value) => store.updateSettings({ removeWinnerAfterSpin: value })}
                  disabled={isSpinning}
                />
                <EntryList
                  entries={store.entries}
                  onUpdateEntry={store.updateEntry}
                  onRemoveEntry={store.removeEntry}
                  disabled={isSpinning}
                />
                {store.storageError && <p className="text-sm text-amber-400">{store.storageError}</p>}
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Customize</h2>
                <ThemePanel settings={store.settings} onUpdateSettings={store.updateSettings} />
                <BackgroundLogoUpload settings={store.settings} onUpdateSettings={store.updateSettings} />
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">History</h2>
                <HistoryPanel history={store.history} />
              </div>
            </div>
          )}
        </div>

        {!isFullscreen && <SeoBlurb />}
      </div>

      <WinnerModal
        winner={winner}
        onClose={handleCloseWinner}
        onRemoveAndSpinAgain={handleRemoveAndSpinAgain}
        onKeepAndSpinAgain={handleKeepAndSpinAgain}
      />
    </div>
  )
}

export default App
