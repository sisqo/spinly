import { useState } from 'react'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
  disabled?: boolean
}

export default function ToggleSwitch({ checked, onChange, label, id, disabled = false }: ToggleSwitchProps) {
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  return (
    <label htmlFor={id} className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full border border-neutral-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? 'bg-white' : 'bg-neutral-800'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full ${checked ? 'bg-neutral-900' : 'bg-neutral-400'} ${
            prefersReducedMotion ? '' : 'transition-transform ease-out'
          } ${checked ? 'translate-x-[1.375rem]' : 'translate-x-0.5'}`}
        />
      </button>
      <span className="text-sm font-medium text-white">{label}</span>
    </label>
  )
}
