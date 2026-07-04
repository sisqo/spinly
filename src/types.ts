export interface Entry {
  id: string
  name: string
  image?: string
}

export interface WinnerRecord {
  id: string
  name: string
  image?: string
  timestamp: number
}

export interface SpinlySettings {
  themeId: string
  customColors: string[] | null
  backgroundImage: string | null
  centerLogo: string | null
  muted: boolean
  removeWinnerAfterSpin: boolean
  title: string
  spinDurationMs: number
  labelFontScale: number
}

export interface SpinlyState {
  entries: Entry[]
  settings: SpinlySettings
  history: WinnerRecord[]
  removedEntries: Entry[]
}

export const DEFAULT_SETTINGS: SpinlySettings = {
  themeId: 'classic',
  customColors: null,
  backgroundImage: null,
  centerLogo: null,
  muted: false,
  removeWinnerAfterSpin: false,
  title: '',
  spinDurationMs: 6500,
  labelFontScale: 1,
}
