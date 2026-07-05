import { useEffect, useRef } from 'react'

export interface KeyboardShortcutHandlers {
  onSpin: () => void
  onToggleFullscreen: () => void
  onToggleMute: () => void
  onExitFullscreen: () => void
}

// Elements that natively activate on their own Enter/Space keydown (the
// browser fires a click for a focused <button>/<a href>/<summary> before any
// bubbling listener runs). The wheel itself is one of these (a <button> in
// WheelCanvas), so Space-to-spin already works via native semantics whenever
// it — or any other such control — has focus; this listener's Space/Enter
// case is only meant to catch the fallback case where focus is elsewhere
// (e.g. the page body) and must not steal activation from a focused control.
const NATIVE_ACTIVATION_SELECTOR = 'button, a[href], summary, [role="button"], [role="link"]'

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
        case 'Enter': {
          if (active instanceof HTMLElement && active.matches(NATIVE_ACTIVATION_SELECTOR)) return
          event.preventDefault()
          handlersRef.current.onSpin()
          break
        }
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
