import type { WinnerRecord } from '../types'

interface HistoryPanelProps {
  history: WinnerRecord[]
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return <p className="text-sm text-neutral-500">No spins yet</p>
  }

  return (
    <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
      {history.map((record, index) => (
        <li
          key={`${record.id}-${record.timestamp}-${index}`}
          className="flex items-center gap-3 rounded-lg bg-neutral-900 px-3 py-2"
        >
          {record.image ? (
            <img src={record.image} alt="" className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-semibold uppercase">
              {record.name.charAt(0) || '?'}
            </div>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{record.name}</span>
            <span className="text-xs text-neutral-500">{formatTimestamp(record.timestamp)}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
