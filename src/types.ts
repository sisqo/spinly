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
  position?: number
}

export interface SpinlySettings {
  themeId: string
  customColors: string[] | null
  backgroundImage: string | null
  centerLogo: string | null
  muted: boolean
  title: string
  spinDurationMs: number
  labelFontScale: number
  hideBranding: boolean
  quizShowMode: boolean
}

export type QuizShowPhase = 'elimination' | 'finalists' | 'results'

export interface QuizShowPlacement {
  id: string
  name: string
  image?: string
  position: number
}

export interface QuizShowRun {
  active: boolean
  phase: QuizShowPhase
  placements: QuizShowPlacement[]
}

export const DEFAULT_QUIZ_SHOW_RUN: QuizShowRun = {
  active: false,
  phase: 'elimination',
  placements: [],
}

export interface SpinlyState {
  entries: Entry[]
  settings: SpinlySettings
  history: WinnerRecord[]
  removedEntries: Entry[]
  quizShowRun: QuizShowRun
}

export const DEFAULT_SETTINGS: SpinlySettings = {
  themeId: 'classic',
  customColors: null,
  backgroundImage: null,
  centerLogo: null,
  muted: false,
  title: '',
  spinDurationMs: 6500,
  labelFontScale: 1,
  hideBranding: false,
  quizShowMode: false,
}
