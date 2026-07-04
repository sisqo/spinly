import { useCallback, useEffect, useState, type RefObject } from 'react'

export function useFullscreen(target?: RefObject<HTMLElement>) {
  const [isFullscreen, setIsFullscreen] = useState(() => document.fullscreenElement !== null)

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      return
    }
    const element = target?.current ?? document.documentElement
    element.requestFullscreen().catch(() => {})
  }, [target])

  return { isFullscreen, toggleFullscreen }
}
