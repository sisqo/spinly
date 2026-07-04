import { useCallback, useEffect, useState, type RefObject } from 'react'

function supportsFullscreenApi() {
  return typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function'
}

// Drives the app's own presentation layout (hide sidebar/footer, expand the
// wheel) independently of the browser's native Fullscreen API. iOS Safari —
// and any in-app webview — never implements requestFullscreen() for
// arbitrary elements (only <video> can go fullscreen there), so relying on
// document.fullscreenElement alone left the button doing nothing on mobile.
// The native API is still used opportunistically where it *is* supported,
// for a true OS-chrome-hiding fullscreen.
export function useFullscreen(target?: RefObject<HTMLElement>) {
  const [isPresenting, setIsPresenting] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsPresenting(false)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isPresenting) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {})
      }
      setIsPresenting(false)
      return
    }

    setIsPresenting(true)
    if (supportsFullscreenApi()) {
      const element = target?.current ?? document.documentElement
      element.requestFullscreen().catch(() => {})
    }
  }, [isPresenting, target])

  return { isFullscreen: isPresenting, toggleFullscreen }
}
