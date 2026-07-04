export function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const arr = new Uint32Array(4)
  crypto.getRandomValues(arr)
  return Array.from(arr, (n) => n.toString(16).padStart(8, '0')).join('-')
}
