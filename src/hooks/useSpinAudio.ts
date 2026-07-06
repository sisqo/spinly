import { useCallback, useRef } from 'react'

export type PodiumRevealTier = 'third' | 'second' | 'first'

const FANFARE_NOTES = [523.25, 659.25, 783.99, 1046.5]
const FANFARE_PEAK_GAIN = 0.25

// Each podium reveal is a short ascending "ta-da": a few staccato notes
// building tension, then a sustained (optionally chorded) note landing on
// it — escalating in note-count, richness, gain, and duration from 3rd to
// 1st so 1st place reads as the unmistakable climax.
interface RevealNote {
  freq: number
  start: number
  duration: number
  gain: number
}

const PODIUM_REVEAL_NOTES: Record<PodiumRevealTier, RevealNote[]> = {
  third: [
    { freq: 587.33, start: 0, duration: 0.1, gain: 0.24 },
    { freq: 698.46, start: 0.11, duration: 0.1, gain: 0.24 },
    { freq: 880.0, start: 0.24, duration: 0.42, gain: 0.3 },
  ],
  second: [
    { freq: 659.25, start: 0, duration: 0.09, gain: 0.26 },
    { freq: 783.99, start: 0.1, duration: 0.09, gain: 0.26 },
    { freq: 987.77, start: 0.2, duration: 0.09, gain: 0.28 },
    { freq: 1174.66, start: 0.32, duration: 0.5, gain: 0.33 },
    { freq: 880.0, start: 0.32, duration: 0.5, gain: 0.2 },
  ],
  first: [
    { freq: 783.99, start: 0, duration: 0.08, gain: 0.28 },
    { freq: 987.77, start: 0.09, duration: 0.08, gain: 0.28 },
    { freq: 1174.66, start: 0.18, duration: 0.08, gain: 0.3 },
    { freq: 1567.98, start: 0.27, duration: 0.08, gain: 0.32 },
    { freq: 1567.98, start: 0.4, duration: 0.7, gain: 0.36 },
    { freq: 1975.53, start: 0.4, duration: 0.7, gain: 0.28 },
    { freq: 2349.32, start: 0.4, duration: 0.7, gain: 0.22 },
    { freq: 392.0, start: 0.4, duration: 0.7, gain: 0.18 },
  ],
}

// A short two-phrase victory jingle that follows the 1st-place "ta-da" as a
// grand-finale capstone — longer and more melodic than any single reveal
// sting, landing on a held triumphant chord.
const VICTORY_FANFARE_NOTES: RevealNote[] = [
  { freq: 523.25, start: 0, duration: 0.12, gain: 0.28 },
  { freq: 659.25, start: 0.12, duration: 0.12, gain: 0.28 },
  { freq: 783.99, start: 0.24, duration: 0.12, gain: 0.3 },
  { freq: 1046.5, start: 0.36, duration: 0.22, gain: 0.34 },
  { freq: 783.99, start: 0.62, duration: 0.12, gain: 0.3 },
  { freq: 1046.5, start: 0.74, duration: 0.12, gain: 0.32 },
  { freq: 1318.51, start: 0.86, duration: 0.12, gain: 0.34 },
  { freq: 1567.98, start: 0.98, duration: 0.85, gain: 0.38 },
  { freq: 2093.0, start: 0.98, duration: 0.85, gain: 0.3 },
  { freq: 1046.5, start: 0.98, duration: 0.85, gain: 0.22 },
]

export function useSpinAudio(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)
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
      const noteDuration = 0.055

      FANFARE_NOTES.forEach((frequency, i) => {
        const noteStart = now + i * noteDuration
        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = 'triangle'
        oscillator.frequency.setValueAtTime(frequency, noteStart)

        gain.gain.setValueAtTime(0.0001, noteStart)
        gain.gain.exponentialRampToValueAtTime(FANFARE_PEAK_GAIN, noteStart + 0.015)
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

  const getNoiseBuffer = useCallback((ctx: AudioContext): AudioBuffer => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const duration = 0.1
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    noiseBufferRef.current = buffer
    return buffer
  }, [])

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
  // phase — a rhythmic sequence of percussive hits at accelerating
  // intervals, all scheduled up front against ctx.currentTime offsets (same
  // idiom as playFanfare's note scheduling), no setInterval needed. Each hit
  // pairs a pitch-dropping low "thump" (for body/weight) with a filtered
  // noise "crack" (for the snare-like texture a single tone can't give) —
  // a bare oscillator tick alone read as too thin/quiet to register as a
  // drum roll.
  const playDrumroll = useCallback(
    (durationSeconds = 2.2) => {
      if (mutedRef.current) return
      const ctx = getContext()
      if (!ctx) return

      const start = () => {
        const now = ctx.currentTime
        const startInterval = 0.2
        const endInterval = 0.045
        const noiseBuffer = getNoiseBuffer(ctx)
        const onsets: number[] = []
        let elapsed = 0
        while (elapsed < durationSeconds) {
          onsets.push(elapsed)
          const progress = elapsed / durationSeconds
          elapsed += startInterval + (endInterval - startInterval) * progress
        }

        onsets.forEach((offset, i) => {
          const hitStart = now + offset
          const intensity = 0.7 + 0.3 * (i / Math.max(1, onsets.length - 1))

          const thumpOsc = ctx.createOscillator()
          const thumpGain = ctx.createGain()
          thumpOsc.type = 'sine'
          thumpOsc.frequency.setValueAtTime(160, hitStart)
          thumpOsc.frequency.exponentialRampToValueAtTime(55, hitStart + 0.07)
          thumpGain.gain.setValueAtTime(0.0001, hitStart)
          thumpGain.gain.exponentialRampToValueAtTime(0.4 * intensity, hitStart + 0.006)
          thumpGain.gain.exponentialRampToValueAtTime(0.0001, hitStart + 0.09)
          thumpOsc.connect(thumpGain)
          thumpGain.connect(ctx.destination)
          thumpOsc.start(hitStart)
          thumpOsc.stop(hitStart + 0.1)

          const noiseSource = ctx.createBufferSource()
          noiseSource.buffer = noiseBuffer
          const noiseFilter = ctx.createBiquadFilter()
          noiseFilter.type = 'bandpass'
          noiseFilter.frequency.setValueAtTime(2200, hitStart)
          noiseFilter.Q.value = 0.8
          const noiseGain = ctx.createGain()
          noiseGain.gain.setValueAtTime(0.0001, hitStart)
          noiseGain.gain.exponentialRampToValueAtTime(0.28 * intensity, hitStart + 0.004)
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, hitStart + 0.045)
          noiseSource.connect(noiseFilter)
          noiseFilter.connect(noiseGain)
          noiseGain.connect(ctx.destination)
          noiseSource.start(hitStart)
          noiseSource.stop(hitStart + 0.05)
        })
      }

      if (ctx.state === 'suspended') {
        ctx.resume().then(start)
      } else {
        start()
      }
    },
    [getContext, getNoiseBuffer],
  )

  const scheduleNotes = useCallback((ctx: AudioContext, notes: RevealNote[]) => {
    const now = ctx.currentTime
    notes.forEach(({ freq, start: offset, duration, gain: peakGain }) => {
      const noteStart = now + offset
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(freq, noteStart)

      gain.gain.setValueAtTime(0.0001, noteStart)
      gain.gain.exponentialRampToValueAtTime(peakGain, noteStart + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration)

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      oscillator.start(noteStart)
      oscillator.stop(noteStart + duration + 0.03)
    })
  }, [])

  const playPodiumReveal = useCallback(
    (tier: PodiumRevealTier) => {
      if (mutedRef.current) return
      const ctx = getContext()
      if (!ctx) return

      const start = () => scheduleNotes(ctx, PODIUM_REVEAL_NOTES[tier])

      if (ctx.state === 'suspended') {
        ctx.resume().then(start)
      } else {
        start()
      }
    },
    [getContext, scheduleNotes],
  )

  // Grand-finale capstone played a beat after the 1st-place reveal sting —
  // a longer, more melodic tune distinct from any single reveal's "ta-da".
  const playVictoryFanfare = useCallback(() => {
    if (mutedRef.current) return
    const ctx = getContext()
    if (!ctx) return

    const start = () => scheduleNotes(ctx, VICTORY_FANFARE_NOTES)

    if (ctx.state === 'suspended') {
      ctx.resume().then(start)
    } else {
      start()
    }
  }, [getContext, scheduleNotes])

  return {
    playTick,
    playFanfare,
    playChime,
    playDrumroll,
    playPodiumReveal,
    playVictoryFanfare,
    primeAudio,
  }
}
