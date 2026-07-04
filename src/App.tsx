import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import WheelCanvas, { type WheelCanvasHandle } from './components/WheelCanvas'
import EntryInput from './components/EntryInput'
import AddFromImagesButton from './components/AddFromImagesButton'
import EntryList from './components/EntryList'
import EntryToolbar from './components/EntryToolbar'
import HistoryPanel from './components/HistoryPanel'
import WinnerModal from './components/WinnerModal'
import ThemePanel from './components/ThemePanel'
import BackgroundLogoUpload from './components/BackgroundLogoUpload'
import IntroAnimation from './components/IntroAnimation'
import SeoBlurb from './components/SeoBlurb'
import KofiButton from './components/KofiButton'
import { SpeakerIcon, SpeakerMutedIcon, ExpandIcon, CompressIcon } from './components/icons'
import { useSpinlyStore } from './hooks/useSpinlyStore'
import { useSpin } from './hooks/useSpin'
import { useSpinAudio } from './hooks/useSpinAudio'
import { useFullscreen } from './hooks/useFullscreen'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { THEMES, resolveActiveColors } from './lib/themes'
import { fireWinnerConfetti } from './lib/confetti'
import type { Entry } from './types'

const INTRO_SESSION_KEY = 'spinly-intro-shown'
const MIN_SPIN_SECONDS = 2
const MAX_SPIN_SECONDS = 15

function App() {
  const store = useSpinlyStore()
  const wheelRef = useRef<WheelCanvasHandle>(null)
  const [winner, setWinner] = useState<Entry | null>(null)
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SESSION_KEY) !== '1',
  )

  const { playTick, playFanfare, primeAudio } = useSpinAudio(store.settings.muted)
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const draw = useCallback((rotation: number) => {
    wheelRef.current?.draw(rotation)
  }, [])

  const { spin, isSpinning, rotation } = useSpin(store.entries.length, draw, store.settings.spinDurationMs, {
    onTick: playTick,
  })

  const activeColors = useMemo(() => resolveActiveColors(store.settings), [store.settings])
  const activeTheme = THEMES.find((t) => t.id === store.settings.themeId) ?? THEMES[0]

  useEffect(() => {
    if (!isSpinning) {
      wheelRef.current?.draw(rotation.current)
    }
  }, [
    store.entries,
    activeColors,
    activeTheme.pointerColor,
    store.settings.centerLogo,
    store.settings.labelFontScale,
    isSpinning,
    rotation,
  ])

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

  const handleCloseWinner = useCallback(() => {
    if (winner && store.settings.removeWinnerAfterSpin) {
      store.removeWinnerEntry(winner)
    }
    setWinner(null)
  }, [winner, store])

  const handleRemoveAndClose = useCallback(() => {
    if (winner) store.removeWinnerEntry(winner)
    setWinner(null)
  }, [winner, store])

  const handleClearAll = useCallback(() => {
    if (store.entries.length === 0) return
    if (typeof window !== 'undefined' && !window.confirm('Remove all entries from the wheel?')) return
    store.clearEntries()
  }, [store])

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

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const seconds = parseFloat(e.target.value)
      if (!Number.isFinite(seconds)) return
      const clamped = Math.min(MAX_SPIN_SECONDS, Math.max(MIN_SPIN_SECONDS, seconds))
      store.updateSettings({ spinDurationMs: Math.round(clamped * 1000) })
    },
    [store],
  )

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

  const wheelHint =
    store.entries.length < 2
      ? 'Add at least two names to spin'
      : isSpinning
        ? 'Spinning…'
        : 'Click the wheel — or press Space'

  return (
    <div className="flex min-h-dvh flex-col text-white" style={pageStyle}>
      {showIntro && <IntroAnimation onDone={handleIntroDone} />}

      <div
        className={`flex flex-col gap-4 p-4 md:p-6 ${
          isFullscreen ? 'h-dvh min-h-0' : 'min-h-dvh md:h-dvh md:min-h-0'
        }`}
      >
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/spinly-logo.svg" alt="" className="h-11 w-11" />
            <h1 className="text-2xl font-bold tracking-tight">Spinly</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={store.settings.muted ? 'Unmute' : 'Mute'}
              aria-pressed={store.settings.muted}
              className="rounded-full bg-neutral-800/80 p-2.5 hover:bg-neutral-700"
            >
              {store.settings.muted ? <SpeakerMutedIcon className="h-5 w-5" /> : <SpeakerIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              aria-pressed={isFullscreen}
              className="rounded-full bg-neutral-800/80 p-2.5 hover:bg-neutral-700"
            >
              {isFullscreen ? <CompressIcon className="h-5 w-5" /> : <ExpandIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 flex-col gap-6 md:flex-row md:items-stretch">
          <div className="flex min-h-[60vh] flex-1 min-w-0 flex-col items-center gap-3">
            {store.settings.title && (
              <h2 className="text-center text-xl font-semibold md:text-2xl">{store.settings.title}</h2>
            )}
            <WheelCanvas
              ref={wheelRef}
              entries={store.entries}
              colors={activeColors}
              pointerColor={activeTheme.pointerColor}
              centerImageUrl={store.settings.centerLogo}
              labelFontScale={store.settings.labelFontScale}
              onActivate={handleSpin}
              disabled={store.entries.length < 2 || isSpinning}
            />
            <p className="text-xs text-neutral-400">{wheelHint}</p>
          </div>

          {!isFullscreen && (
            <div className="flex w-full flex-col gap-4 md:w-96 md:flex-shrink-0 md:overflow-y-auto">
              <details open className="flex flex-col gap-3">
                <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  General
                </summary>
                <div className="flex flex-col gap-6 pt-1">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="spinly-title" className="text-sm text-neutral-300">
                      Title
                    </label>
                    <input
                      id="spinly-title"
                      type="text"
                      value={store.settings.title}
                      onChange={(e) => store.updateSettings({ title: e.target.value })}
                      placeholder="e.g. Who goes first?"
                      className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="spinly-duration" className="text-sm text-neutral-300">
                      Spin duration (seconds)
                    </label>
                    <input
                      id="spinly-duration"
                      type="number"
                      min={MIN_SPIN_SECONDS}
                      max={MAX_SPIN_SECONDS}
                      step={0.5}
                      value={store.settings.spinDurationMs / 1000}
                      onChange={handleDurationChange}
                      className="w-24 rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <EntryInput onAdd={store.addEntries} disabled={isSpinning} />
                    <AddFromImagesButton onAdd={store.addEntriesWithImages} disabled={isSpinning} />
                    <EntryToolbar
                      onShuffle={store.shuffleEntries}
                      onSortAZ={store.sortEntriesAZ}
                      onClearAll={handleClearAll}
                      onRestoreLast={store.restoreLastRemoved}
                      onRestoreAll={store.restoreAllRemoved}
                      canRestoreLast={store.removedEntries.length > 0}
                      canRestoreAll={store.removedEntries.length > 0}
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
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">History</h3>
                    <HistoryPanel history={store.history} />
                  </div>
                </div>
              </details>

              <details className="flex flex-col gap-3">
                <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  Graphic
                </summary>
                <div className="flex flex-col gap-4 pt-1">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="spinly-font-scale" className="text-sm text-neutral-300">
                      Label font size ({Math.round(store.settings.labelFontScale * 100)}%)
                    </label>
                    <input
                      id="spinly-font-scale"
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={store.settings.labelFontScale}
                      onChange={(e) => store.updateSettings({ labelFontScale: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <ThemePanel settings={store.settings} onUpdateSettings={store.updateSettings} />
                  <BackgroundLogoUpload settings={store.settings} onUpdateSettings={store.updateSettings} />
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {!isFullscreen && (
        <div className="flex flex-col gap-4 p-4 md:p-6">
          <SeoBlurb />
          <footer className="flex flex-col items-center gap-2 pt-2">
            <KofiButton />
            <p className="text-sm text-neutral-500">
              by{' '}
              <a
                href="https://sisqo.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                SisQo
              </a>
            </p>
          </footer>
        </div>
      )}

      <WinnerModal winner={winner} onClose={handleCloseWinner} onRemoveAndClose={handleRemoveAndClose} />
    </div>
  )
}

export default App
