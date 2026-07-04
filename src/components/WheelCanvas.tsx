import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Entry } from '../types'
import { drawWheel } from '../lib/drawWheel'
import { loadImage } from '../lib/imageProcessing'

export interface WheelCanvasHandle {
  draw: (rotation: number) => void
}

interface WheelCanvasProps {
  entries: Entry[]
  colors: string[]
  pointerColor: string
  centerImageUrl?: string | null
  labelFontScale?: number
  onActivate?: () => void
  disabled?: boolean
}

const WheelCanvas = forwardRef<WheelCanvasHandle, WheelCanvasProps>(function WheelCanvas(
  { entries, colors, pointerColor, centerImageUrl, labelFontScale = 1, onActivate, disabled = false },
  ref,
) {
  const containerRef = useRef<HTMLButtonElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const lastRotationRef = useRef(0)
  const centerImageElRef = useRef<HTMLImageElement | null>(null)
  const avatarCacheRef = useRef<Map<string, HTMLImageElement>>(new Map())
  const [size, setSize] = useState(0)
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entriesList) => {
      const { width, height } = entriesList[0].contentRect
      setSize(Math.max(0, Math.floor(Math.min(width, height))))
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const renderFrame = useCallback(
    (rotation: number) => {
      lastRotationRef.current = rotation
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx || size <= 0) return
      drawWheel(ctx, {
        entries,
        rotation,
        colors,
        pointerColor,
        size,
        pixelRatio: dpr,
        centerImage: centerImageElRef.current ?? undefined,
        avatarImages: avatarCacheRef.current,
        labelFontScale,
      })
    },
    [entries, colors, pointerColor, size, dpr, labelFontScale],
  )

  // Always call the latest renderFrame, even from an onload callback whose
  // effect closure ran before an unrelated prop (e.g. theme colors) changed.
  const renderFrameRef = useRef(renderFrame)
  renderFrameRef.current = renderFrame

  useImperativeHandle(ref, () => ({ draw: renderFrame }), [renderFrame])

  useEffect(() => {
    renderFrameRef.current(lastRotationRef.current)
  }, [size])

  useEffect(() => {
    if (!centerImageUrl) {
      centerImageElRef.current = null
      renderFrameRef.current(lastRotationRef.current)
      return
    }
    let cancelled = false
    loadImage(centerImageUrl)
      .then((img) => {
        if (cancelled) return
        centerImageElRef.current = img
        renderFrameRef.current(lastRotationRef.current)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [centerImageUrl])

  useEffect(() => {
    const cache = avatarCacheRef.current
    const wanted = new Set(entries.map((e) => e.image).filter((url): url is string => !!url))
    for (const key of Array.from(cache.keys())) {
      if (!wanted.has(key)) cache.delete(key)
    }
    let cancelled = false
    wanted.forEach((url) => {
      if (cache.has(url)) return
      loadImage(url)
        .then((img) => {
          if (cancelled) return
          cache.set(url, img)
          renderFrameRef.current(lastRotationRef.current)
        })
        .catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [entries])

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onActivate}
      disabled={disabled || !onActivate}
      aria-label="Spin the wheel"
      className="flex min-h-0 w-full min-w-0 flex-1 items-center justify-center disabled:cursor-not-allowed enabled:cursor-pointer"
    >
      <canvas ref={canvasRef} width={size * dpr} height={size * dpr} style={{ width: size, height: size }} />
    </button>
  )
})

export default WheelCanvas
