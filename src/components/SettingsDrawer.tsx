import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

interface SettingsDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

const ANIMATION_MS = 250

export default function SettingsDrawer({ open, onClose, children }: SettingsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      closeButtonRef.current?.focus()
    } else {
      previouslyFocusedRef.current?.focus()
      previouslyFocusedRef.current = null
    }
  }, [open])

  if (!open) return null

  return (
    <aside
      aria-label="Settings"
      className="spinly-settings-drawer fixed inset-x-0 bottom-0 z-[45] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-neutral-800 bg-neutral-950 shadow-2xl md:inset-x-auto md:inset-y-0 md:bottom-auto md:right-0 md:top-0 md:h-dvh md:max-h-none md:w-96 md:rounded-none md:border-l md:border-t-0"
    >
      <style>{`
        @keyframes spinly-settings-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes spinly-settings-slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .spinly-settings-drawer {
          animation: spinly-settings-slide-up ${ANIMATION_MS}ms ease-out;
        }
        @media (min-width: 768px) {
          .spinly-settings-drawer {
            animation: spinly-settings-slide-in ${ANIMATION_MS}ms ease-out;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .spinly-settings-drawer {
            animation: none;
          }
        }
      `}</style>
      <div className="flex flex-shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3 md:px-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">Settings</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="rounded-full bg-neutral-800/80 p-2.5 hover:bg-neutral-700"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      {/* bg-neutral-950 above is opaque (unlike the transparent main sidebar), so the
          scroll-fade cover must stay pinned to that exact color, not the active theme's
          background the main sidebar feeds this same variable. Uses spinly-drawer-scroll,
          not spinly-sidebar-scroll: this panel scrolls at every breakpoint (mobile sheet
          and desktop panel alike), unlike the entries sidebar which only scrolls
          independently at md+ (the page itself scrolls below that). */}
      <div
        className="spinly-drawer-scroll flex-1 overflow-y-auto px-4 py-4 md:px-5"
        style={{ '--spinly-scroll-shadow': '#0a0a0a' } as React.CSSProperties}
      >
        {children}
      </div>
    </aside>
  )
}
