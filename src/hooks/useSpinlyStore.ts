import { useCallback, useEffect, useState } from 'react'
import type { Entry, SpinlyState, WinnerRecord } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { makeId } from '../lib/id'
import { createSampleEntries } from '../lib/sampleEntries'
import { cryptoRandom01 } from '../lib/wheelMath'

const STORAGE_KEY = 'spinly-state-v1'

function loadState(): SpinlyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { entries: createSampleEntries(), settings: DEFAULT_SETTINGS, history: [], removedEntries: [] }
    const parsed = JSON.parse(raw)
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      history: Array.isArray(parsed.history) ? parsed.history : [],
      removedEntries: Array.isArray(parsed.removedEntries) ? parsed.removedEntries : [],
    }
  } catch {
    return { entries: [], settings: DEFAULT_SETTINGS, history: [], removedEntries: [] }
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
      return {
        ...s,
        entries: [...s.entries, last],
        removedEntries: s.removedEntries.slice(0, -1),
      }
    })
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
    setState({ entries: [], settings: DEFAULT_SETTINGS, history: [], removedEntries: [] })
  }, [])

  return {
    entries: state.entries,
    settings: state.settings,
    history: state.history,
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
  }
}
