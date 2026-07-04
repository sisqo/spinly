export interface CompressImageOptions {
  maxDimension?: number
  quality?: number
}

const DEFAULT_MAX_DIMENSION = 512
const DEFAULT_QUALITY = 0.82
const DEFAULT_CROP_SIZE = 256

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('imageProcessing: failed to load image'))
    img.src = src
  })
}

function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('imageProcessing: canvas 2d context unavailable')
  return ctx
}

export async function compressImageFile(
  file: File,
  opts: CompressImageOptions = {},
): Promise<string> {
  if (!(file instanceof Blob) || file.size === 0) {
    throw new Error('compressImageFile: file is empty or invalid')
  }

  const maxDimension = opts.maxDimension ?? DEFAULT_MAX_DIMENSION
  const quality = opts.quality ?? DEFAULT_QUALITY
  if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
    throw new Error('compressImageFile: maxDimension must be a positive number')
  }
  if (!Number.isFinite(quality) || quality <= 0 || quality > 1) {
    throw new Error('compressImageFile: quality must be between 0 and 1')
  }

  const objectUrl = URL.createObjectURL(file)
  let img: HTMLImageElement
  try {
    img = await loadImage(objectUrl)
  } catch {
    throw new Error('compressImageFile: could not decode image file')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  const { naturalWidth: width, naturalHeight: height } = img
  if (!width || !height) {
    throw new Error('compressImageFile: image has no dimensions')
  }

  const scale = Math.min(1, maxDimension / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = getContext2D(canvas)
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
  return canvas.toDataURL(mimeType, quality)
}

export async function cropToSquare(dataUrl: string, size = DEFAULT_CROP_SIZE): Promise<string> {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
    throw new Error('cropToSquare: input must be an image data URL')
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('cropToSquare: size must be a positive number')
  }

  let img: HTMLImageElement
  try {
    img = await loadImage(dataUrl)
  } catch {
    throw new Error('cropToSquare: could not decode image data URL')
  }

  const { naturalWidth: width, naturalHeight: height } = img
  if (!width || !height) {
    throw new Error('cropToSquare: image has no dimensions')
  }

  const side = Math.min(width, height)
  const sx = (width - side) / 2
  const sy = (height - side) / 2

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = getContext2D(canvas)
  ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)

  return canvas.toDataURL('image/png')
}
