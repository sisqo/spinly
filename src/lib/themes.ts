import type { SpinlySettings } from '../types'

export interface ThemeDef {
  id: string
  name: string
  colors: string[]
  background: string
  pointerColor: string
  labelColor: string
}

export const THEMES: ThemeDef[] = [
  {
    id: 'classic',
    name: 'Classic',
    colors: ['#f43f5e', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#f97316', '#14b8a6'],
    background: '#0a0a0a',
    pointerColor: '#ffffff',
    labelColor: '#ffffff',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#f97316', '#fb7185', '#f472b6', '#c026d3', '#a855f7', '#facc15', '#ef4444'],
    background: '#1a0b2e',
    pointerColor: '#fde68a',
    labelColor: '#ffffff',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0ea5e9', '#06b6d4', '#14b8a6', '#0891b2', '#2563eb', '#38bdf8', '#4ade80'],
    background: '#031f2e',
    pointerColor: '#e0f2fe',
    labelColor: '#ffffff',
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: ['#ff00ff', '#00ffff', '#39ff14', '#ff073a', '#fef001', '#ff6ec7'],
    background: '#000000',
    pointerColor: '#39ff14',
    labelColor: '#000000',
  },
  {
    id: 'pastel',
    name: 'Pastel',
    colors: ['#fbcfe8', '#bfdbfe', '#bbf7d0', '#fde68a', '#e9d5ff', '#fecaca', '#c7d2fe'],
    background: '#18181b',
    pointerColor: '#ffffff',
    labelColor: '#000000',
  },
]

export function resolveActiveColors(settings: SpinlySettings): string[] {
  if (Array.isArray(settings.customColors) && settings.customColors.length > 0) {
    return settings.customColors
  }
  const theme = THEMES.find((t) => t.id === settings.themeId)
  return (theme ?? THEMES[0]).colors
}
