import { useCallback, useRef, useState } from 'react'
import { computeFinalRotation, easeOutQuint, pickWinnerIndex, segmentAtPointer } from '../lib/wheelMath'

const SPIN_DURATION_MS = 6500

interface UseSpinOptions {
  onTick?: (segmentIndex: number) => void
}

export function useSpin(entryCount: number, draw: (rotation: number) => void, options: UseSpinOptions = {}) {
  const rotationRef = useRef(0)
  const spinningRef = useRef(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const onTickRef = useRef(options.onTick)
  onTickRef.current = options.onTick

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
        const progress = Math.min(elapsed / SPIN_DURATION_MS, 1)
        const current = start + (final - start) * easeOutQuint(progress)
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
  }, [entryCount, draw])

  return { spin, isSpinning, rotation: rotationRef }
}
