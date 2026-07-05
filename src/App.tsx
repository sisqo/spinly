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
const REMOVED_TOAST_MS = 6000

function App() {
  const store = useSpinlyStore()
  const wheelRef = useRef<WheelCanvasHandle>(null)
  const [winner, setWinner] = useState<Entry | null>(null)
  const [removedToast, setRemovedToast] = useState<{ name: string } | null>(null)
  const removedToastTimeoutRef = useRef<number | null>(null)
  const undoButtonRef = useRef<HTMLButtonElement>(null)
  const [showIntro, setShowIntro] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem(INTRO_SESSION_KEY) !== '1',
  )
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
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
    activeTheme.labelColor,
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
    setWinner(null)
  }, [])

  const clearRemovedToastTimeout = useCallback(() => {
    if (removedToastTimeoutRef.current !== null) {
      window.clearTimeout(removedToastTimeoutRef.current)
      removedToastTimeoutRef.current = null
    }
  }, [])

  // The toast is the sole recovery path back to restoreLastRemoved (there's no
  // Restore button left in the toolbar), so a fixed auto-dismiss with no way
  // to pause it would fail WCAG 2.2.1 for anyone who can't read+act within
  // REMOVED_TOAST_MS. Pausing on hover/focus (and restarting the full window
  // on leave/blur) keeps it dismissable-by-default while staying open as long
  // as the user is actually engaging with it.
  const scheduleRemovedToastDismiss = useCallback(() => {
    clearRemovedToastTimeout()
    removedToastTimeoutRef.current = window.setTimeout(() => setRemovedToast(null), REMOVED_TOAST_MS)
  }, [clearRemovedToastTimeout])

  const handleRemoveAndClose = useCallback(() => {
    if (winner) {
      store.removeWinnerEntry(winner)
      setRemovedToast({ name: winner.name })
      scheduleRemovedToastDismiss()
    }
    setWinner(null)
  }, [winner, store, scheduleRemovedToastDismiss])

  const handleUndoRemove = useCallback(() => {
    clearRemovedToastTimeout()
    store.restoreLastRemoved()
    setRemovedToast(null)
  }, [store, clearRemovedToastTimeout])

  useEffect(() => {
    // Moves focus to the one control that acts on this toast as soon as it
    // appears, so a keyboard/screen-reader user's very next stop is Undo
    // rather than wherever the now-unmounted winner modal left focus.
    if (removedToast) undoButtonRef.current?.focus()
  }, [removedToast])

  useEffect(() => clearRemovedToastTimeout, [clearRemovedToastTimeout])

  const handleClearAll = useCallback(() => {
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

  // Keeps .spinly-sidebar-scroll's fade "cover" gradient (src/index.css)
  // matching whatever background actually shows through the sidebar, instead
  // of a hardcoded color that only lined up with the default Classic theme.
  const sidebarScrollShadowColor = store.settings.backgroundImage ? 'rgba(0,0,0,0.55)' : activeTheme.background
  const sidebarScrollStyle = { '--spinly-scroll-shadow': sidebarScrollShadowColor } as CSSProperties

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
        <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-neutral-950/70 py-1 backdrop-blur-sm">
          {!store.settings.hideBranding ? (
            <div className="flex items-center gap-3">
              <img src="/spinly-logo.svg" alt="" className="h-11 w-11" />
              <h1 className="text-2xl font-bold tracking-tight">Spinly</h1>
            </div>
          ) : (
            <h1 className="sr-only">Spinly</h1>
          )}
          <div className="flex gap-2 ms-auto">
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
            {store.settings.title ? (
              <h2 className="text-center text-xl font-semibold md:text-2xl">{store.settings.title}</h2>
            ) : (
              <h2 className="sr-only">Spinly wheel</h2>
            )}
            <WheelCanvas
              ref={wheelRef}
              entries={store.entries}
              colors={activeColors}
              pointerColor={activeTheme.pointerColor}
              labelColor={activeTheme.labelColor}
              centerImageUrl={store.settings.centerLogo}
              labelFontScale={store.settings.labelFontScale}
              onActivate={handleSpin}
              disabled={store.entries.length < 2 || isSpinning}
            />
            <p className="text-xs text-neutral-400">{wheelHint}</p>
          </div>

          {!isFullscreen && (
            <div
              className="spinly-sidebar-scroll flex w-full flex-col gap-4 md:w-96 md:flex-shrink-0 md:overflow-y-auto"
              style={sidebarScrollStyle}
            >
              <details open className="flex flex-col gap-3">
                <summary className="cursor-pointer text-base font-bold tracking-tight text-white">
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
                      className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-neutral-400"
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

                  <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4">
                    <EntryInput onAdd={store.addEntries} disabled={isSpinning} />
                    <AddFromImagesButton onAdd={store.addEntriesWithImages} disabled={isSpinning} />
                    <EntryToolbar
                      onShuffle={store.shuffleEntries}
                      onSortAZ={store.sortEntriesAZ}
                      onClearAll={handleClearAll}
                      disabled={isSpinning}
                      hasEntries={store.entries.length > 0}
                    />
                    <EntryList
                      entries={store.entries}
                      onUpdateEntry={store.updateEntry}
                      onRemoveEntry={store.removeEntry}
                      disabled={isSpinning}
                    />
                    {store.storageError && <p className="text-sm text-amber-400">{store.storageError}</p>}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">History</h3>
                    <HistoryPanel history={store.history} />
                  </div>
                </div>
              </details>

              <details className="flex flex-col gap-3">
                <summary className="cursor-pointer text-base font-bold tracking-tight text-white">
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
                  <label className="flex items-center gap-2 text-sm text-neutral-300">
                    <input
                      type="checkbox"
                      checked={store.settings.hideBranding}
                      onChange={(e) => store.updateSettings({ hideBranding: e.target.checked })}
                      className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 accent-white"
                    />
                    Hide logo and title
                  </label>
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
            <p className="text-sm text-neutral-400">
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

      {removedToast && (
        <>
          <style>{`
            @keyframes spinly-toast-in {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div
            role="status"
            aria-live="polite"
            className="fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-[90vw] items-center gap-3 rounded-lg bg-neutral-800 px-4 py-2.5 text-sm text-white"
            style={{ animation: prefersReducedMotion ? undefined : 'spinly-toast-in 0.2s ease-out' }}
            onMouseEnter={clearRemovedToastTimeout}
            onMouseLeave={scheduleRemovedToastDismiss}
            onFocus={clearRemovedToastTimeout}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) scheduleRemovedToastDismiss()
            }}
          >
            <span className="truncate">Removed {removedToast.name}</span>
            <button
              ref={undoButtonRef}
              type="button"
              onClick={handleUndoRemove}
              className="flex-shrink-0 font-medium underline underline-offset-2 hover:text-neutral-200"
            >
              Undo
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App
