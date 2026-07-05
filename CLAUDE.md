# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Spinly is a free, client-side spinning-wheel name picker (giveaways, raffles, classroom randomizers). Everything runs in the browser — no backend, no accounts; state persists to `localStorage` only. Deployed at https://spinly.sisqo.dev (Vercel project `spinly`, GitHub repo `sisqo/spinly`, auto-deploys on push to `main`).

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

### Everything else lives in `App.tsx`

`App.tsx` is the orchestrator: it owns the winner/spin/intro-screen state machine, wires `useSpin` (spin animation + promise-based winner resolution), `useSpinAudio` (Web Audio ticks/fanfare — must be primed synchronously inside a user-gesture handler, before any `await`, or Safari's autoplay policy silently drops it), `useKeyboardShortcuts` (Space/Enter/F/M/Escape, ignored while an input is focused), and renders the sidebar's two collapsible sections ("General": entries/history; "Graphic": theme/background/logo/branding). Components under `src/components/` are otherwise presentational and receive all data/callbacks as props — there's no context provider anywhere in the tree.

### Code style

No comments explaining *what* code does — names should carry that. Comments are reserved for non-obvious *why* (e.g. the pointer-angle/label-orientation coupling above, or a browser-quirk workaround).
