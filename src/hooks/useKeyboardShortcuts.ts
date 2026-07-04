import { useEffect, useRef } from 'react'

export interface KeyboardShortcutHandlers {
  onSpin: () => void
  onToggleFullscreen: () => void
  onToggleMute: () => void
  onExitFullscreen: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return

      const active = document.activeElement
      const isEditable =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      if (isEditable) return

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault()
          handlersRef.current.onSpin()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          handlersRef.current.onToggleFullscreen()
          break
        case 'm':
        case 'M':
          event.preventDefault()
          handlersRef.current.onToggleMute()
          break
        case 'Escape':
          event.preventDefault()
          handlersRef.current.onExitFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
