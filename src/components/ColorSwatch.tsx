interface ColorSwatchProps {
  color: string
  onChange: (hex: string) => void
  label: string
  onRemove?: () => void
  removeLabel?: string
}

export default function ColorSwatch({ color, onChange, label, onRemove, removeLabel }: ColorSwatchProps) {
  return (
    <div className="group relative h-10 w-10">
      <div
        className="relative h-10 w-10 overflow-hidden rounded-lg border border-neutral-500 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-white"
        style={{ backgroundColor: color }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove ${label}`}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-xs text-white opacity-60 transition-opacity hover:bg-red-500 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white group-hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  )
}
