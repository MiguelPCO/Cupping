# Anime.js Reference Guide

## Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Core API](#core-api)
3. [React Integration](#react-integration)
4. [Timeline](#timeline)
5. [Stagger](#stagger)
6. [SVG Animations](#svg-animations)
7. [Scroll Observer](#scroll-observer)
8. [Draggable](#draggable)
9. [Common Patterns](#common-patterns)

---

## Setup & Installation

```bash
npm install animejs
```

```js
import { animate, stagger, timeline, createScope, createDraggable } from "animejs";
```

Anime.js v4 uses a modular import system — import only what you need for smaller bundles. The library is ~15kb minified (significantly lighter than GSAP's ~30kb or Framer Motion's ~30kb).

---

## Core API

### animate()

```js
import { animate } from "animejs";

// Basic animation
animate(".box", {
  translateX: 250,
  opacity: [0, 1],       // from 0 to 1
  duration: 800,
  ease: "outExpo"
});

// Keyframes
animate(".box", {
  translateX: [
    { to: 100, duration: 300 },
    { to: 250, duration: 500 }
  ],
  scale: [
    { to: 1.2, duration: 200, ease: "inOut(3)" },
    { to: 1, ease: "spring({ bounce: 0.5 })" }
  ]
});

// Multiple targets
animate([".box-1", ".box-2", ".box-3"], {
  translateY: -30,
  opacity: 1,
  duration: 600,
  delay: (el, i) => i * 100  // function-based delay for stagger
});
```

### Property types

```js
animate(".target", {
  // CSS Transforms (GPU-accelerated)
  translateX: 100,
  translateY: 50,
  rotate: 45,          // degrees
  scale: 1.2,
  skewX: 10,

  // CSS Properties
  opacity: 1,
  borderRadius: "50%",
  backgroundColor: "#ff0000",
  
  // SVG attributes  
  points: "64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96",
  strokeDashoffset: [anime.setDashoffset, 0],

  // DOM attributes
  value: [0, 1000],
  
  // Object properties
  // animate({ targets: myObj, prop: 100 })
});
```

### Easing

Anime.js easing syntax:
- `"linear"`
- `"inQuad"`, `"outQuad"`, `"inOutQuad"` (same for Cubic, Quart, Quint, Sine, Expo, Circ, Back, Bounce, Elastic)
- `"out(3)"` — custom power easing (3 = strength)
- `"inOut(2)"` — custom symmetrical easing
- `"spring({ stiffness: 200, damping: 15 })"` — physics spring
- `"cubicBezier(0.33, 1, 0.68, 1)"` — custom bezier curve
- `"steps(5)"` — stepped animation

### Controls

```js
const anim = animate(".box", { translateX: 250, duration: 1000 });

anim.play();
anim.pause();
anim.restart();
anim.reverse();
anim.seek(500);        // jump to 500ms
anim.completed;        // Promise that resolves when done

await anim.completed;  // async/await support
```

### Callbacks

```js
animate(".box", {
  translateX: 250,
  duration: 1000,
  onBegin: (anim) => console.log("started"),
  onUpdate: (anim) => console.log(anim.progress),  // 0-1
  onComplete: (anim) => console.log("done"),
  onLoop: (anim) => console.log("loop iteration"),
});
```

---

## React Integration

Anime.js uses `createScope` for React — it scopes selectors and handles cleanup.

```tsx
import { animate, createScope, spring } from "animejs";
import { useEffect, useRef } from "react";

function AnimatedComponent() {
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    scope.current = createScope({ root }).add((self) => {
      // All selectors scoped to root ref
      animate(".card", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        ease: "outExpo",
        delay: (_, i) => i * 80
      });

      // Register methods callable from outside useEffect
      self.add("highlight", () => {
        animate(".card", {
          scale: [1, 1.05, 1],
          duration: 300,
          ease: "outBack"
        });
      });
    });

    return () => scope.current.revert(); // Cleanup on unmount
  }, []);

  const handleClick = () => {
    scope.current.methods.highlight();
  };

  return (
    <div ref={root}>
      <div className="card" onClick={handleClick}>Card 1</div>
      <div className="card">Card 2</div>
      <div className="card">Card 3</div>
    </div>
  );
}
```

### Key React patterns

- `createScope({ root })` — scopes all selectors to the root ref
- `self.add("methodName", fn)` — register methods callable via `scope.current.methods.methodName()`
- `scope.current.revert()` — cleanup all animations (call in useEffect cleanup)
- State-driven: re-run animations by calling registered methods when state changes

---

## Timeline

Orchestrate sequential and parallel animations:

```js
import { timeline } from "animejs";

const tl = timeline({
  defaults: { duration: 500, ease: "outExpo" }
});

tl.add(".logo", { scale: [0, 1], rotate: [-180, 0] })
  .add(".title", { opacity: [0, 1], translateY: [40, 0] }, "-=300")  // overlap
  .add(".subtitle", { opacity: [0, 1], translateY: [20, 0] }, "-=200")
  .add(".cta", { opacity: [0, 1], scale: [0.9, 1] });

// Position parameter:
// number → absolute time in ms
// "-=300" → 300ms before end of previous
// "+=200" → 200ms after end of previous
```

### Timeline controls

```js
tl.play();
tl.pause();
tl.restart();
tl.reverse();
tl.seek(1000);  // jump to 1000ms
```

---

## Stagger

Built-in stagger utility for elegant list animations:

```js
import { animate, stagger } from "animejs";

// Basic stagger
animate(".item", {
  translateY: [30, 0],
  opacity: [0, 1],
  delay: stagger(80),  // 80ms between each
  duration: 500
});

// Stagger from center
animate(".grid-item", {
  scale: [0, 1],
  delay: stagger(50, { from: "center" }),
  duration: 400
});

// Grid stagger (2D)
animate(".grid-item", {
  scale: [0, 1],
  delay: stagger(30, { grid: [5, 4], from: "center" }),
  duration: 400
});

// Range stagger (distribute evenly across total time)
animate(".bar", {
  scaleY: [0, 1],
  delay: stagger([0, 500]),  // distribute across 0-500ms
  duration: 300
});
```

---

## SVG Animations

Anime.js has excellent built-in SVG support:

### Line Drawing

```js
import { animate } from "animejs";

// Draw SVG path
animate("path", {
  strokeDashoffset: [anime.setDashoffset, 0],
  duration: 2000,
  ease: "inOutQuad"
});
```

### Shape Morphing

```js
animate("polygon", {
  points: [
    { to: "64 128 8.574 96 8.574 32 64 0 119.426 32 119.426 96" },  // hexagon
    { to: "64 0 128 128 0 128" }  // triangle
  ],
  duration: 2000,
  ease: "inOutExpo"
});
```

### Motion Path

```js
animate(".element", {
  translateX: motionPath("path#route"),
  translateY: motionPath("path#route"),
  duration: 3000,
  ease: "linear"
});
```

---

## Scroll Observer

Anime.js v4 includes built-in scroll-linked animations:

```js
import { animate, onScroll } from "animejs";

// Trigger animation when element enters viewport
animate(".reveal", {
  opacity: [0, 1],
  translateY: [40, 0],
  duration: 600,
  ease: "outExpo",
  autoplay: onScroll({
    target: ".reveal",
    enter: "bottom top",  // trigger point
  })
});

// Scrub animation to scroll position
animate(".progress-bar", {
  scaleX: [0, 1],
  ease: "linear",
  autoplay: onScroll({
    target: ".content-section",
    sync: true  // scrub mode
  })
});
```

---

## Draggable

Built-in draggable without external dependencies:

```js
import { createDraggable } from "animejs";

const draggable = createDraggable(".draggable-item", {
  container: ".bounds",           // constraint element
  releaseEase: "spring({ bounce: 0.5 })",
  snap: { x: 50, y: 50 },       // snap to grid
  onDrag: (draggable) => {
    console.log(draggable.x, draggable.y);
  }
});
```

---

## Common Patterns

### Entrance Animation

```js
// Scope for React, or direct for vanilla
animate(".section", {
  opacity: [0, 1],
  translateY: [40, 0],
  duration: 700,
  ease: "outExpo",
  delay: stagger(100)
});
```

### Text Character Animation

```js
// Split text into spans first (manually or with a splitter)
const chars = document.querySelectorAll(".text span");

animate(chars, {
  opacity: [0, 1],
  translateY: [20, 0],
  rotateZ: [-5, 0],
  delay: stagger(25),
  duration: 400,
  ease: "outBack"
});
```

### Loading Spinner

```js
animate(".dot", {
  translateY: [0, -15],
  duration: 400,
  ease: "inOutSine",
  delay: stagger(100),
  loop: true,
  direction: "alternate"
});
```

### Card Hover Effect

```js
// In React: call on mouseenter/mouseleave
function onHover(el) {
  animate(el, {
    translateY: -8,
    scale: 1.02,
    duration: 300,
    ease: "outBack"
  });
}

function onLeave(el) {
  animate(el, {
    translateY: 0,
    scale: 1,
    duration: 400,
    ease: "outExpo"
  });
}
```

### When to Choose Anime.js

- **Over GSAP**: When you need a lighter bundle and don't need ScrollTrigger's full power or SplitText
- **Over Framer Motion**: When working outside React, or when you prefer imperative API over declarative
- **Best for**: SVG animations, lightweight projects, vanilla JS sites, projects where bundle size matters
- **Not ideal for**: Complex scroll-pinning (GSAP is better), React exit animations (Framer Motion is better)
