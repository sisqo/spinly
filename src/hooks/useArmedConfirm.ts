import { useEffect, useRef, useState } from 'react'

const DEFAULT_WINDOW_MS = 3000

interface UseArmedConfirmOptions {
  windowMs?: number
  disarmWhen?: boolean
}

export function useArmedConfirm(onConfirm: () => void, options: UseArmedConfirmOptions = {}) {
  const { windowMs = DEFAULT_WINDOW_MS, disarmWhen = false } = options
  const [armed, setArmed] = useState(false)
  const armedTimeoutRef = useRef<number | null>(null)
  const onConfirmRef = useRef(onConfirm)
  onConfirmRef.current = onConfirm

  const clearArmedTimeout = () => {
    if (armedTimeoutRef.current !== null) {
      window.clearTimeout(armedTimeoutRef.current)
      armedTimeoutRef.current = null
    }
  }

  const disarm = () => {
    clearArmedTimeout()
    setArmed(false)
  }

  const scheduleDisarm = () => {
    clearArmedTimeout()
    armedTimeoutRef.current = window.setTimeout(disarm, windowMs)
  }

  useEffect(() => {
    if (armed && disarmWhen) disarm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disarmWhen])

  useEffect(() => clearArmedTimeout, [])

  const trigger = () => {
    if (armed) {
      disarm()
      onConfirmRef.current()
      return
    }
    setArmed(true)
    scheduleDisarm()
  }

  // Mirrors the removed-entry toast's pause-on-hover/focus behavior (WCAG
  // 2.2.1) — someone who needs more than `windowMs` to read "Confirm...?" and
  // act shouldn't have the armed state silently revert out from under them
  // while they're actively engaging with the control.
  const pauseAutoDisarm = () => {
    if (armed) clearArmedTimeout()
  }

  const resumeAutoDisarm = () => {
    if (armed) scheduleDisarm()
  }

  return { armed, trigger, pauseAutoDisarm, resumeAutoDisarm }
}
