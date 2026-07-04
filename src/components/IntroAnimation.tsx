import { useCallback, useEffect, useMemo, useRef } from 'react'

interface IntroAnimationProps {
  onDone: () => void
}

const WHEEL_COLORS = ['#f43f5e', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#f97316', '#14b8a6']
const LETTERS = ['S', 'p', 'i', 'n', 'l', 'y']

export default function IntroAnimation({ onDone }: IntroAnimationProps) {
  const doneRef = useRef(false)

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }, [onDone])

  useEffect(() => {
    const timeout = window.setTimeout(finish, prefersReducedMotion ? 700 : 2200)
    return () => window.clearTimeout(timeout)
  }, [prefersReducedMotion, finish])

  const wheelGradient = useMemo(() => {
    const step = 360 / WHEEL_COLORS.length
    const stops = WHEEL_COLORS.map((color, i) => `${color} ${i * step}deg ${(i + 1) * step}deg`).join(', ')
    return `conic-gradient(${stops})`
  }, [])

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={finish}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') finish()
      }}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-8 bg-neutral-950"
      aria-label="Spinly intro animation, click to skip"
    >
      <style>{`
        @keyframes spinly-intro-wheel-in {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(300deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        @keyframes spinly-intro-pointer-drop {
          from { transform: translate(-50%, -8px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes spinly-intro-letter-in {
          from { transform: translateY(14px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spinly-intro-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spinly-intro-wheel {
          animation: ${prefersReducedMotion ? 'none' : 'spinly-intro-wheel-in 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) both'};
        }
        .spinly-intro-pointer {
          animation: ${prefersReducedMotion ? 'none' : 'spinly-intro-pointer-drop 0.4s ease-out 1.1s both'};
        }
        .spinly-intro-letter {
          display: inline-block;
          animation: ${prefersReducedMotion ? 'none' : 'spinly-intro-letter-in 0.5s ease-out both'};
        }
        .spinly-intro-skip {
          animation: ${prefersReducedMotion ? 'none' : 'spinly-intro-fade-in 0.6s ease-out 0.3s both'};
        }
      `}</style>

      <div className="relative flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36">
        <div
          className="spinly-intro-pointer absolute -top-2 left-1/2 z-10 h-0 w-0 -translate-x-1/2 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-white"
          style={{ opacity: prefersReducedMotion ? 1 : undefined }}
        />
        <div
          className="spinly-intro-wheel h-full w-full rounded-full border-4 border-white/80 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          style={{ background: wheelGradient, opacity: prefersReducedMotion ? 1 : undefined }}
        />
        <div className="absolute h-4 w-4 rounded-full bg-white shadow" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className="spinly-intro-letter"
            style={{
              animationDelay: prefersReducedMotion ? undefined : `${0.7 + i * 0.07}s`,
              opacity: prefersReducedMotion ? 1 : undefined,
            }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          finish()
        }}
        className="spinly-intro-skip absolute bottom-8 right-8 rounded-full border border-white/20 px-4 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
        style={{ opacity: prefersReducedMotion ? 1 : undefined }}
      >
        Skip
      </button>
    </div>
  )
}
