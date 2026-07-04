import type { Entry } from '../types'

interface DrawWheelOptions {
  entries: Entry[]
  rotation: number
  colors: string[]
  pointerColor: string
  size: number
  pixelRatio?: number
  centerImage?: HTMLImageElement
  avatarImages?: Map<string, HTMLImageElement>
  labelFontScale?: number
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
const MAX_AVATAR_RADIUS_FRACTION = 0.3

export function drawWheel(ctx: CanvasRenderingContext2D, opts: DrawWheelOptions) {
  const {
    entries,
    rotation,
    colors,
    pointerColor,
    size,
    pixelRatio = 1,
    centerImage,
    avatarImages,
    labelFontScale = 1,
  } = opts
  const n = entries.length
  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 4

  const logoRadius = centerImage ? Math.max(20, radius * 0.2) : 0

  ctx.save()
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  ctx.clearRect(0, 0, size, size)

  if (n === 0) {
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#27272a'
    ctx.fill()
  } else {
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

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    for (let i = 0; i < n; i++) {
      const start = i * segmentAngle
      const end = start + segmentAngle

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, start, end)
      ctx.closePath()
      ctx.fillStyle = colors[i % colors.length]
      ctx.fill()

      ctx.save()
      ctx.rotate(start + segmentAngle / 2)

      const avatarImg = entries[i].image ? avatarImages?.get(entries[i].image!) : undefined
      const showAvatar = !!avatarImg && avatarRadius >= MIN_AVATAR_RADIUS_PX
      let textX = radius - 12

      if (showAvatar && avatarImg) {
        const avatarCenterR = radius - avatarRadius - 2
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
        textX = avatarCenterR - avatarRadius - 8
      }

      const innerMargin = centerImage ? logoRadius + 10 : Math.max(8, radius * 0.04)
      const availableWidth = Math.max(0, textX - innerMargin)

      // Measure the name at a reference size, then scale to the exact size
      // that fills the available width — precise per-name fit instead of a
      // guessed character-width ratio, so short names render large and long
      // names shrink gracefully before ever needing to truncate.
      ctx.font = '100px sans-serif'
      const nameWidthAt100 = ctx.measureText(entries[i].name).width
      const fitFontSize = nameWidthAt100 > 0 ? (availableWidth / nameWidthAt100) * 100 : 0
      const angleCapFontSize = 2 * radius * 0.4 * sinHalf
      const styleCapFontSize = showAvatar ? avatarRadius * 0.8 : radius * 0.2
      const fontSize = Math.max(8, Math.min(fitFontSize, angleCapFontSize, styleCapFontSize) * labelFontScale)

      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.font = `${fontSize}px sans-serif`
      const label = fitLabel(ctx, entries[i].name, availableWidth)
      ctx.fillText(label, textX, 0)
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
