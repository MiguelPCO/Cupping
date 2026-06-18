# CUPPING — Design System
> "The Sensory Lab." Verified against the live codebase (`src/app/globals.css`, `src/components/ui/*`, `src/components/coffee/*`) — tokens match the team's own `CUPPING_Visual_Identity_v1.md` 1:1, this file restates what's actually shipped for AI-agent consumption.

Concept: clean surfaces like a professional cupping table. Color comes exclusively from coffee itself — copper, caramel, chocolate. The UI is the neutral canvas; the coffee is the protagonist.

---

## 1. Canvas & Color Space (highest impact)

**Color space: oklch everywhere** (Tailwind v4 native, perceptually uniform — not hex). Light-primary theme; dark mode is class-based (`.dark`) only, never system-following — cream is the intended default experience.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-cream` / `background` | `oklch(0.96 0.02 80)` ≈ `#F5EDE0` | `oklch(0.15 0.02 50)` ≈ espresso | App canvas |
| `--color-linen` / `secondary` | `oklch(0.92 0.02 80)` ≈ `#EDE4D4` | darker espresso step | Cards, sidebar |
| `card` | `oklch(1 0 0)` white | `oklch(0.22 0.04 50)` | Elevated surfaces |
| `--color-espresso` / `foreground` | `oklch(0.22 0.04 50)` ≈ `#2A1F17` | cream | Primary text |
| `--color-parchment` / `border` | `oklch(0.85 0.03 80)` ≈ `#DDD0BD` | `oklch(0.32 0.04 50)` | Borders |

**DON'T:** invert colors for dark mode. Dark mode = "evening cupping session," not a negative filter — copper tones warm slightly (`copper-300` becomes the dark-mode primary instead of `copper-500`), background goes deep espresso, never pure black.

---

## 2. Accent Color + Usage Rule

**Single chromatic accent: Copper.** Primary = `copper-500` `oklch(0.55 0.12 55)` (`#A8693A`) in light mode, `copper-300` `oklch(0.72 0.08 60)` in dark mode — copper actually *brightens* in dark mode rather than dimming, since it's the warmth source.

Full 10-step ramp `copper-50`→`copper-900` exists for fine-grained CTA states (hover = `copper-600`, pressed = `copper-700`).

Used only for: primary CTA fill, `RatingCups` filled-cup color, links, focus ring (`--ring`), active states. This is the literal copper-spoon-of-the-cupping-table metaphor — never use it as a decorative background fill or large surface.

**DON'T:** introduce a second brand-level chromatic. Everything else (roast, flavor, semantic) is functional/contextual color, not brand identity.

---

## 3. Contextual Color Systems (non-brand, data-driven)

Three closed, purpose-built palettes — never substitute or extend ad hoc:

### Roast levels (4 stops, real bean tones)
`roast-light` (golden, `#D4A645`) → `roast-medium` (caramel) → `roast-medium-dark` (chocolate) → `roast-dark` (charcoal, `#3E2820`). Applied via `[data-roast]` attribute + `RoastBadge` (`bg-roast-*`, white text, `rounded-md`, `backdrop-blur-sm`).

### Rating cups (4 states)
`cup-empty` (unfilled) / `cup-filled` (rated) / `cup-half` (0.5 increments) / `cup-hover`. Implemented as custom inline SVG (`rating-cups.tsx`) — **not** stars, **not** numbers. Half-cup uses an SVG `clipPath`, fill transition `150ms var(--ease-out-smooth)`, hover `scale-110`, click `scale-95`. This is the single most distinctive visual element in the product — never substitute a generic star rating.

### Flavor families (10 stops, SCA flavor wheel-derived)
chocolate · nutty · fruity · floral · citrus · spicy · herbal · sweet · earthy · smoky — each with its own oklch hue, applied via `[data-flavor]` → `--flavor-color` custom property, then consumed inline (`FlavorTag`: `background-color: color-mix(in oklch, var(--flavor-color) 15%, transparent)`, pill shape, small color dot). This is a live oklch `color-mix()` pattern, not pre-baked alpha hexes — reuse the same technique for any new flavor-adjacent UI.

### Semantic (functional only)
`success` (herbal green) / `warning` (citrus gold) / `error` (fruity red) / `info` (cool blue) — confirmation, validation, destructive actions. Never used decoratively.

---

## 4. Typography

Three-font stack, each with a distinct job — no overlap:

| Role | Font | Weight | Use |
|---|---|---|---|
| **Display** (`--font-display`) | Instrument Serif | 400 only | Hero titles, section titles, **coffee names** — the one place serif appears |
| **Body** (`--font-body`, default) | Outfit | 300/400/500/600 | All UI text, labels, buttons |
| **Mono/Data** (`--font-mono`) | JetBrains Mono | 400/500 | Ratings, scores, numeric stats — `tabular-nums` |

Scale (from Visual Identity doc, confirmed in component usage e.g. `coffee-card.tsx` uses `font-display text-lg` for coffee name):
```
Display XL 48px/1.1   Display L 36px/1.15   Display M 28px/1.2   Display S 22px/1.25
Heading L 20px/1.3·500  Heading M 18px·500  Heading S 16px·500
Body L 16px/1.6  Body M 14px/1.5  Body S 13px/1.5
Label 12px·500   Overline 11px·500 CAPS+tracking
Data L 18px·500(mono)  Data M 14px(mono)  Data S 12px(mono)
```

**DO:** reserve Instrument Serif for display/coffee-name moments only — mixing it into body or UI chrome breaks the editorial-vs-functional contrast that makes the hierarchy read.
**DO:** use `font-mono tabular-nums` for any rating/score number (see `RatingCups` value display) — precision-via-monospace is the data convention.

---

## 5. Border-Radius Doctrine

Soft, never sharp, never full pill except for tags/badges:

| Element | Radius | Token |
|---|---|---|
| Buttons | 12px | `rounded-lg` → `--radius-lg` |
| Small icon buttons (xs/sm) | 10–12px (capped) | `rounded-[min(var(--radius-md),10-12px)]` |
| Cards | 16px | `rounded-xl` → `--radius-xl` |
| Roast badge | 8px | `rounded-md` |
| Flavor tags, "+N" overflow chip, pill badges | full | `rounded-full` |
| Card images (top/bottom) | matches card | `rounded-t-xl`/`rounded-b-xl` |

**Why:** medium-soft radius signals "crafted, warm, not clinical" (the wood-table metaphor), while pill-only-on-tags keeps interactive chrome (buttons) visually distinct from data labels (tags).

---

## 6. Shadow Philosophy

Light, café-tinted shadows — never neutral gray, always tinted with the espresso hue at low opacity:

```
--shadow-sm: 0 1px 2px oklch(0.22 0.04 50 / 0.06)
--shadow-md: 0 4px 12px oklch(0.22 0.04 50 / 0.08)
--shadow-lg: 0 8px 24px oklch(0.22 0.04 50 / 0.12)
```

Cards default to `shadow-sm`, lift to `shadow-md` on hover (see `coffee-card.tsx`: `shadow-sm hover:shadow-md transition-shadow`). Some surfaces use `ring-1 ring-foreground/10` instead of a shadow for flat elevation (shadcn `Card` primitive) — rings are for structural separation, shadows are for hover/lift feedback.

**DON'T:** use a generic black/gray box-shadow anywhere — it breaks the warm-light "sensory lab" mood instantly.

---

## 7. Distinctive Visual Elements (the brand signature)

These five patterns are what make Cupping *not* generic coffee-app UI — preserve them:

1. **RatingCups SVG** — custom cupping-cup icon (not stars), fill animates like coffee pouring, half-cup via clipPath, keyboard-navigable slider (arrow keys, Home/End → 0.5 increments).
2. **Steam micro-animation** — `SteamAnimation` component: 3 staggered SVG steam wisps, `opacity-0 group-hover:opacity-100`, CSS `@keyframes steam` (translateY -20px, scaleX 1.2, fade), respects `prefers-reduced-motion` (animation disabled entirely).
3. **Grain texture** — `GrainTexture`: fixed full-bleed SVG `feTurbulence` noise filter at `opacity-[0.04]`, z-0, pointer-events-none. CSS-generated, not an image asset. Used sparingly — landing/hero contexts only.
4. **Flavor color-mix tags** — live `color-mix(in oklch, var(--flavor-color) 15%, transparent)` background, never a pre-computed alpha hex.
5. **Roast-level badges** — solid `bg-roast-*` pill/rounded-md with `backdrop-blur-sm`, white text — always overlaid on a photo (bottom-left of card image), never standalone on a plain background.

---

## 8. Spacing, Easing & Motion

Spacing scale (4px base): `xs 4px · sm 8px · md 12px · lg 16px · xl 24px · 2xl 32px · 3xl 48px · 4xl 64px`.

Easing tokens — use these, not ad hoc cubic-beziers:
- `--ease-out-smooth: cubic-bezier(0.22, 1, 0.36, 1)` — default for fills, color transitions (rating cups, hover states)
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — for anything that should feel like a tactile "pop"

Durations: `fast 100ms` (rating cup fill, button press) · `normal 200ms` (most transitions) · `slow 400ms` (page-level reveals).

**DO:** respect `prefers-reduced-motion: reduce` on every custom animation (steam already does this — copy the pattern for new motion).

---

## 9. Component State Coverage

| Component | Default | Hover | Active | Selected/Focus |
|---|---|---|---|---|
| Button (default) | `bg-primary` | `bg-primary/80` | `translate-y-px` | `ring-3 ring-ring/50` |
| Card | `shadow-sm` | `shadow-md` | — | — |
| FlavorTag | flavor color-mix 15% | `scale-105` | `scale-95` | `ring-2 ring-[var(--flavor-color)] ring-offset-1` |
| RatingCups | empty/filled per value | `cup-hover` color, `scale-110` | `scale-95` | slider role, arrow-key adjustable |
| Icon button (edit/delete) | `text-espresso-light` | `bg-linen` (edit) / `bg-destructive/5 text-destructive` (delete) | — | — |

---

## 10. Do's and Don'ts

- **DO** keep copper as the only brand accent; roast/flavor/rating/semantic colors are contextual data, never navigational chrome.
- **DO** use oklch + `color-mix()` for any new color-derived UI — it's the established technique, not hex+alpha.
- **DO** put Instrument Serif only on display text and coffee names.
- **DON'T** replace RatingCups with stars/numbers — it's the core brand differentiator.
- **DON'T** use system dark-mode detection — `.dark` class only, cream is the default.
- **DON'T** use plain gray box-shadows — always espresso-tinted oklch shadows.
- **FORBIDDEN:** inventing a 5th roast-level or 11th flavor-family color outside the closed token sets without updating `globals.css` + the visual identity doc together.

---

## 11. Quick Reference

```
primary (light)   copper-500  oklch(0.55 0.12 55)  ≈ #A8693A
primary (dark)    copper-300  oklch(0.72 0.08 60)
background        cream / espresso(dark)
font               display: Instrument Serif 400 · body: Outfit 300-600 · mono: JetBrains Mono
radius             lg(12) xl(16) full(pill: tags/badges only)
shadow             oklch(0.22 0.04 50 / .06-.12) — always espresso-tinted, never neutral gray
color space        oklch throughout, color-mix() for flavor tag backgrounds
ease               out-smooth cubic-bezier(.22,1,.36,1) · spring cubic-bezier(.34,1.56,.64,1)
darkMode           class ('.dark'), not system-following
```
