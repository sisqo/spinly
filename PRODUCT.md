# Product

## Register

product

## Users

Anyone who needs to pick a random name in front of other people: event hosts and raffle organizers setting up before a giveaway (usually desktop, sometimes finishing touches on mobile), teachers doing repeated quick picks mid-lesson on a shared or projected screen, streamers reconfiguring live on camera, and one-off casual users with zero prior exposure to the tool. No segment can be assumed to have technical fluency or prior context — every control has to be self-explanatory on first sight, and the panel has to hold up on both a laptop during setup and a phone mid-event.

## Product Purpose

Spinly is a free, client-side spinning-wheel name picker for giveaways, raffles, classroom randomizers, and similar reveal moments. No sign-up, no backend — everything (entries, theme, settings) lives in the browser. Success is a host who can go from "list of names" to "confident, working wheel" in under a minute, and a spin/reveal moment (wheel animation, winner modal, confetti, fanfare) that feels satisfying enough to be worth doing live in front of people.

## Brand Personality

Clean & minimal. The configuration surface (entry list, settings, theming) should read as a calm, restrained utility — not a toy, not a cluttered options menu. The one place personality/energy is allowed to peak is the spin-and-reveal moment itself (confetti, fanfare, the winner modal), which already exists and is intentionally more expressive than the rest of the app. The panel's job is to get out of the way efficiently, not to compete with that moment.

## Anti-references

- **Childish / toy-like.** No cartoonish bounce, no candy-color overload in the chrome itself — this needs to hold up as a real tool for real events, not read as a kids' toy.
- **Cluttered settings menu.** Everything visible at once with no grouping or hierarchy, like a camera's full manual mode. Controls should be grouped by task, with progressive disclosure where it helps, not dumped flat into one long list.
- (Implicit, from current state) **Generic flat SaaS admin panel** — rows of identical gray cards/buttons with no visual hierarchy is the current failure mode and should not be mistaken for "clean & minimal."

## Design Principles

- **Clarity over decoration.** Minimal is a restraint, not an absence — hierarchy, spacing, and grouping do the work that ornament would otherwise have to.
- **Group by task, not by control type.** Related controls (an entry's name + photo + remove; a theme's palette + custom colors) should read as one unit, not a flat list of same-weight rows.
- **One calm surface, one celebratory peak.** The entry/settings panel stays restrained; the app's full expressive budget (motion, color, sound) is spent on the spin and the winner reveal, which already exist and should stay the visual high point.
- **No assumed expertise.** Every control must be self-explanatory to a first-time user — event hosts, teachers, streamers, and casual users all land here with no shared prior context.
- **Fast, low-friction repeat use.** Hosts and teachers reconfigure the same panel repeatedly (add/remove names, swap a photo, nudge a color); minimize steps and keep tap targets comfortable for the mobile mid-event case.

## Accessibility & Inclusion

Standard WCAG AA baseline: sufficient contrast on all text and controls, full keyboard operability, and respect for `prefers-reduced-motion` (already partially implemented in the winner modal's close animation — extend the same respect to any new motion introduced in the panel).
