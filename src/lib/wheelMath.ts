const TWO_PI = Math.PI * 2

// The pointer is fixed at the right of the wheel (3 o'clock) — canvas angle 0,
// the positive x-axis. This is deliberate: a winning segment's label is drawn
// along its own local x-axis, so when that segment lands under the pointer
// its rotation matches world angle 0 and the text renders upright/horizontal
// instead of sideways (which top/bottom placement would cause).
export const POINTER_ANGLE = 0

export function mod2pi(angle: number): number {
  return ((angle % TWO_PI) + TWO_PI) % TWO_PI
}

export function cryptoRandom01(): number {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] / 4294967296 // 2^32, half-open [0, 1)
}

// Uniform pick via rejection sampling — avoids the modulo-bias a naive
// `cryptoRandomInt % n` would introduce.
export function pickWinnerIndex(n: number): number {
  if (n <= 0) throw new Error('pickWinnerIndex: no entries to pick from')
  if (n === 1) return 0
  const maxUint32 = 0xffffffff
  const limit = maxUint32 - (maxUint32 % n)
  const arr = new Uint32Array(1)
  let x: number
  do {
    crypto.getRandomValues(arr)
    x = arr[0]
  } while (x >= limit)
  return x % n
}

export function segmentAtPointer(rotation: number, n: number): number {
  if (n <= 0) return -1
  const segmentAngle = TWO_PI / n
  const localAngle = mod2pi(POINTER_ANGLE - rotation)
  return Math.min(n - 1, Math.floor(localAngle / segmentAngle))
}

// Rotation is tracked as an ever-increasing value (never reset mod 2*PI) so
// the wheel always spins forward, never snaps backward between spins.
export function computeFinalRotation(
  currentRotation: number,
  winnerIndex: number,
  n: number,
  extraTurns = 8,
): number {
  const segmentAngle = TWO_PI / n
  // Land within the middle 70% of the segment, never near a boundary.
  const jitter = (cryptoRandom01() - 0.5) * segmentAngle * 0.7
  const targetLocalAngle = mod2pi((winnerIndex + 0.5) * segmentAngle + jitter)
  const targetRotationMod = mod2pi(POINTER_ANGLE - targetLocalAngle)
  const currentMod = mod2pi(currentRotation)
  const delta = mod2pi(targetRotationMod - currentMod)
  return currentRotation + delta + extraTurns * TWO_PI
}

// Cubic-bezier timing function (same math as CSS's cubic-bezier()): P0=(0,0)
// and P3=(1,1) are fixed, P1/P2 are the handles. Solved via bisection since
// the curve isn't directly invertible in closed form.
function cubicBezier(t: number, x1: number, y1: number, x2: number, y2: number): number {
  const bezierComponent = (u: number, a: number, b: number) =>
    3 * (1 - u) ** 2 * u * a + 3 * (1 - u) * u ** 2 * b + u ** 3
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (bezierComponent(mid, x1, x2) < t) lo = mid
    else hi = mid
  }
  return bezierComponent((lo + hi) / 2, y1, y2)
}

// Spin easing: starts slow, accelerates, then decelerates gently over a long
// final stretch — more realistic and dramatic than a plain ease-out.
export function spinEasing(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1)
  return cubicBezier(clamped, 0.17, 0.02, 0.06, 1)
}
