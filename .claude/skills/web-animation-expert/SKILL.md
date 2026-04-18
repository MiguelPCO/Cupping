---
name: web-animation-expert
description: Expert skill for creating professional web animations using GSAP, Framer Motion (Motion), Anime.js, Animate.css, Magic Animations, and CSS native animations. Use this skill whenever the user asks to animate any web element, create transitions, add scroll-triggered effects, build micro-interactions, implement page transitions, create loading animations, animate SVGs, add hover effects, implement parallax scrolling, create staggered reveals, or mentions any animation library by name (GSAP, Framer Motion, Motion, Anime.js, Animate.css, Magic Animations, React Spring, Lottie). Also trigger when the user wants to add "motion", "movement", "transitions", or "interactive effects" to a website, app, component, or landing page. Even if the user just says "make it feel alive" or "add some polish" — this skill applies. Covers React/Next.js integration, performance optimization, and accessibility (prefers-reduced-motion).
---

# Web Animation Expert

Create professional, performant, and accessible web animations. This skill covers the full animation stack — from simple CSS transitions to complex orchestrated sequences — and helps choose the right tool for each job.

## Step 0: Understand the Context First

Before recommending any library or writing animation code, ask (or infer from context) these questions. This prevents over-engineering a simple landing or under-serving a cinematic one.

### Context Discovery Questions

If the user's request is open-ended (e.g., "animate my landing", "add some motion"), gather context first:

1. **What type of site/page?** → Different types need different animation intensity:

| Type | Animation Level | Typical Tools |
|------|----------------|---------------|
| Corporate / SaaS landing | Subtle reveals, clean transitions | Tailwind + Framer Motion |
| Creative portfolio / Agency | Bold, cinematic, text reveals | GSAP + SplitText + ScrollTrigger |
| E-commerce / Product page | Micro-interactions, image transitions | Framer Motion + CSS |
| Blog / Documentation | Minimal — fast load is priority | CSS only or Tailwind utilities |
| Interactive storytelling | Scroll-driven, parallax, pinned sections | GSAP ScrollTrigger (mandatory) |
| Game / Playful app | Bouncy, elastic, creative effects | GSAP or Anime.js + Magic Animations |

2. **What's already in the stack?** → Don't add libraries if the current stack can handle it. Tailwind already covers 40-50% of landing animation needs.

3. **What specific sections need animation?** → Hero, features, testimonials, CTA, page transitions? This determines complexity.

4. **Performance constraints?** → Mobile-first? Low-bandwidth audience? This affects library choice and animation density.

If the user provides enough context in their message (e.g., "Next.js + Tailwind landing for a SaaS"), skip the questions and recommend directly. Only ask when truly ambiguous.

## Decision Framework: Choosing the Right Library

With context understood, pick the right tool. Read the relevant reference file in `references/` for deep patterns and API details.

### Quick Decision Matrix

| Need | Best Tool | Why |
|------|-----------|-----|
| Simple hover/entrance effects | **CSS / Animate.css** | Zero JS, smallest bundle, GPU-accelerated |
| React component animations | **Framer Motion (Motion)** | Declarative API, exit animations, gestures, layout animations |
| Complex timelines & scroll sequences | **GSAP** | Most powerful timeline, ScrollTrigger, fine-grained control |
| Lightweight JS animations | **Anime.js** | Small bundle, clean API, good SVG support |
| Quick pre-built effects | **Animate.css / Magic Animations** | Class-based, instant results, no JS needed |
| Physics-based spring animations | **Framer Motion / React Spring** | Natural-feeling movement |
| After Effects → Web | **Lottie** | Vector animations at any scale |

### Decision Rules

1. **Can CSS alone do it?** (hover, simple fade, transform) → Use CSS. Always start here.
2. **React app needing declarative animation?** → Framer Motion. Best DX for React.
3. **Complex timeline with scroll triggers?** → GSAP. Nothing else matches its power.
4. **Framework-agnostic lightweight needs?** → Anime.js. Clean imperative API.
5. **Quick pre-built effects, no customization?** → Animate.css or Magic Animations.

## Core Animation Principles

These apply regardless of which library you use.

### Performance Rules (Non-Negotiable)

Only animate **compositor-friendly properties** for 60fps:
- ✅ `transform` (translate, scale, rotate, skew)
- ✅ `opacity`
- ⚠️ `filter` (GPU but expensive — use sparingly)
- ❌ `width`, `height`, `top`, `left`, `margin`, `padding` — triggers layout reflow

```css
/* ✅ GOOD: GPU-accelerated, no layout thrash */
.animate-in {
  transform: translateY(20px);
  opacity: 0;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
}
.animate-in.visible {
  transform: translateY(0);
  opacity: 1;
}

/* ❌ BAD: Triggers layout recalculation every frame */
.animate-in {
  margin-top: 20px;
  transition: margin-top 0.4s;
}
```

Use `will-change: transform` on elements that will animate — but apply it sparingly (only on elements about to animate, remove after).

### Timing & Easing

Standard timing tokens for consistency across any library:

| Type | Duration | Easing | Use Case |
|------|----------|--------|----------|
| Micro | 100–150ms | `ease-out` | Button press, toggle |
| Fast | 200–300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Tooltips, dropdowns |
| Normal | 300–500ms | `cubic-bezier(0.33, 1, 0.68, 1)` | Modals, page elements |
| Emphasis | 500–800ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero reveals, feature sections |
| Slow | 800–1200ms | `cubic-bezier(0.22, 1, 0.36, 1)` | Page transitions |

Stagger delays: 50–100ms between items. More than 150ms feels sluggish.

**Spring physics** (Framer Motion / GSAP): Use `stiffness: 100–300`, `damping: 15–30` for natural feel. Higher stiffness = snappier. Lower damping = more bounce.

### Accessibility (Required)

Every animation MUST respect `prefers-reduced-motion`. This is not optional.

**CSS approach:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**React approach (Framer Motion):**
```tsx
import { useReducedMotion } from "framer-motion";

function AnimatedCard({ children }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

**GSAP approach:**
```js
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReduced) {
  gsap.to(".hero", { y: 0, opacity: 1, duration: 0.8 });
} else {
  gsap.set(".hero", { y: 0, opacity: 1 }); // Instant, no motion
}
```

**WCAG rules to follow:**
- No content flashing more than 3 times per second (WCAG 2.3.1)
- Animations > 5 seconds need a pause/stop control (WCAG 2.2.2)
- Non-essential motion must be disableable (WCAG 2.3.3)
- Provide on-page toggle when possible — not all users know about OS settings

### Common Animation Patterns

These patterns work across all libraries. See reference files for library-specific implementations.

**1. Fade + Rise (most versatile entrance)**
```
initial: opacity: 0, y: 20px
final: opacity: 1, y: 0
duration: 300-500ms, ease-out
```

**2. Staggered List Reveal**
```
container → triggers children sequentially
stagger: 50-100ms between items
each child: fade + rise
```

**3. Scale Pop (buttons, cards on hover)**
```
hover: scale(1.02-1.05)
active/press: scale(0.95-0.98)
duration: 150-200ms, spring or ease-out
```

**4. Slide In (drawers, modals, panels)**
```
from off-screen edge (translateX: 100% or translateY: 100%)
to position (translate: 0)
duration: 300-400ms with overshoot easing
```

**5. Scroll-Triggered Reveal**
```
elements start hidden (opacity: 0, y: 30px)
trigger when element enters viewport (75-90% threshold)
animate to visible state
optional: stagger if multiple elements
```

**6. Page/Route Transition**
```
exit: current page fades out (200-300ms)
enter: new page fades in (300-400ms)
keep fast — users are waiting for content
```

**7. Text Reveal Animations**

Text animation is one of the highest-impact patterns for hero sections and headings. Three approaches by complexity:

**a) CSS-only (per-word with spans):**
```tsx
// Wrap each word in a span, stagger with animation-delay
<h1 className="overflow-hidden">
  {["Build", "Something", "Beautiful"].map((word, i) => (
    <span
      key={word}
      className="inline-block animate-fade-in-up"
      style={{ animationDelay: `${i * 80}ms` }}
    >
      {word}&nbsp;
    </span>
  ))}
</h1>
```

**b) Framer Motion (per-word or per-character):**
```tsx
const textVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } }
};
const charVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

function AnimatedText({ text }) {
  return (
    <motion.span variants={textVariants} initial="hidden" animate="visible">
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={charVariant} style={{ display: "inline-block" }}>
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
```

**c) GSAP SplitText (most powerful — character/word/line level):**
```js
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const split = new SplitText(".hero-heading", { type: "chars,words,lines" });
gsap.from(split.chars, {
  opacity: 0, y: 30, rotationX: -90,
  stagger: 0.02, duration: 0.6, ease: "back.out(1.7)"
});
```
SplitText is the go-to for cinematic text reveals, per-character color changes, and typewriter effects. See `references/gsap.md` for full patterns.

**8. Parallax Scrolling**

Background moves slower than foreground, creating depth. Keep it subtle (20-30% speed difference) to avoid motion sickness.

```
Framer Motion:
  useScroll() → scrollYProgress (0 to 1)
  useTransform(scrollYProgress, [0, 1], [0, -200])
  Apply to style={{ y }} — no React re-renders

GSAP ScrollTrigger:
  scrub: true → links animation directly to scroll position
  y: -200 on background with ease: "none"

CSS only (simple):
  background-attachment: fixed (limited but zero JS)
```

**9. Page / Route Transitions (Next.js)**

```
Next.js App Router approach:
  app/template.tsx wraps each page with motion.div
  initial → animate on mount = entrance
  
For exit animations (more complex):
  Wrap layout children with AnimatePresence
  Key on pathname from usePathname()
  Add exit prop to motion wrapper
  Keep transitions FAST: 200-300ms max

Important: Never block navigation for animation.
Users waiting > 500ms for a page transition feel frustrated.
```

**10. Loading & Skeleton Animations**

```
Skeleton shimmer: CSS gradient animation (no JS needed)
  linear-gradient moving from left to right
  background-size: 200%, animation: shimmer 1.5s infinite

Spinner: CSS @keyframes rotate 360deg
  or Tailwind animate-spin

Progress bar: width 0% → 100%
  GSAP or CSS transition on width/scaleX

Content loader: Animate from skeleton → real content
  Cross-fade: skeleton opacity 1→0, content 0→1
  Framer Motion AnimatePresence handles the swap
```

**11. Micro-Interactions (small but impactful)**

```
Button press: scale(0.95-0.98) on :active, 80ms
Button hover: translateY(-2px), subtle shadow increase
Toggle switch: translateX with spring physics
Input focus: border-color transition + subtle scale(1.01)
Checkbox: scale pop (0→1.2→1) with SVG checkmark draw
Copy button: icon swap with cross-fade on click
Like/heart: scale(1→1.3→1) with color change
Notification dot: pulse animation (scale + opacity loop)

Rule: Micro-interactions should be < 200ms.
Anything longer feels like it's "trying too hard."
```

See reference files for library-specific implementations of all patterns.

## Library Reference Files

For detailed API patterns, code examples, and advanced techniques for each library, read the appropriate reference file:

| File | When to Read |
|------|-------------|
| `references/gsap.md` | GSAP timelines, ScrollTrigger, React integration with useGSAP, plugins |
| `references/framer-motion.md` | Motion components, variants, AnimatePresence, gestures, scroll hooks, layout animations |
| `references/animejs.md` | Anime.js animate(), timelines, stagger, SVG, React with createScope |
| `references/css-animations.md` | Animate.css, Magic Animations, native CSS transitions/keyframes, Tailwind animation utilities |

Read the relevant reference file BEFORE writing animation code for that library.

## React / Next.js Integration Patterns

### Component Structure for Animations

```tsx
// lib/motion-variants.ts — Centralized animation definitions
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};
```

```tsx
// components/AnimatedSection.tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion-variants";

export function AnimatedSection({ children }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return <div>{children}</div>;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
    >
      {children}
    </motion.div>
  );
}
```

### Next.js Specifics

- Framer Motion components need `"use client"` directive in App Router
- GSAP with `useGSAP` hook handles cleanup automatically
- For page transitions: wrap layout with `AnimatePresence` and key on pathname
- Use `LazyMotion` with `domAnimation` to cut Framer Motion bundle from ~30kb to ~15kb:

```tsx
import { LazyMotion, domAnimation } from "framer-motion";

export default function Layout({ children }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}
```

## Anti-Patterns to Avoid

- **Animating everything** — Motion should guide attention, not demand it. If everything moves, nothing stands out.
- **Animations blocking interaction** — Users should never wait for an animation to complete before they can act. Make animations interruptible.
- **Layout-triggering properties** — Never animate `width`, `height`, `top`, `left`, `margin`, `padding` for smooth motion.
- **Ignoring reduced motion** — Always implement `prefers-reduced-motion`. Not optional.
- **Competing animations** — Two elements animating at the same time in different directions creates visual chaos.
- **Excessive duration** — Entrance animations over 800ms feel sluggish. Page transitions over 500ms annoy users.
- **Animation without purpose** — Every animation should answer: "What user understanding does this improve?"

## Debugging & Performance Tools

- **Chrome DevTools → Performance panel**: Record and look for frame drops (red bars)
- **Chrome → Rendering tab → FPS meter**: Real-time framerate overlay
- **Chrome → Rendering tab → Paint flashing**: Shows what repaints (green = bad if constant)
- **Chrome → Layers panel**: See compositing layers and GPU memory
- **GSAP DevTools** (`GSDevTools`): Visual timeline scrubber for debugging GSAP animations
- **Framer Motion**: Use `onAnimationStart` / `onAnimationComplete` callbacks to debug timing
- Target: 60fps minimum (16.7ms per frame budget)
