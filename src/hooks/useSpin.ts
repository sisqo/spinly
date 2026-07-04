import { useCallback, useEffect, useRef, useState } from 'react'
import { computeFinalRotation, pickWinnerIndex, segmentAtPointer, spinEasing } from '../lib/wheelMath'

export const DEFAULT_SPIN_DURATION_MS = 6500

// Gentle ambient rotation shown before the first real spin — one full turn
// roughly every 24 seconds.
const IDLE_ROTATION_SPEED = (Math.PI * 2) / 24000

interface UseSpinOptions {
  onTick?: (segmentIndex: number) => void
}

export function useSpin(
  entryCount: number,
  draw: (rotation: number) => void,
  durationMs: number = DEFAULT_SPIN_DURATION_MS,
  options: UseSpinOptions = {},
) {
  const rotationRef = useRef(0)
  const spinningRef = useRef(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const [hasSpunOnce, setHasSpunOnce] = useState(false)
  const onTickRef = useRef(options.onTick)
  onTickRef.current = options.onTick
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    if (hasSpunOnce || entryCount < 1) return
    let rafId: number
    let last: number | null = null

    const idleFrame = (t: number) => {
      if (spinningRef.current) return
      if (last === null) last = t
      const dt = t - last
      last = t
      rotationRef.current += IDLE_ROTATION_SPEED * dt
      drawRef.current(rotationRef.current)
      rafId = requestAnimationFrame(idleFrame)
    }

    rafId = requestAnimationFrame(idleFrame)
    return () => cancelAnimationFrame(rafId)
  }, [hasSpunOnce, entryCount])

  const spin = useCallback((): Promise<number> => {
    return new Promise<number>((resolve, reject) => {
      if (spinningRef.current) {
        reject(new Error('Wheel is already spinning'))
        return
      }
      if (entryCount < 1) {
        reject(new Error('Add at least one entry before spinning'))
        return
      }

      setHasSpunOnce(true)
      const winnerIndex = pickWinnerIndex(entryCount)
      const start = rotationRef.current
      const final = computeFinalRotation(start, winnerIndex, entryCount)
      let startTime: number | null = null
      let lastSegment = segmentAtPointer(start, entryCount)

      spinningRef.current = true
      setIsSpinning(true)

      const frame = (t: number) => {
        if (startTime === null) startTime = t
        const elapsed = t - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        const current = start + (final - start) * spinEasing(progress)
        rotationRef.current = current
        draw(current)

        const seg = segmentAtPointer(current, entryCount)
        if (seg !== lastSegment) {
          lastSegment = seg
          onTickRef.current?.(seg)
        }

        if (progress < 1) {
          requestAnimationFrame(frame)
        } else {
          spinningRef.current = false
          setIsSpinning(false)
          resolve(winnerIndex)
        }
      }

      requestAnimationFrame(frame)
    })
  }, [entryCount, draw, durationMs])

  return { spin, isSpinning, rotation: rotationRef }
}
