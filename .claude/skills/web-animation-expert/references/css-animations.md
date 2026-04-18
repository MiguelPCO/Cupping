# CSS Animations Reference Guide

Covers: **Animate.css**, **Magic Animations**, **Native CSS Transitions/Keyframes**, and **Tailwind CSS Animation Utilities**.

## Table of Contents
1. [Native CSS Animations](#native-css-animations)
2. [Animate.css](#animatecss)
3. [Magic Animations](#magic-animations)
4. [Tailwind CSS Animation Utilities](#tailwind-css-animations)
5. [React Integration](#react-integration)
6. [Accessibility](#accessibility)
7. [Common Patterns](#common-patterns)

---

## Native CSS Animations

Always start here. If CSS can do it, don't load a JS library.

### Transitions (property changes)

```css
.button {
  background: #3b82f6;
  transform: translateY(0);
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
              background 200ms ease;
}

.button:hover {
  transform: translateY(-2px);
  background: #2563eb;
}

.button:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 80ms;
  transition-timing-function: ease-in;
}
```

### Keyframes (multi-step animations)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}

/* Multi-step keyframes */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Stagger with nth-child */
.stagger > * {
  animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.stagger > *:nth-child(1) { animation-delay: 0ms; }
.stagger > *:nth-child(2) { animation-delay: 60ms; }
.stagger > *:nth-child(3) { animation-delay: 120ms; }
.stagger > *:nth-child(4) { animation-delay: 180ms; }
.stagger > *:nth-child(5) { animation-delay: 240ms; }
```

### CSS Custom Properties for Animation Tokens

```css
:root {
  --duration-micro: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 350ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
}

.card {
  transition: transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}
```

### Scroll-Triggered with Intersection Observer (no library)

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Once only
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".animate-on-scroll").forEach((el) => {
  observer.observe(el);
});
```

```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out);
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### CSS View Transitions API (modern browsers)

```js
// For single-page apps (SPA)
document.startViewTransition(() => {
  // Update DOM here
  updateContent();
});
```

```css
::view-transition-old(root) {
  animation: fade-out 0.2s ease-in;
}
::view-transition-new(root) {
  animation: fade-in 0.3s ease-out;
}
```

---

## Animate.css

The classic — 80+ pre-built CSS animations. Zero JS. Tiny bundle (~80kb full, tree-shakeable).

### Installation

```bash
npm install animate.css
```

```js
import "animate.css"; // Import all animations
```

Or CDN:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
```

### Usage

Add `animate__animated` base class + animation name class:

```html
<h1 class="animate__animated animate__fadeInUp">Hello World</h1>
```

### Available Animation Categories

**Attention Seekers**: bounce, flash, pulse, rubberBand, shakeX, shakeY, headShake, swing, tada, wobble, jello, heartBeat

**Entrances**: fadeIn, fadeInDown, fadeInLeft, fadeInRight, fadeInUp, fadeInTopLeft, fadeInTopRight, fadeInBottomLeft, fadeInBottomRight, bounceIn, bounceInDown, bounceInLeft, bounceInRight, bounceInUp, flipInX, flipInY, lightSpeedInRight, lightSpeedInLeft, rotateIn, rotateInDownLeft, rotateInDownRight, rotateInUpLeft, rotateInUpRight, zoomIn, zoomInDown, zoomInLeft, zoomInRight, zoomInUp, slideInDown, slideInLeft, slideInRight, slideInUp, backInDown, backInLeft, backInRight, backInUp

**Exits**: All entrance animations have matching exit variants (fadeOut*, bounceOut*, etc.)

### Customization with CSS Variables

```css
/* Global customization */
:root {
  --animate-duration: 0.8s;    /* default: 1s */
  --animate-delay: 0.2s;       /* default: 1s */
}

/* Per-element */
.my-element {
  --animate-duration: 0.5s;
}
```

### Utility Classes

```html
<!-- Speed -->
<div class="animate__animated animate__fadeIn animate__faster"><!-- 0.5s --></div>
<div class="animate__animated animate__fadeIn animate__fast"><!-- 0.8s --></div>
<div class="animate__animated animate__fadeIn animate__slow"><!-- 2s --></div>
<div class="animate__animated animate__fadeIn animate__slower"><!-- 3s --></div>

<!-- Delay -->
<div class="animate__animated animate__fadeIn animate__delay-1s"><!-- 1s delay --></div>
<div class="animate__animated animate__fadeIn animate__delay-2s"><!-- 2s delay --></div>

<!-- Repeat -->
<div class="animate__animated animate__bounce animate__repeat-2"><!-- repeat 2x --></div>
<div class="animate__animated animate__bounce animate__infinite"><!-- infinite --></div>
```

### Programmatic Control

```js
const element = document.querySelector(".my-element");

// Add animation
element.classList.add("animate__animated", "animate__fadeInUp");

// Listen for completion
element.addEventListener("animationend", () => {
  element.classList.remove("animate__animated", "animate__fadeInUp");
});

// Reusable function
function animateCSS(element, animation, prefix = "animate__") {
  return new Promise((resolve) => {
    const node = typeof element === "string" ? document.querySelector(element) : element;
    node.classList.add(`${prefix}animated`, `${prefix}${animation}`);
    node.addEventListener("animationend", (e) => {
      e.stopPropagation();
      node.classList.remove(`${prefix}animated`, `${prefix}${animation}`);
      resolve();
    }, { once: true });
  });
}

// Usage
await animateCSS(".card", "fadeInUp");
console.log("Animation complete!");
```

---

## Magic Animations

Unique, playful CSS animations not found in Animate.css. Known for its "magic", "foolish", and "bomb" effects.

### Installation

```bash
npm install magic.css
```

Or CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/magic.css@latest/dist/magic.min.css" />
```

### Unique Effects

**Magic Effects**: magic, twisterInUp, twisterInDown, swap, puffIn, puffOut, vanishIn, vanishOut

**Static Effects**: openDownLeft, openDownRight, openUpLeft, openUpRight, openDownLeftReturn, openDownRightReturn, openUpLeftReturn, openUpRightReturn, openDownLeftOut, openDownRightOut, openUpLeftOut, openUpRightOut

**Perspective Effects**: perspectiveDown, perspectiveUp, perspectiveLeft, perspectiveRight, perspectiveDownReturn, perspectiveUpReturn, perspectiveLeftReturn, perspectiveRightReturn

**Rotate Effects**: rotateDown, rotateUp, rotateLeft, rotateRight

**Slide Effects**: slideDown, slideUp, slideLeft, slideRight, slideDownReturn, slideUpReturn, slideLeftReturn, slideRightReturn

**Bomb Effects**: bombRightOut, bombLeftOut

**Tin Effects**: tinRightIn, tinLeftIn, tinUpIn, tinDownIn, tinRightOut, tinLeftOut, tinUpOut, tinDownOut

**Foolish Effects**: foolishIn, foolishOut, holeOut

**Space Effects**: spaceInUp, spaceInDown, spaceInLeft, spaceInRight, spaceOutUp, spaceOutDown, spaceOutLeft, spaceOutRight

### Usage

```html
<div class="magictime vanishIn">Content with Magic animation</div>
```

```js
// Programmatic
element.classList.add("magictime", "puffIn");
```

### When to use Magic vs Animate.css

- **Magic Animations**: More creative/unique effects (puffIn, vanish, bomb). Good for playful UIs, games, creative portfolios.
- **Animate.css**: More standard/professional effects (fadeIn, slideIn, bounce). Better for business apps, e-commerce, SaaS.
- **Both**: Can coexist in the same project since they use different class name prefixes.

---

## Tailwind CSS Animations

Use Tailwind's built-in animation utilities or extend with custom keyframes.

### Built-in Utilities

```html
<div class="animate-spin">Loading spinner</div>
<div class="animate-ping">Notification dot</div>
<div class="animate-pulse">Skeleton loader</div>
<div class="animate-bounce">Scroll indicator</div>
```

### Custom Animations in tailwind.config.js

```js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.33, 1, 0.68, 1) forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "scale-in": "scale-in 0.2s ease-out forwards"
      }
    }
  }
};
```

```html
<div class="animate-fade-in-up">Animated content</div>
```

### Stagger with Tailwind (inline delay)

```html
<div class="animate-fade-in-up [animation-delay:0ms]">Item 1</div>
<div class="animate-fade-in-up [animation-delay:80ms]">Item 2</div>
<div class="animate-fade-in-up [animation-delay:160ms]">Item 3</div>
```

Or dynamically in React:
```tsx
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    {item.text}
  </div>
))}
```

### Transition Utilities

```html
<button class="transition-transform duration-200 ease-out hover:scale-105 active:scale-95">
  Click me
</button>

<div class="transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1">
  Card
</div>
```

---

## React Integration

### Animate.css in React

```tsx
// Direct class application
function AnimatedCard() {
  return (
    <div className="animate__animated animate__fadeInUp">
      Card content
    </div>
  );
}

// Conditional animation
function ToggleElement({ isVisible }) {
  return (
    <div
      className={`animate__animated ${
        isVisible ? "animate__fadeIn" : "animate__fadeOut"
      }`}
      style={{ animationDuration: "0.3s" }}
    >
      Content
    </div>
  );
}

// With Intersection Observer hook
import { useInView } from "react-intersection-observer";

function ScrollReveal({ children, animation = "fadeInUp" }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={inView ? `animate__animated animate__${animation}` : "opacity-0"}
    >
      {children}
    </div>
  );
}
```

### react-intersection-observer

The best companion for CSS-based scroll animations in React:

```bash
npm install react-intersection-observer
```

```tsx
import { useInView } from "react-intersection-observer";

function FadeInSection({ children, delay = 0 }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-10% 0px"
  });

  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}
```

---

## Accessibility

CSS animations MUST include reduced motion support:

```css
/* Global safety net */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Or per-animation (more granular) */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

For Tailwind:
```html
<div class="motion-safe:animate-fade-in-up motion-reduce:opacity-100">
  Respects user preference
</div>
```

---

## Common Patterns

### Skeleton Loading

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

### Smooth Accordion (CSS only)

```css
.accordion-content {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}

.accordion-content.open {
  grid-template-rows: 1fr;
}

.accordion-content > div {
  overflow: hidden;
}
```

### Notification Badge Pulse

```css
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

.badge {
  animation: badge-pulse 2s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .badge { animation: none; }
}
```

### Loading Skeleton (Shimmer)

The most common loading pattern — pure CSS, no JS needed:

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    hsl(0 0% 90%) 25%,
    hsl(0 0% 83%) 50%,
    hsl(0 0% 90%) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

/* Dark mode variant */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background: linear-gradient(
      90deg,
      hsl(0 0% 20%) 25%,
      hsl(0 0% 28%) 50%,
      hsl(0 0% 20%) 75%
    );
  }
}

/* Skeleton sizes */
.skeleton-text { height: 16px; margin-bottom: 8px; }
.skeleton-title { height: 24px; width: 60%; margin-bottom: 12px; }
.skeleton-avatar { width: 48px; height: 48px; border-radius: 50%; }
.skeleton-image { height: 200px; width: 100%; }

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

```html
<!-- Skeleton card structure -->
<div class="card">
  <div class="skeleton skeleton-image"></div>
  <div style="padding: 16px">
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text" style="width: 80%"></div>
  </div>
</div>
```

### Tailwind skeleton (utility approach)

```html
<div class="animate-pulse space-y-3">
  <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
  <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
</div>
```

### CSS-Only Page Transition (View Transitions API)

Modern browsers support native page transitions without JS libraries:

```css
/* Opt in to view transitions */
@view-transition {
  navigation: auto;
}

/* Default cross-fade */
::view-transition-old(root) {
  animation: fade-out 200ms ease-in;
}
::view-transition-new(root) {
  animation: fade-in 300ms ease-out;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Named element transitions (hero images, cards) */
.product-image {
  view-transition-name: product-hero;
}

::view-transition-old(product-hero),
::view-transition-new(product-hero) {
  animation-duration: 300ms;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

**Browser support**: Chrome 111+, Edge 111+, Safari 18+. Not yet in Firefox. Use as progressive enhancement — pages still work without transitions in unsupported browsers.

### Micro-Interaction: Button Press Feedback

```css
.btn-interactive {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-interactive:hover {
  transform: translateY(-2px);
}
.btn-interactive:active {
  transform: translateY(0) scale(0.97);
  transition-duration: 80ms;
  transition-timing-function: ease-in;
}

@media (prefers-reduced-motion: reduce) {
  .btn-interactive { transition: none; }
}
```

### Micro-Interaction: Focus Ring Animation

```css
.input-focus {
  outline: none;
  border: 1.5px solid transparent;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.input-focus:focus-visible {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

### Micro-Interaction: Smooth Underline Link

```css
.link-underline {
  text-decoration: none;
  background-image: linear-gradient(currentColor, currentColor);
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 0% 1.5px;
  transition: background-size 0.3s cubic-bezier(0.33, 1, 0.68, 1);
}
.link-underline:hover {
  background-size: 100% 1.5px;
}
```
