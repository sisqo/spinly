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

Spinly's configuration surface is the stagehand's board, not the show. Everything outside the wheel itself — the always-visible entries panel and the settings drawer (theme, background, duration, and the rest) — exists to be set once, trusted, and forgotten the moment the wheel starts spinning. The settings drawer is deliberately an overlay with no dimming backdrop, not a modal: it slides in on top of the page (a right-hand panel on desktop, a near-full-screen bottom sheet on mobile) so the wheel and the entries panel stay fully visible and live behind it while a host adjusts theme or background — the point is live preview, not interruption. The spin and the winner reveal (confetti, fanfare, the amber-lit winner modal) are the one moment the system is allowed to be loud; the console that gets it there should be quiet, precise, and unmistakably a real tool rather than a toy.

Today the code delivers the "quiet" half of that brief almost by accident: the entire config surface is nearly monochrome (three neutral grays and white), which reads as restrained but currently lands closer to **undifferentiated** than **calm**. Every row, every button, every label uses the same visual weight — `bg-neutral-800` or `bg-neutral-900`, `rounded-lg`, `text-sm` — so nothing in the panel tells the eye what matters more than what else. There are exactly two accent colors in the entire chrome (`amber-400`, reserved for warnings and the winner-moment glow; `red-400`, reserved for destructive actions — the per-entry remove `✕` and "Clear all"); shadow is similarly rationed to two narrow exceptions — the winner modal's glow ring, and the settings drawer's own separating shell (see Elevation, §4) — everywhere else in the console stays flat. That flatness is the right instinct pointed at the wrong target: it should express "calm console," not "every control is interchangeable."

This system explicitly rejects: childish/toy-like ornamentation (bounce, candy-color chrome), and a cluttered settings menu where every control sits at the same flat priority with no grouping. It should also stop reading as a generic gray SaaS admin panel — restraint is not the same as sameness.

**Key Characteristics:**
- Near-monochrome neutral scale (`neutral-900` → `neutral-400`) carries almost the entire UI; color is spent, not decorated with.
- Zero elevation at rest anywhere in the persistent console (the entries panel, its rows and buttons, and every control living inside the settings drawer); the only shadows in the app are the winner-reveal glow and the settings drawer's own outer shell, which needs to visually separate itself from the undimmed page it overlays (see The Flat-Console, Lit-Stage Rule, §4).
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
- **Group Header** (700, `text-base`/1rem, tight tracking, `text-primary`): the settings drawer's two top-level section headings — "General" and "Appearance" — and only those. Plain `<h3>`s now, not accordion `<summary>` toggles: the drawer is one scrolling view with no collapsing. One step down from Title, one step up from everything nested inside them.
- **Sub Label** (600, `text-xs`, wide tracking, uppercase, `text-secondary`): the nested headings inside the drawer's Group Headers — "Theme", "Segment colors", "Background image", "Wheel center logo", all nested under "Appearance" — plus "History", which heads its own sub-section in the standalone entries panel even though that panel has no Group Header of its own to nest under. Deliberately smaller than Group Header (not just a hue/weight tweak) so nesting depth reads as a real size step, not a coat of paint; "History" earns the same small size on the same relative-weight logic — it's still visually subordinate to everything around it, just without a labeled parent above it.
- **Body** (400, `text-sm`): control text, entry names, list rows, buttons.
- **Caption** (400, `text-xs`, `text-tertiary`/`text-secondary`): hints ("Add at least two names to spin"), timestamps in history.

### Named Rules
**The Two-Tier Label Rule.** A top-level settings-drawer section heading (General, Appearance) is a Group Header; everything nested inside one — no matter how deep — is a Sub Label, and so is "History" even though it stands alone in the entries panel with no Group Header parent to nest under (the tier is about relative visual weight against its own siblings, not literal DOM nesting inside a Group Header). Never let a Sub Label creep up to Group Header size, and never flatten a Group Header down to Sub Label size "to match" — the whole point is that a glance at size alone tells you which tier you're looking at, without reading the word. If a third nesting depth is ever introduced, it earns its own tier before shipping — it does not silently reuse Sub Label the way the old flat pattern did.

## 4. Elevation

Flat by default, everywhere, with two deliberate exceptions — one decorative, one structural. No `box-shadow` exists on any persistent console surface — entry rows, history rows, theme cards, buttons, the sticky header, and every control living inside the settings drawer are all distinguished purely by background-color steps on the neutral scale (`surface-sunken` vs. `surface-control` vs. hover). The *decorative* exception is reserved for the celebratory moment: the winner modal (`shadow-2xl` + `ring-1 ring-white/10` on the card, plus a soft amber glow `shadow-[0_0_50px_rgba(251,191,36,0.35)]` around the winner's photo) and the intro wheel's ambient glow. The *structural* exception is the Settings Drawer's own outer shell (`shadow-2xl` + a `border-l` on desktop / `border-t` on the mobile bottom sheet): the drawer is a non-modal overlay with no dimming backdrop by design — that's precisely why a drawer was chosen over a modal, so the wheel and entries panel stay fully visible for live preview — which means a flat, borderless panel would be visually indistinguishable from the live page it sits on top of. The shadow does the separation job a backdrop would otherwise do; it is spent on the drawer's own edge, not on anything inside it — the drawer's inputs, toggle, swatches, and dropzones are exactly as flat as every other control in the console.

A third, purely functional exception sits outside that decorative/structural budget entirely: `.spinly-sidebar-scroll`'s top/bottom fade + vignette (`src/index.css`) signals there's more content to scroll, and it now covers two independent regions — the entries panel (its scroll-shadow color tracks whatever theme background or background-image shows through it, via a `--spinly-scroll-shadow` CSS variable) and, separately, the settings drawer's own content region, which pins that same variable to a constant `#0a0a0a` since the drawer's background is opaque (`bg-neutral-950`) rather than transparent and so never needs to track the active theme. Both are implemented via `background-image` gradients, not `box-shadow`, and both are scroll affordances rather than celebratory or polish effects — so neither counts against the console's flatness, the same way a scrollbar thumb doesn't.

### Named Rules
**The Flat-Console, Lit-Stage Rule.** Elevation is a reward, not a default — but "reward" now covers two distinct things, not one. The *persistent* console — the entries panel, its rows and buttons, and every control living inside the settings drawer — stays flat regardless of which surface it's on. Glow and shadow are earned by (1) the spin/reveal celebratory moment, exactly as before, and (2) a transient, backdrop-less overlay's own outer edge — today, only the Settings Drawer/bottom sheet — which needs to read as detached from the flat, undimmed page still live behind it. Do not add shadows to entry rows, history rows, theme cards, or any control to "add polish," inside the drawer or out — that budget is already spent, and diluting it here undercuts both the moment it's meant to sell and the drawer's own reason for having one. (The `.spinly-sidebar-scroll` scroll cue above is a separate, functional exception to this rule, not a violation of it — it communicates scroll state, not decoration.)

## 5. Components

### Buttons
- **Shape:** 8px corners (`rounded-lg`) for every rectangular button; fully circular (`rounded-full`) for icon-only buttons (header mute/fullscreen/settings, and the settings drawer's own close button).
- **Primary:** white background, black text (`invert-surface`/`invert-ink`), `px-4 py-2`, `font-medium`. Used exactly once in the console ("Add names") plus once in the winner modal — it is not a reusable pattern yet, just a single hard-coded instance.
- **Secondary (the actual default):** `surface-control` background, `text-primary` text, `px-3 py-1.5`, `font-medium`, hover → `surface-control-hover`. This style covers Shuffle, Sort A–Z, Restore, Add from images, and both header icon pills — nearly every routine actionable control in the console is this one gray pill.
- **Destructive (outline, not filled):** `border border-red-500/80`, transparent background, `text-red-400`, `px-3 py-1.5`, `font-medium`, hover → `bg-red-500/10` + solid `border-red-500`. Used for the app's two irreversible bulk actions: "Clear all" in the entry toolbar (`min-w-[8.5rem]`) and "Reset to defaults" at the foot of the settings drawer (`min-w-[10rem]`, wider to fit "Confirm reset?"). Deliberately an outline, not a filled red block: enough to read as "different, be careful" without becoming a loud alarm that fights the calm-console brief. Both share one implementation (`useArmedConfirm`): a first click arms a third, time-boxed state (`border-red-500` solid, `bg-red-500/10`, label swaps to "Confirm clear?"/"Confirm reset?") that auto-disarms after 3s; each button's own fixed `min-w` keeps that label swap from reflowing itself or its neighbors.
- **Disabled:** `opacity-40` + `cursor-not-allowed`, applied uniformly.

### Cards / Containers
- **Corner Style:** 8px (`rounded-lg`) for entry rows, history rows, theme-swatch cards; 24px (`rounded-3xl`) reserved for the winner modal only.
- **Background:** `surface-sunken` (`neutral-900`) for rows; `surface-control` (`neutral-800`) selected-state highlight in `ThemePanel`.
- **Shadow Strategy:** none, with one exception — the Settings Drawer's own outer shell (see Elevation, §4). Nothing rendered inside any card/container — entry rows, history rows, theme cards, or the drawer's own internal sections — ever carries a shadow.
- **Border:** 1px `neutral-800` (unselected theme card) → `border-white` (selected); otherwise borderless.
- **Internal Padding:** `px-3 py-2` standard row padding.

### Inputs / Fields
- **Style:** `surface-control` background, `rounded-lg`, `px-3 py-2`, `text-sm`, no visible border at rest.
- **Focus:** text inputs, the number input, and the range slider still rely entirely on the browser's default focus ring — no custom focus-visible treatment there. The newer non-native controls do define one: Toggle Switch and Image Dropzone's clickable region both use `focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`, matching the precedent `ThemePanel.tsx`'s remove-button already set. The native `<input type="color">` inside a Color Swatch stays fully transparent and absolutely positioned, so it never shows a ring of its own — the swatch shell around it doesn't draw one either, since the browser's own color-picker affordance (cursor, click target) already signals interactivity there.
- **Disabled:** `opacity-40` + `cursor-not-allowed`, consistent with buttons.

### Settings Drawer / Bottom Sheet (signature structural component)
- **Style:** a non-modal overlay, not a dialog — `<aside aria-label="Settings">`, deliberately without `role="dialog"`/`aria-modal` since nothing behind it is inert. Desktop (`md:` and up): a `w-96` panel fixed to the right edge, sliding in via `translateX`; default **open**. Mobile: a near-full-screen bottom sheet (`max-h-[92vh]`, `rounded-t-2xl`), sliding up via `translateY`; default **closed**. Never persisted across reloads — always resets to its breakpoint default on every load. No dimming backdrop on either breakpoint: the whole point of a drawer over a modal is that the wheel and the entries panel stay fully visible and live behind it, so a host can watch a theme or background change land in real time.
- **Open/close:** toggled by a gear-icon button in the header (`SettingsIcon`, always visible — including during fullscreen presentation — styled identically to the mute/fullscreen icon buttons beside it). Also closable via an explicit `CloseIcon` button inside the drawer, or Escape. No click-outside-to-close — there's no backdrop to attach that listener to.
- **Internal organization:** one scrolling view, no tabs, no further collapsing — two Group-Header sections, "General" (Title, Duration) and "Appearance" (Hide branding toggle, label font scale, theme picker, segment colors, background image, wheel center logo), followed by a "Reset to defaults" armed-confirm action at the very end that restores only the drawer-scoped settings (not the header-level mute control, which lives outside the drawer's scope).
- **Live-apply only:** every control inside patches state immediately — no Save/Cancel. The drawer never auto-closes on spin, and its own controls are simply never disabled during a spin (unlike the entries panel's controls, which are).

### Entries Panel
- **Style:** a plain, always-visible (`md:` and up) standalone block beside the wheel — `EntryInput` → `AddFromImagesButton` → `EntryToolbar` → `EntryList` → an optional storage-error line, then a `border-t`-separated History block. No accordion, no Group Header of its own; "History" is the panel's one Sub Label heading, standing alone with no Group Header parent above it (see The Two-Tier Label Rule, §3).

### Toggle Switch
- **Style:** replaces the plain checkbox for boolean settings (currently just "Hide logo and title"). A native `<button type="button" role="switch" aria-checked>` — a pill track (`h-6 w-11`, `bg-white` on / `bg-neutral-800` off) with a sliding thumb (`bg-neutral-900` on / `bg-neutral-400` off) — wrapped in a `<label>` so clicking the visible text also toggles it. `focus-visible:outline focus-visible:outline-2 focus-visible:outline-white`; `disabled:opacity-40 disabled:cursor-not-allowed`, consistent with every other control. Respects `prefers-reduced-motion` by skipping the thumb's slide transition entirely, not just shortening it.

### Color Swatch
- **Style:** the segment-color editor's per-color control. A styled `h-10 w-10` `rounded-lg` shell whose background *is* the current color, with a fully transparent native `<input type="color">` absolutely positioned on top to own the actual picking interaction — no custom color picker was built, the browser's own remains the mechanism. When removable, an always-mounted `✕` button sits at the swatch's corner (`opacity-60` at rest → `opacity-100` on hover/focus-visible/group-hover), preserving the keyboard/touch-reachability fix already in place.

### Image Dropzone
- **Style:** replaces the old upload-button-plus-hidden-input pattern for both the background image and the wheel center logo. A dashed-border (`border-dashed border-neutral-700`) target, keyboard-operable (`role="button" tabIndex={0}`, Enter/Space open the file picker exactly like a click), native HTML5 drag-and-drop, and a larger preview than before (`h-24 w-24`; `rounded-full` for the circular center logo, `rounded-lg` for the rectangular background). Guidance copy ("Drag an image here, or click to upload") shows when empty; a text "Remove" action sits outside the clickable zone once an image is set; an optional inline error line sits below.

## 6. Do's and Don'ts

### Do:
- **Do** keep the wheel-spectrum palette (`src/lib/themes.ts`) confined to the canvas — chrome stays neutral + the one amber accent.
- **Do** reserve shadow/glow for the spin-and-reveal moment and the settings drawer's own backdrop-less overlay edge; keep everything else in the console flat (The Flat-Console, Lit-Stage Rule).
- **Do** group controls by task (an entry's name + photo + remove as one unit) rather than by control type, per PRODUCT.md's design principles.
- **Do** keep every control self-explanatory at a glance — no assumed expertise, per PRODUCT.md's Users section.

### Don't:
- **Don't** let the console read as childish or toy-like — no bounce, no candy-color chrome (PRODUCT.md anti-reference).
- **Don't** ship a cluttered settings menu — every option visible at once with no grouping or hierarchy (PRODUCT.md anti-reference).
- **Don't** let "clean & minimal" collapse into a generic flat SaaS admin panel — same-weight gray rows and pills everywhere is the current failure mode, not the target.
- **Don't** introduce a third accent hue casually — amber and red are the only two colors allowed outside the wheel canvas (The Two Accent Rule).
- **Don't** reuse `invert-ink` (`#000000`) and `ink-base` (`#0a0a0a`) as if interchangeable — pick one true black.
