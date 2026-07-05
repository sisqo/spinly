# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Spinly is a free, client-side spinning-wheel name picker (giveaways, raffles, classroom randomizers). Everything runs in the browser — no backend, no accounts; state persists to `localStorage` only. Deployed at https://spinly.sisqo.dev (Vercel project `spinly`, GitHub repo `sisqo/spinly`, auto-deploys on push to `main`).

`PRODUCT.md` and `DESIGN.md` at the repo root capture the product strategy and visual design system (register, personality, color/typography tokens, named rules) — read them before making product- or design-facing changes; this file stays focused on code architecture.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b (typecheck) && vite build
npm run lint     # eslint .
npm run preview  # serve the production build locally
```

There is no test suite (no `npm test`). Verify behavioral changes by running the dev server and exercising the feature in a real browser — this is a Canvas-rendered UI with animation timing, drag/click physics, and browser-API edge cases (autoplay policy, Fullscreen API support) that don't show up in a type-check or lint pass.

This sandbox has Node 18 available. `tailwindcss` is pinned to v3 and `vite` to v5 deliberately — Tailwind v4's native oxide bindings and newer Vite majors require a newer Node than this environment has. Don't bump either across a major version without checking the Node constraint first.

## Architecture

**Stack**: Vite + React 18 + TypeScript (strict) + Tailwind v3. No router, no state library — a single custom hook is the entire data layer.

### State: `useSpinlyStore` (`src/hooks/useSpinlyStore.ts`)

One hook holds all app state (`entries`, `settings`, `history`, `removedEntries`) and exposes every mutator (`addEntries`, `removeEntry`, `shuffleEntries`, `updateSettings`, etc.). It debounces writes to `localStorage` (400ms) so dragging a slider or typing doesn't serialize the whole state — including any embedded avatar photos — on every keystroke. `App.tsx` is the only consumer; it wires this store's data and callbacks into every other component. On first load with no saved state, entries default to `createSampleEntries()` (`src/lib/sampleEntries.ts`), which embeds a handful of avatar photos as base64 data URLs directly in source.

### Wheel math and rendering are deliberately separate (`src/lib/wheelMath.ts` vs `src/lib/drawWheel.ts`)

`wheelMath.ts` has no DOM/Canvas dependency — it's pure rotation/probability math, which is what makes a few of its choices safe to rely on:
- `pickWinnerIndex` uses `crypto.getRandomValues` with rejection sampling (not `Math.random() % n`) to avoid modulo bias.
- Rotation is tracked as an ever-increasing radian value, never reduced mod 2π — the wheel always spins forward, never snaps backward between spins.
- `POINTER_ANGLE = 0` (3 o'clock). This is load-bearing for label orientation: each segment's label is drawn along that segment's own local x-axis, so a segment lands upright/horizontal exactly when it's under the pointer. Moving the pointer to top/bottom would make labels render sideways at the moment they matter most.
- `spinEasing` is a hand-rolled cubic-bezier (solved via bisection, same curve shape as CSS `cubic-bezier()`) tuned for slow-start/accelerate/long-decelerate — not a stock easing function.

`drawWheel.ts` is a single imperative function that redraws the entire canvas every frame from scratch (rotation, colors, avatars, labels, pointer, center logo) — there's no incremental/diffed rendering. Avatar circle size is capped (`MAX_AVATAR_RADIUS_FRACTION`) independent of the geometric tangent-circle formula, specifically so a handful of entries doesn't blow the avatar up to the point that no room is left for the label; label font size is then computed by measuring each name once via `ctx.measureText` and scaling to exactly fill the remaining width, rather than guessing a character-width ratio. Center-label clearance (`logoRadius`) is reserved unconditionally, whether or not a center logo image is actually set, so labels don't jump inward the moment a logo gets added or removed.

### Images: two different pipelines, two different formats (`src/lib/imageProcessing.ts`)

`compressImageFile` (general uploads — background image, center logo) downsizes to `maxDimension` and re-encodes as JPEG (unless the source is already PNG) for size. `cropToSquare` (entry avatars specifically) always outputs PNG, because avatars are clipped to a circle at draw time and need alpha transparency in the corners. Loaded images are cached as `HTMLImageElement` in `WheelCanvas` (keyed by data-URL string) so avatars aren't re-decoded every frame.

### Theming (`src/lib/themes.ts`)

A `ThemeDef` bundles `colors`, `background`, `pointerColor`, and `labelColor` together — label color is picked per-theme for contrast (white on the dark themes, black on Neon/Pastel) rather than being a fixed value. `resolveActiveColors` lets user-customized segment colors override a theme's palette while the theme's other properties (background, pointer, label color) still come from `settings.themeId` regardless — customizing colors doesn't fork the whole theme.

### Fullscreen (`src/hooks/useFullscreen.ts`)

The app's own presentation layout (hide sidebar/footer, expand the wheel) is intentionally decoupled from the browser's native Fullscreen API. iOS Safari (and in-app webviews) never implement `requestFullscreen()` for non-`<video>` elements, so driving the layout purely off `document.fullscreenElement` left the button doing nothing on those platforms. The hook now always toggles its own `isPresenting` state and calls the native API opportunistically where it's supported.

### Entries panel vs. Settings drawer — two separate surfaces, not one sidebar

The old single sidebar (accordion of "General"/"Graphic") is gone. `App.tsx` now renders two independent things beside the wheel:
- An always-visible **entries panel** (`EntryInput`/`AddFromImagesButton`/`EntryToolbar`/`EntryList`/`HistoryPanel`) in the same column the old sidebar used to occupy — this is content (the names), not configuration, and stays reachable at all times.
- A **Settings drawer** (`SettingsDrawer.tsx` + `SettingsPanel.tsx`) for actual configuration (title, duration, branding, font size, theme, colors, background, logo). `SettingsDrawer` is a pure shell (positioning, open/close, focus management); `SettingsPanel` is the content. It's a `position: fixed` overlay toggled by a header icon, deliberately **not** reserved as extra layout padding — it overlaps whatever's underneath (by design, so opening/closing it never reflows the wheel/entries columns) and has **no dimming backdrop**, so the wheel keeps redrawing live while settings are being adjusted. Below the `md` breakpoint it renders as a near-full-screen bottom sheet instead of a right-side panel. `isSettingsOpen` always starts `false` on every load, on every breakpoint — it's ephemeral UI state, never persisted.

`SettingsDrawer` owns focus management on its own mount/unmount lifecycle (it literally returns `null` when closed, so a `useEffect` keyed on `open` — not `[]` — is what makes it refire every time the panel toggles): opening moves focus to its Close button and remembers whatever was focused before; closing restores focus there. Escape closing the drawer is coordinated centrally through `useKeyboardShortcuts`, not a second local listener — see below.

### `useArmedConfirm` (`src/hooks/useArmedConfirm.ts`) — the one confirm pattern, shared

Destructive actions (`EntryToolbar`'s "Clear all", `SettingsPanel`'s "Reset to defaults") never use `window.confirm` or a modal — they use one shared arm-then-confirm hook instead: first activation flips the button into an armed state (danger styling, "Confirm ...?" label) for a few seconds; a second activation within that window actually fires; otherwise it silently reverts. The hook also exposes `pauseAutoDisarm`/`resumeAutoDisarm` (wired to hover/focus) so the window doesn't collapse on someone who's still reading it — mirrors the same reasoning as the removed-entry toast's pause-on-hover in `App.tsx`.

### Everything else lives in `App.tsx`

`App.tsx` is the orchestrator: it owns the winner/spin/intro-screen state machine, wires `useSpin` (spin animation + promise-based winner resolution), `useSpinAudio` (Web Audio ticks/fanfare — must be primed synchronously inside a user-gesture handler, before any `await`, or Safari's autoplay policy silently drops it), and `useKeyboardShortcuts`. That hook's shortcuts (Space/Enter/F/M) are ignored while an input is focused, but **Escape is checked first, before that guard** — it has to close the settings panel even when focus is inside one of its own text fields, which a naive single early-return would silently swallow. Escape closes settings if `isSettingsOpen`, otherwise exits fullscreen — one hook arbitrates both meanings rather than two independent listeners racing each other. Components under `src/components/` are otherwise presentational and receive all data/callbacks as props — there's no context provider anywhere in the tree.

### A Chromium touch-drag quirk worth knowing about (`SettingsPanel.tsx`'s font-size slider)

Chromium's native `<input type="range">` abandons its own touch-drag tracking mid-gesture once the touch strays far enough perpendicular to the track (trivial to trigger with a real finger on a thin slider) — reproduces even on a bare range input with no Spinly markup/CSS involved, so it isn't a local layout bug. Mouse, keyboard, and click are unaffected. The fix takes over value computation from the pointer's `clientX` (with `setPointerCapture`) for touch pointers specifically, bypassing the native drag logic entirely while leaving every other input method on the native path. If a future slider exhibits "works on click, not on drag" on touch devices, this is almost certainly the same bug.

### Code style

No comments explaining *what* code does — names should carry that. Comments are reserved for non-obvious *why* (e.g. the pointer-angle/label-orientation coupling above, or a browser-quirk workaround).
