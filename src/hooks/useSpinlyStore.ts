import { useCallback, useEffect, useState } from 'react'
import type { Entry, QuizShowPhase, QuizShowPlacement, SpinlyState, WinnerRecord } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_QUIZ_SHOW_RUN } from '../types'
import { makeId } from '../lib/id'
import { createSampleEntries } from '../lib/sampleEntries'
import { cryptoRandom01 } from '../lib/wheelMath'

const STORAGE_KEY = 'spinly-state-v1'
const VALID_QUIZ_SHOW_PHASES: QuizShowPhase[] = ['elimination', 'finalists', 'results']

function loadState(): SpinlyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        entries: createSampleEntries(),
        settings: DEFAULT_SETTINGS,
        history: [],
        removedEntries: [],
        quizShowRun: DEFAULT_QUIZ_SHOW_RUN,
      }
    }
    const parsed = JSON.parse(raw)
    const qsr = parsed.quizShowRun
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      removedEntries: Array.isArray(parsed.removedEntries) ? parsed.removedEntries : [],
      quizShowRun:
        qsr && typeof qsr === 'object'
          ? {
              active: !!qsr.active,
              phase: VALID_QUIZ_SHOW_PHASES.includes(qsr.phase) ? qsr.phase : 'elimination',
              placements: Array.isArray(qsr.placements) ? qsr.placements : [],
            }
          : DEFAULT_QUIZ_SHOW_RUN,
    }
  } catch {
    return {
      entries: [],
      settings: DEFAULT_SETTINGS,
      history: [],
      removedEntries: [],
      quizShowRun: DEFAULT_QUIZ_SHOW_RUN,
    }
  }
}

export function useSpinlyStore() {
  const [state, setState] = useState<SpinlyState>(loadState)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        setStorageError(null)
      } catch {
        setStorageError('Storage is full — try removing some photos or entries.')
      }
    }, 400)
    return () => window.clearTimeout(handle)
  }, [state])

  const addEntries = useCallback((names: string[]) => {
    const newEntries: Entry[] = names
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .map((name) => ({ id: makeId(), name }))
    if (newEntries.length === 0) return
    setState((s) => ({ ...s, entries: [...s.entries, ...newEntries] }))
  }, [])

  const addEntriesWithImages = useCallback((items: Array<{ name: string; image: string }>) => {
    if (items.length === 0) return
    const newEntries: Entry[] = items.map(({ name, image }) => ({ id: makeId(), name, image }))
    setState((s) => ({ ...s, entries: [...s.entries, ...newEntries] }))
  }, [])

  const updateEntry = useCallback((id: string, patch: Partial<Entry>) => {
    setState((s) => ({ ...s, entries: s.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  }, [])

  const removeEntry = useCallback((id: string) => {
    setState((s) => {
      const entry = s.entries.find((e) => e.id === id)
      if (!entry) return s
      return {
        ...s,
        entries: s.entries.filter((e) => e.id !== id),
        removedEntries: [...s.removedEntries, entry],
      }
    })
  }, [])

  const clearEntries = useCallback(() => {
    setState((s) => ({ ...s, entries: [] }))
  }, [])

  const restoreLastRemoved = useCallback(() => {
    setState((s) => {
      if (s.removedEntries.length === 0) return s
      const last = s.removedEntries[s.removedEntries.length - 1]
      const lastPlacement = s.quizShowRun.placements[s.quizShowRun.placements.length - 1]
      // Quiz Show Mode's podium placements are committed as one atomic step by
      // completeQuizShowRun (never exposed to the undo toast), so whenever this
      // matches, it's guaranteed to be an elimination-phase assignment.
      const isQuizUndo = s.quizShowRun.active && lastPlacement?.id === last.id
      const newEntries = [...s.entries, last]
      return {
        ...s,
        entries: newEntries,
        removedEntries: s.removedEntries.slice(0, -1),
        history: isQuizUndo && s.history[0]?.id === last.id ? s.history.slice(1) : s.history,
        quizShowRun: isQuizUndo
          ? {
              ...s.quizShowRun,
              phase: newEntries.length === 3 ? 'finalists' : 'elimination',
              placements: s.quizShowRun.placements.slice(0, -1),
            }
          : s.quizShowRun,
      }
    })
  }, [])

  const assignRankAndRemove = useCallback((entryId: string, position: number) => {
    setState((s) => {
      const entry = s.entries.find((e) => e.id === entryId)
      if (!entry) return s
      const remaining = s.entries.filter((e) => e.id !== entryId)
      const placement: QuizShowPlacement = { id: entry.id, name: entry.name, image: entry.image, position }
      const historyRecord: WinnerRecord = {
        id: entry.id,
        name: entry.name,
        image: entry.image,
        timestamp: Date.now(),
        position,
      }
      return {
        ...s,
        entries: remaining,
        removedEntries: [...s.removedEntries, entry],
        history: [historyRecord, ...s.history],
        quizShowRun: {
          active: true,
          phase: remaining.length === 3 ? 'finalists' : 'elimination',
          placements: [...s.quizShowRun.placements, placement],
        },
      }
    })
  }, [])

  const completeQuizShowRun = useCallback(
    (placements: [QuizShowPlacement, QuizShowPlacement, QuizShowPlacement]) => {
      setState((s) => {
        const ids = new Set(placements.map((p) => p.id))
        const finalistEntries = s.entries.filter((e) => ids.has(e.id))
        const remaining = s.entries.filter((e) => !ids.has(e.id))
        const now = Date.now()
        const historyRecords = [...placements]
          .sort((a, b) => a.position - b.position)
          .map((p) => ({ id: p.id, name: p.name, image: p.image, timestamp: now, position: p.position }))
        return {
          ...s,
          entries: remaining,
          removedEntries: [...s.removedEntries, ...finalistEntries],
          history: [...historyRecords, ...s.history],
          quizShowRun: {
            active: true,
            phase: 'results',
            placements: [...s.quizShowRun.placements, ...placements],
          },
        }
      })
    },
    [],
  )

  const restoreAllRemoved = useCallback(() => {
    setState((s) => {
      const runCount = s.quizShowRun.placements.length
      if (runCount === 0) return { ...s, quizShowRun: DEFAULT_QUIZ_SHOW_RUN }
      const restored = s.removedEntries.slice(-runCount)
      const keep = s.removedEntries.slice(0, -runCount)
      return {
        ...s,
        entries: [...s.entries, ...restored],
        removedEntries: keep,
        quizShowRun: DEFAULT_QUIZ_SHOW_RUN,
      }
    })
  }, [])

  const endQuizShowRun = useCallback(() => {
    setState((s) => ({ ...s, quizShowRun: DEFAULT_QUIZ_SHOW_RUN }))
  }, [])

  const setEntries = useCallback((entries: Entry[]) => {
    setState((s) => ({ ...s, entries }))
  }, [])

  const shuffleEntries = useCallback(() => {
    setState((s) => {
      const arr = [...s.entries]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(cryptoRandom01() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return { ...s, entries: arr }
    })
  }, [])

  const sortEntriesAZ = useCallback(() => {
    setState((s) => ({ ...s, entries: [...s.entries].sort((a, b) => a.name.localeCompare(b.name)) }))
  }, [])

  const updateSettings = useCallback((patch: Partial<SpinlyState['settings']>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const addHistoryRecord = useCallback((record: WinnerRecord) => {
    setState((s) => ({ ...s, history: [record, ...s.history] }))
  }, [])

  const resetAll = useCallback(() => {
    setState({
      entries: [],
      settings: DEFAULT_SETTINGS,
      history: [],
      removedEntries: [],
      quizShowRun: DEFAULT_QUIZ_SHOW_RUN,
    })
  }, [])

  return {
    entries: state.entries,
    settings: state.settings,
    history: state.history,
    quizShowRun: state.quizShowRun,
    storageError,
    addEntries,
    addEntriesWithImages,
    updateEntry,
    removeEntry,
    clearEntries,
    restoreLastRemoved,
    setEntries,
    shuffleEntries,
    sortEntriesAZ,
    updateSettings,
    addHistoryRecord,
    resetAll,
    assignRankAndRemove,
    completeQuizShowRun,
    restoreAllRemoved,
    endQuizShowRun,
  }
}
