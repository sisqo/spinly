import type { Entry } from '../types'

interface DrawWheelOptions {
  layout: WheelLayout
  entries: Entry[]
  rotation: number
  colors: string[]
  pointerColor: string
  labelColor: string
  size: number
  pixelRatio?: number
  centerImage?: HTMLImageElement
  avatarImages?: Map<string, HTMLImageElement>
}

function fitLabel(ctx: CanvasRenderingContext2D, name: string, maxWidth: number): string {
  if (maxWidth <= 0) return ''
  if (ctx.measureText(name).width <= maxWidth) return name
  let label = name
  while (label.length > 1 && ctx.measureText(`${label}…`).width > maxWidth) {
    label = label.slice(0, -1)
  }
  return `${label}…`
}

const MIN_AVATAR_RADIUS_PX = 10
const MAX_AVATAR_RADIUS_FRACTION = 0.22

interface WheelLabelVariant {
  fontSize: number
  label: string
}

interface WheelEntryLayout {
  start: number
  end: number
  noAvatar: WheelLabelVariant
  withAvatar: WheelLabelVariant | null
}

export interface WheelLayout {
  cx: number
  cy: number
  radius: number
  logoRadius: number
  segmentAngle: number
  avatarRadius: number
  avatarCenterR: number
  textXNoAvatar: number
  textXWithAvatar: number
  entries: WheelEntryLayout[]
}

interface ComputeWheelLayoutOptions {
  entries: Entry[]
  size: number
  labelFontScale?: number
}

// measureText's result depends only on the resolved font and the string —
// not on canvas backing-store size, DPR, or the current transform — so a
// detached, never-drawn-to canvas measures identically to the on-screen one.
let measureCtx: CanvasRenderingContext2D | null | undefined

function getMeasureCtx(): CanvasRenderingContext2D | null {
  if (measureCtx === undefined) {
    measureCtx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null
  }
  return measureCtx
}

export function computeWheelLayout(opts: ComputeWheelLayoutOptions): WheelLayout | null {
  const { entries, size, labelFontScale = 1 } = opts
  const ctx = getMeasureCtx()
  if (!ctx || size <= 0) return null

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 4
  // Always reserve this hub space for label clearance, whether or not a
  // center logo image is actually set, so text never crowds the middle.
  const logoRadius = Math.max(20, radius * 0.2)
  const n = entries.length

  if (n === 0) {
    return {
      cx,
      cy,
      radius,
      logoRadius,
      segmentAngle: 0,
      avatarRadius: 0,
      avatarCenterR: 0,
      textXNoAvatar: 0,
      textXWithAvatar: 0,
      entries: [],
    }
  }

  const segmentAngle = (Math.PI * 2) / n
  // Largest circle inscribed in the wedge, tangent to the outer rim and
  // both straight edges — sits right at the wide end of the slice.
  const halfAngle = segmentAngle / 2
  const sinHalf = Math.sin(halfAngle)
  const maxAvatarRadius = (radius * sinHalf) / (1 + sinHalf)
  // Cap the avatar so it never eats into the label space when there are
  // only a few, wide segments (the tangent-circle formula alone would
  // grow it toward radius/2 as segment count drops).
  const avatarRadius = Math.min(maxAvatarRadius * 0.96, radius * MAX_AVATAR_RADIUS_FRACTION)
  const avatarRadiusOk = avatarRadius >= MIN_AVATAR_RADIUS_PX
  const avatarCenterR = radius - avatarRadius - 2

  const textXNoAvatar = radius - 12
  const textXWithAvatar = avatarCenterR - avatarRadius - 8
  const innerMargin = logoRadius + 10
  const availableWidthNoAvatar = Math.max(0, textXNoAvatar - innerMargin)
  const availableWidthWithAvatar = Math.max(0, textXWithAvatar - innerMargin)
  const angleCapFontSize = 2 * radius * 0.4 * sinHalf
  const styleCapFontSizeNoAvatar = radius * 0.2
  const styleCapFontSizeWithAvatar = avatarRadius * 0.8

  // Measure the name at a reference size, then scale to the exact size
  // that fills the available width — precise per-name fit instead of a
  // guessed character-width ratio, so short names render large and long
  // names shrink gracefully before ever needing to truncate.
  const fitVariant = (name: string, availableWidth: number, styleCapFontSize: number): WheelLabelVariant => {
    ctx.font = '100px sans-serif'
    const nameWidthAt100 = ctx.measureText(name).width
    const fitFontSize = nameWidthAt100 > 0 ? (availableWidth / nameWidthAt100) * 100 : 0
    const fontSize = Math.max(8, Math.min(fitFontSize, angleCapFontSize, styleCapFontSize) * labelFontScale)
    ctx.font = `${fontSize}px sans-serif`
    const label = fitLabel(ctx, name, availableWidth)
    return { fontSize, label }
  }

  const entryLayouts: WheelEntryLayout[] = entries.map((entry, i) => {
    const start = i * segmentAngle
    const end = start + segmentAngle
    const noAvatar = fitVariant(entry.name, availableWidthNoAvatar, styleCapFontSizeNoAvatar)
    const withAvatar =
      entry.image && avatarRadiusOk ? fitVariant(entry.name, availableWidthWithAvatar, styleCapFontSizeWithAvatar) : null
    return { start, end, noAvatar, withAvatar }
  })

  return {
    cx,
    cy,
    radius,
    logoRadius,
    segmentAngle,
    avatarRadius,
    avatarCenterR,
    textXNoAvatar,
    textXWithAvatar,
    entries: entryLayouts,
  }
}

export function drawWheel(ctx: CanvasRenderingContext2D, opts: DrawWheelOptions) {
  const { layout, entries, rotation, colors, pointerColor, labelColor, size, pixelRatio = 1, centerImage, avatarImages } = opts
  const { cx, cy, radius, logoRadius, segmentAngle, avatarRadius, avatarCenterR, textXNoAvatar, textXWithAvatar } = layout
  const n = layout.entries.length

  ctx.save()
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  ctx.clearRect(0, 0, size, size)

  if (n === 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#27272a'
    ctx.fill()
  } else {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    for (let i = 0; i < n; i++) {
      const entryLayout = layout.entries[i]
      const { start, end } = entryLayout

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, start, end)
      ctx.closePath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()

      ctx.save()
      ctx.rotate(start + segmentAngle / 2)

      const avatarImg = entries[i].image ? avatarImages?.get(entries[i].image!) : undefined
      const activeVariant = avatarImg && entryLayout.withAvatar ? entryLayout.withAvatar : null
      const showAvatar = activeVariant !== null
      const variant = activeVariant ?? entryLayout.noAvatar
      const textX = showAvatar ? textXWithAvatar : textXNoAvatar

      if (showAvatar && avatarImg) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(avatarCenterR, 0, avatarRadius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(avatarImg, avatarCenterR - avatarRadius, -avatarRadius, avatarRadius * 2, avatarRadius * 2)
        ctx.restore()
        ctx.beginPath()
        ctx.arc(avatarCenterR, 0, avatarRadius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = labelColor
      ctx.font = `${variant.fontSize}px sans-serif`
      ctx.fillText(variant.label, textX, 0)
      ctx.restore()
    }
    ctx.restore()
  }

  // Fixed pointer, right of the wheel — must match POINTER_ANGLE in wheelMath.ts.
  ctx.beginPath()
  ctx.moveTo(cx + radius + 4, cy - 14)
  ctx.lineTo(cx + radius + 4, cy + 14)
  ctx.lineTo(cx + radius - 20, cy)
  ctx.closePath()
  ctx.fillStyle = pointerColor
  ctx.fill()

  if (centerImage) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(centerImage, cx - logoRadius, cy - logoRadius, logoRadius * 2, logoRadius * 2)
    ctx.restore()
    ctx.beginPath()
    ctx.arc(cx, cy, logoRadius, 0, Math.PI * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.restore()
}
