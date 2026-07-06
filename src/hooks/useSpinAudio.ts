import { useCallback, useRef } from 'react'

export type FanfareIntensity = 'normal' | 'big' | 'huge'

const FANFARE_NOTES: Record<FanfareIntensity, number[]> = {
  normal: [523.25, 659.25, 783.99, 1046.5],
  big: [523.25, 659.25, 783.99, 1046.5, 1318.51],
  huge: [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0],
}

const FANFARE_PEAK_GAIN: Record<FanfareIntensity, number> = {
  normal: 0.25,
  big: 0.3,
  huge: 0.35,
}

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

  const playFanfare = useCallback(
    (intensity: FanfareIntensity = 'normal') => {
      if (mutedRef.current) return
      const ctx = getContext()
      if (!ctx) return

      const start = () => {
        const now = ctx.currentTime
        const notes = FANFARE_NOTES[intensity]
        const peakGain = FANFARE_PEAK_GAIN[intensity]
        const noteDuration = 0.055

        notes.forEach((frequency, i) => {
          const noteStart = now + i * noteDuration
          const oscillator = ctx.createOscillator()
          const gain = ctx.createGain()

          oscillator.type = 'triangle'
          oscillator.frequency.setValueAtTime(frequency, noteStart)

          gain.gain.setValueAtTime(0.0001, noteStart)
          gain.gain.exponentialRampToValueAtTime(peakGain, noteStart + 0.015)
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
    },
    [getContext],
  )

  // A single soft confirmation tone for each elimination-phase rank reveal —
  // deliberately not a reuse of playTick (the wheel's in-flight spinning-tick
  // sound, not a reveal sound).
  const playChime = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const start = () => {
      const now = ctx.currentTime
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(659.25, now)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(now)
      oscillator.stop(now + 0.14)
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(start)
    } else {
      start()
    }
  }, [getContext])

  // Suspense/rising-tension sound for the podium choreography's shuffle
  // phase — a rhythmic sequence of brief percussive bursts at accelerating
  // intervals, all scheduled up front against ctx.currentTime offsets (same
  // idiom as playFanfare's note scheduling), no setInterval needed.
  const playDrumroll = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const start = () => {
      const now = ctx.currentTime
      const totalDuration = 2.2
      const startInterval = 0.18
      const endInterval = 0.04
      const onsets: number[] = []
      let elapsed = 0
      while (elapsed < totalDuration) {
        onsets.push(elapsed)
        const progress = elapsed / totalDuration
        elapsed += startInterval + (endInterval - startInterval) * progress
      }

      onsets.forEach((offset) => {
        const hitStart = now + offset
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = 'square'
        oscillator.frequency.setValueAtTime(120, hitStart)

        gain.gain.setValueAtTime(0.0001, hitStart)
        gain.gain.exponentialRampToValueAtTime(0.15, hitStart + 0.003)
        gain.gain.exponentialRampToValueAtTime(0.0001, hitStart + 0.03)

        oscillator.connect(gain)
        gain.connect(ctx.destination)

        oscillator.start(hitStart)
        oscillator.stop(hitStart + 0.04)
      })
    }

    if (ctx.state === 'suspended') {
      ctx.resume().then(start)
    } else {
      start()
    }
  }, [getContext])

  return { playTick, playFanfare, playChime, playDrumroll, primeAudio }
}
