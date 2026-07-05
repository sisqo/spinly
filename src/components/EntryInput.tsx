import { useState } from 'react'

interface EntryInputProps {
  onAdd: (names: string[]) => void
  disabled?: boolean
}

export default function EntryInput({ onAdd, disabled = false }: EntryInputProps) {
  const [text, setText] = useState('')

  const handleAdd = () => {
    const names = text.split('\n')
    onAdd(names)
    setText('')
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="One name per line"
        rows={8}
        disabled={disabled}
        className="w-full rounded-lg bg-neutral-800 text-white p-3 resize-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="self-start rounded-lg bg-white px-4 py-2 font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add names
      </button>
    </div>
  )
}
