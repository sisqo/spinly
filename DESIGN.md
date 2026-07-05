---
name: Spinly
description: Free client-side spinning-wheel name picker for giveaways, raffles, and classrooms
colors:
  ink-base: "#0a0a0a"
  surface-sunken: "#171717"
  surface-control: "#262626"
  surface-control-hover: "#404040"
  border-subtle: "#525252"
  text-primary: "#ffffff"
  text-secondary: "#a3a3a3"
  text-tertiary: "#737373"
  invert-surface: "#ffffff"
  invert-ink: "#000000"
  accent-warning: "#fbbf24"
  accent-danger: "#f87171"
typography:
  title:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
    letterSpacing: "-0.025em"
  group-header:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "-0.025em"
  sub-label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  caption:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  control: "8px"
  pill: "9999px"
  modal: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.invert-surface}"
    textColor: "{colors.invert-ink}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-control}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-control-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
  icon-button-circular:
    backgroundColor: "{colors.surface-control}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "10px"
  input-field:
    backgroundColor: "{colors.surface-control}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  list-row:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
---

# Design System: Spinly

## 1. Overview

**Creative North Star: "The Backstage Console"**

Spinly's configuration surface is the stagehand's board, not the show. Everything in the sidebar — entries, theme, settings — exists to be set once, trusted, and forgotten the moment the wheel starts spinning. The spin and the winner reveal (confetti, fanfare, the amber-lit winner modal) are the one moment the system is allowed to be loud; the console that gets it there should be quiet, precise, and unmistakably a real tool rather than a toy.

Today the code delivers the "quiet" half of that brief almost by accident: the entire config surface is nearly monochrome (three neutral grays and white), which reads as restrained but currently lands closer to **undifferentiated** than **calm**. Every row, every button, every label uses the same visual weight — `bg-neutral-800` or `bg-neutral-900`, `rounded-lg`, `text-sm` — so nothing in the panel tells the eye what matters more than what else. There are exactly two accent colors in the entire chrome (`amber-400`, reserved for warnings and the winner-moment glow; `red-400`, reserved for destructive actions — the per-entry remove `✕` and "Clear all") and one soft shadow in the whole app (the winner modal's glow ring) — everywhere else is flat. That flatness is the right instinct pointed at the wrong target: it should express "calm console," not "every control is interchangeable."

This system explicitly rejects: childish/toy-like ornamentation (bounce, candy-color chrome), and a cluttered settings menu where every control sits at the same flat priority with no grouping. It should also stop reading as a generic gray SaaS admin panel — restraint is not the same as sameness.

**Key Characteristics:**
- Near-monochrome neutral scale (`neutral-900` → `neutral-400`) carries almost the entire UI; color is spent, not decorated with.
- Zero elevation at rest anywhere in the console; the one glow/shadow in the app is reserved for the winner modal.
- No custom typeface — system sans stack throughout, with only 4 sizes in active use (`text-2xl`, `text-sm`, `text-xs`, and one `text-xl`/`text-base` each).
- The multi-hue "wheel spectrum" (`src/lib/themes.ts`) is a separate, canvas-only palette — it must never leak into chrome (buttons, panels, labels), which is reserved for neutrals + the two accents (amber, red).

## 2. Colors

The palette is almost entirely achromatic on purpose — color is reserved for the wheel itself and for the two deliberate accents: amber for warning/celebration-adjacent moments, red for destructive-action-adjacent moments.

### Primary
- **Invert Surface** (`#ffffff` / `invert-surface`): the one "primary action" surface in the whole app — a white pill with black text (`invert-ink`, `#000000`) used for "Add names" and the winner modal's "Keep & spin again" button. Note this is literal `#000000`, not the `ink-base` used for the page background (`#0a0a0a`) — a small inconsistency worth resolving to one true black.

### Neutral
- **Ink Base** (`#0a0a0a`): default page background (`bg-neutral-950`).
- **Surface Sunken** (`#171717`): recessed rows — entry list items, history rows, unselected theme cards (`bg-neutral-900`).
- **Surface Control** (`#262626`): the workhorse token — inputs, secondary buttons, icon pills, textareas (`bg-neutral-800`). Used 16+ times; the single most load-bearing color in the system.
- **Surface Control Hover** (`#404040`): hover state for every `Surface Control` element (`bg-neutral-700`).
- **Border Subtle** (`#525252`): dashed placeholder borders (empty background/logo slots), unselected card borders (`neutral-600`/`neutral-700`).
- **Text Primary** (`#ffffff`): default text on dark surfaces.
- **Text Secondary** (`#a3a3a3`): section labels, hints, captions (`neutral-400`).
- **Text Tertiary** (`#737373`): placeholder text, least-important captions (`neutral-500`).

### Accent
- **Accent Warning** (`#fbbf24`, amber-400): dual-purpose — storage-error text in the sidebar, *and* the ring/glow around the winner's photo in the winner modal. Sharing one token between "something went wrong" and "you just won" is a real semantic collision worth splitting if the panel gains more warning states.
- **Accent Danger** (`#f87171`, red-400): destructive-action signal, at rest — not just on hover. The per-entry remove `✕` carries it at reduced opacity (`text-red-400/80`) at rest, full opacity on hover; "Clear all" carries the same hue as an outline (`border-red-500/80` at rest, `bg-red-500/10` + solid `border-red-500` on hover) rather than a filled block, so the irreversible action reads as distinct from Shuffle/Sort A–Z without becoming a loud red button. Previously this hue only ever appeared on `:hover` — promoted to a real at-rest token specifically so danger is legible before the pointer arrives, not after. Both opacities were bumped from an initial `/70` and `/40` respectively after an AA/non-text-contrast audit found those too faint against the app's darker themes (Ocean, Sunset) — `/80` is the minimum that clears 4.5:1 (text) and 3:1 (non-text) across the full theme set.

### Named Rules
**The Two Accent Rule.** Amber and red are the only two hues allowed outside the wheel canvas: amber for warning/celebration-adjacent moments (storage errors, the winner glow), red for destructive-action-adjacent moments (remove-entry `✕`, "Clear all"). If a third accent is ever needed (e.g. a distinct "success" or "info" color), it must earn its place the same way red just did — don't reach for an arbitrary fourth Tailwind hue.

## 3. Typography

**Body Font:** `ui-sans-serif, system-ui, sans-serif` (Tailwind's default stack; no custom font is loaded anywhere in the project)

**Character:** A single, neutral system-sans stack used at only four sizes. It reads as functional and gets out of the way, but the hierarchy is thin: `text-sm` alone covers control labels, body copy, button text, and secondary headings alike, so weight (`font-medium`/`font-semibold`) is doing all the differentiation work that size normally would.

### Hierarchy
- **Title** (700, `text-2xl`/1.5rem, tight tracking): the "Spinly" wordmark next to the logo. Appears once.
- **Group Header** (700, `text-base`/1rem, tight tracking, `text-primary`): the two top-level accordion toggles — "General" and "Graphic" — and only those. One step down from Title, one step up from everything nested inside them.
- **Sub Label** (600, `text-xs`, wide tracking, uppercase, `text-secondary`): every heading nested inside a Group Header — "History", "Theme", "Segment colors", "Background image", "Wheel center logo". Deliberately smaller than Group Header (not just a hue/weight tweak) so nesting depth reads as a real size step, not a coat of paint.
- **Body** (400, `text-sm`): control text, entry names, list rows, buttons.
- **Caption** (400, `text-xs`, `text-tertiary`/`text-secondary`): hints ("Add at least two names to spin"), timestamps in history.

### Named Rules
**The Two-Tier Label Rule.** A top-level accordion toggle (General, Graphic) is a Group Header; everything nested inside one — no matter how deep — is a Sub Label. Never let a Sub Label creep up to Group Header size, and never flatten a Group Header down to Sub Label size "to match" — the whole point is that a glance at size alone tells you which tier you're looking at, without reading the word. If a third nesting depth is ever introduced, it earns its own tier before shipping — it does not silently reuse Sub Label the way the old flat pattern did.

## 4. Elevation

Flat by default, everywhere, with exactly one deliberate decorative exception. No `box-shadow` exists anywhere in the config console — rows, buttons, cards, and the sticky header are all distinguished purely by background-color steps on the neutral scale (`surface-sunken` vs. `surface-control` vs. hover). The only *decorative* shadows in the entire codebase are reserved for the celebratory moment: the winner modal (`shadow-2xl` + `ring-1 ring-white/10` on the card, plus a soft amber glow `shadow-[0_0_50px_rgba(251,191,36,0.35)]` around the winner's photo) and the intro wheel's ambient glow.

One functional exception sits outside that decorative budget: `.spinly-sidebar-scroll`'s top/bottom fade + vignette (`src/index.css`) signals there's more content to scroll inside the sidebar once "Graphic" is open. It's implemented via `background-image` gradients, not `box-shadow`, and it's a scroll affordance rather than a celebratory or polish effect — so it doesn't count against the console's flatness, the same way a scrollbar thumb doesn't.

### Named Rules
**The Flat-Console, Lit-Stage Rule.** Elevation is a reward, not a default. The configuration surface stays flat; glow and shadow are earned exclusively by the spin/reveal moment. Do not add shadows to sidebar cards, buttons, or rows to "add polish" — that budget is already spent elsewhere and diluting it here undercuts the one moment it's meant to sell. (The sidebar scroll cue above is a functional exception to this rule, not a violation of it — it communicates scroll state, not decoration.)

## 5. Components

### Buttons
- **Shape:** 8px corners (`rounded-lg`) for every rectangular button; fully circular (`rounded-full`) for icon-only buttons (header mute/fullscreen).
- **Primary:** white background, black text (`invert-surface`/`invert-ink`), `px-4 py-2`, `font-medium`. Used exactly once in the console ("Add names") plus once in the winner modal — it is not a reusable pattern yet, just a single hard-coded instance.
- **Secondary (the actual default):** `surface-control` background, `text-primary` text, `px-3 py-1.5`, `font-medium`, hover → `surface-control-hover`. This style covers Shuffle, Sort A–Z, Restore, Add from images, and both header icon pills — nearly every routine actionable control in the console is this one gray pill.
- **Destructive (outline, not filled):** `border border-red-500/80`, transparent background, `text-red-400`, `px-3 py-1.5`, `font-medium`, `min-w-[8.5rem]`, hover → `bg-red-500/10` + solid `border-red-500`. Used only for "Clear all" — the one irreversible bulk action in the toolbar. Deliberately an outline, not a filled red block: enough to read as "different, be careful" without becoming a loud alarm that fights the calm-console brief. A first click arms a third, time-boxed state (`border-red-500` solid, `bg-red-500/10`, label swaps to "Confirm clear?") that auto-disarms after 3s; the fixed `min-w` keeps that label swap from reflowing the button or its neighbors.
- **Disabled:** `opacity-40` + `cursor-not-allowed`, applied uniformly.

### Cards / Containers
- **Corner Style:** 8px (`rounded-lg`) for entry rows, history rows, theme-swatch cards; 24px (`rounded-3xl`) reserved for the winner modal only.
- **Background:** `surface-sunken` (`neutral-900`) for rows; `surface-control` (`neutral-800`) selected-state highlight in `ThemePanel`.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 1px `neutral-800` (unselected theme card) → `border-white` (selected); otherwise borderless.
- **Internal Padding:** `px-3 py-2` standard row padding.

### Inputs / Fields
- **Style:** `surface-control` background, `rounded-lg`, `px-3 py-2`, `text-sm`, no visible border at rest.
- **Focus:** none defined — text inputs, the range slider, and the color `<input type="color">` all rely entirely on the browser's default focus ring with no custom focus-visible treatment.
- **Disabled:** `opacity-40` + `cursor-not-allowed`, consistent with buttons.

### Accordion (signature structural component)
- **Style:** native `<details>`/`<summary>`, no custom disclosure icon, browser-default triangle marker. Two top-level sections ("General", "Graphic") are the entire organizing structure for the whole console — everything else (entries, history, theming, background/logo) is a flat stack of sub-sections inside one of these two, with no further collapsing.

## 6. Do's and Don'ts

### Do:
- **Do** keep the wheel-spectrum palette (`src/lib/themes.ts`) confined to the canvas — chrome stays neutral + the one amber accent.
- **Do** reserve shadow/glow for the spin-and-reveal moment; keep the console flat (The Flat-Console, Lit-Stage Rule).
- **Do** group controls by task (an entry's name + photo + remove as one unit) rather than by control type, per PRODUCT.md's design principles.
- **Do** keep every control self-explanatory at a glance — no assumed expertise, per PRODUCT.md's Users section.

### Don't:
- **Don't** let the console read as childish or toy-like — no bounce, no candy-color chrome (PRODUCT.md anti-reference).
- **Don't** ship a cluttered settings menu — every option visible at once with no grouping or hierarchy (PRODUCT.md anti-reference).
- **Don't** let "clean & minimal" collapse into a generic flat SaaS admin panel — same-weight gray rows and pills everywhere is the current failure mode, not the target.
- **Don't** introduce a third accent hue casually — amber and red are the only two colors allowed outside the wheel canvas (The Two Accent Rule).
- **Don't** reuse `invert-ink` (`#000000`) and `ink-base` (`#0a0a0a`) as if interchangeable — pick one true black.
