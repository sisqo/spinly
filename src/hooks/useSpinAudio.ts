import { useCallback, useRef } from 'react'

export function useSpinAudio(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null
    const windowWithWebkit = window as typeof window & { webkitAudioContext?: typeof AudioContext }
    const AudioContextCtor = window.AudioContext ?? windowWithWebkit.webkitAudioContext
    if (!AudioContextCtor) return null

    if (!ctxRef.current) {
      ctxRef.current = new AudioContextCtor()
    }
    return ctxRef.current
  }, [])

  // Call synchronously from within a user-gesture handler (e.g. the Spin
  // button's onClick), before any `await` — creating/resuming the
  // AudioContext outside that synchronous stack is silently ignored by
  // strict autoplay policies (notably Safari/iOS).
  const primeAudio = useCallback(() => {
    const ctx = getContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume()
    }
  }, [getContext])

  const playTick = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const start = () => {
      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'square'
      oscillator.frequency.setValueAtTime(2200, now)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now)
      oscillator.stop(now + 0.04)
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(start)
    } else {
      start()
    }
  }, [getContext])

  const playFanfare = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const start = () => {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99, 1046.5]
      const noteDuration = 0.055

      notes.forEach((frequency, i) => {
        const noteStart = now + i * noteDuration
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(frequency, noteStart)

        gain.gain.setValueAtTime(0.0001, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.25, noteStart + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDuration)

        oscillator.connect(gain)
        gain.connect(ctx.destination)

        oscillator.start(noteStart)
        oscillator.stop(noteStart + noteDuration + 0.02)
      })
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(start)
    } else {
      start()
    }
  }, [getContext])

  return { playTick, playFanfare, primeAudio }
}
