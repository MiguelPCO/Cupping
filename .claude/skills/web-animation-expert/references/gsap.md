# GSAP Reference Guide

## Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Core API](#core-api)
3. [React Integration (useGSAP)](#react-integration)
4. [Timelines](#timelines)
5. [ScrollTrigger](#scrolltrigger)
6. [Key Plugins](#key-plugins)
7. [Performance Tips](#performance-tips)
8. [Common Patterns](#common-patterns)

---

## Setup & Installation

```bash
npm install gsap @gsap/react
```

GSAP is now free for everyone (including commercial use) thanks to Webflow's sponsorship. All plugins are included.

Import only what you need for tree-shaking:
```js
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

---

## Core API

### Basic Tweens

```js
// To: animate FROM current state TO defined values
gsap.to(".box", { x: 100, opacity: 1, duration: 0.8, ease: "power3.out" });

// From: animate FROM defined values TO current state
gsap.from(".box", { y: 50, opacity: 0, duration: 0.6 });

// FromTo: explicit start and end
gsap.fromTo(".box", 
  { opacity: 0, scale: 0.8 },  // from
  { opacity: 1, scale: 1, duration: 0.5 }  // to
);

// Set: instant property change (no animation)
gsap.set(".box", { opacity: 0, y: 20 });
```

### Stagger

```js
gsap.to(".card", {
  y: 0,
  opacity: 1,
  duration: 0.5,
  stagger: 0.08,        // delay between each element
  ease: "power2.out"
});

// Advanced stagger
gsap.to(".grid-item", {
  scale: 1,
  stagger: {
    amount: 0.8,         // total stagger time
    from: "center",      // start from center outward
    grid: [4, 5],        // grid layout for 2D stagger
    ease: "power2.inOut"
  }
});
```

### Easing

GSAP's easing syntax: `"power1-4.in/out/inOut"`, `"back"`, `"elastic"`, `"bounce"`, `"steps(n)"`, `"expo"`, etc.

Common choices:
- `"power2.out"` — smooth deceleration (default go-to)
- `"power3.out"` — snappier entrance
- `"back.out(1.7)"` — slight overshoot, feels bouncy
- `"elastic.out(1, 0.3)"` — springy, playful
- `"expo.out"` — dramatic fast-to-slow

---

## React Integration

### useGSAP Hook (Recommended)

Always use `useGSAP` instead of raw `useEffect` — it handles cleanup, React Strict Mode, and scoping automatically.

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

function AnimatedHero() {
  const container = useRef(null);

  useGSAP(() => {
    // All selectors are scoped to container ref
    gsap.from(".hero-title", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
    
    gsap.from(".hero-subtitle", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      delay: 0.3,
      ease: "power2.out"
    });
  }, { scope: container }); // Scope selector text to this container

  return (
    <div ref={container}>
      <h1 className="hero-title">Welcome</h1>
      <p className="hero-subtitle">Subtitle here</p>
    </div>
  );
}
```

### Reactive Animations (respond to state)

```tsx
function ToggleBox() {
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef(null);

  useGSAP(() => {
    gsap.to(boxRef.current, {
      height: isOpen ? "auto" : 0,
      opacity: isOpen ? 1 : 0,
      duration: 0.4,
      ease: "power2.inOut"
    });
  }, { dependencies: [isOpen] }); // Re-run when isOpen changes

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      <div ref={boxRef} style={{ overflow: "hidden" }}>Content</div>
    </>
  );
}
```

### Cleanup and Refs

`useGSAP` automatically reverts all GSAP instances created inside it when the component unmounts. No manual cleanup needed for animations created within the hook.

For animations triggered by events (hover, click), use `gsap.context`:

```tsx
useGSAP(() => {
  const ctx = gsap.context(() => {
    // Animations here are auto-cleaned
  }, containerRef);
  
  return () => ctx.revert();
}, { scope: container });
```

---

## Timelines

Timelines are GSAP's killer feature — orchestrate complex sequences with precise control.

```js
const tl = gsap.timeline({
  defaults: { duration: 0.5, ease: "power2.out" }
});

tl.from(".logo", { scale: 0, rotation: -180 })
  .from(".nav-item", { y: -30, opacity: 0, stagger: 0.1 }, "-=0.3") // overlap
  .from(".hero-text", { x: -50, opacity: 0 }, "<")  // start same time as prev
  .from(".cta-button", { scale: 0.8, opacity: 0 }, "+=0.2"); // 0.2s gap

// Position parameter shortcuts:
// "-=0.3"  → 0.3s before end of previous
// "+=0.2"  → 0.2s after end of previous  
// "<"      → same start time as previous
// "<0.2"   → 0.2s after start of previous
// "myLabel" → at a named label
```

### Labels for organization

```js
tl.addLabel("intro")
  .from(".bg", { opacity: 0 })
  .from(".title", { y: 50 })
  .addLabel("content")
  .from(".card", { y: 30, stagger: 0.1 })
  .addLabel("cta")
  .from(".button", { scale: 0.9 });

// Jump to label
tl.play("content");
```

### Timeline controls

```js
tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.seek(1.5);      // jump to 1.5 seconds
tl.progress(0.5);  // jump to 50%
tl.timeScale(2);   // double speed
```

---

## ScrollTrigger

The most powerful scroll animation tool available.

### Basic Usage

```js
gsap.registerPlugin(ScrollTrigger);

gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",     // trigger starts when top of element hits 80% of viewport
    end: "bottom 20%",
    toggleActions: "play none none reverse",
    // onEnter onLeave onEnterBack onLeaveBack
  },
  y: 60,
  opacity: 0,
  duration: 0.8
});
```

### Scrub (link animation to scroll position)

```js
gsap.to(".parallax-bg", {
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,       // true = immediate, number = smoothing seconds
  },
  y: -200,
  ease: "none"
});
```

### Pin (freeze element during scroll)

```js
gsap.to(".progress-bar", {
  scrollTrigger: {
    trigger: ".pinned-section",
    start: "top top",
    end: "+=2000",      // pin for 2000px of scrolling
    pin: true,
    scrub: 1,
  },
  width: "100%",
});
```

### Responsive with matchMedia

```js
ScrollTrigger.matchMedia({
  // Desktop
  "(min-width: 768px)": function() {
    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards", start: "top 80%" },
      x: -100,
      opacity: 0,
      stagger: 0.15
    });
  },
  // Mobile: simpler animations
  "(max-width: 767px)": function() {
    gsap.from(".card", {
      scrollTrigger: { trigger: ".cards", start: "top 90%" },
      y: 30,
      opacity: 0,
      stagger: 0.1
    });
  }
});
```

### React + ScrollTrigger

```tsx
function ScrollSection() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    gsap.from(".reveal-item", {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
        toggleActions: "play none none reverse"
      },
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef}>
      <div className="reveal-item">Item 1</div>
      <div className="reveal-item">Item 2</div>
      <div className="reveal-item">Item 3</div>
    </section>
  );
}
```

---

## Key Plugins

All included for free:
- **ScrollTrigger** — scroll-linked animations (see above)
- **SplitText** — split text into chars/words/lines for granular animation
- **MorphSVG** — morph between SVG shapes
- **DrawSVG** — animate SVG stroke drawing
- **Draggable** — make elements draggable with inertia/snap
- **MotionPath** — animate along an SVG path
- **Flip** — animate layout changes (FLIP technique)
- **GSDevTools** — visual debugger for timelines

### SplitText (Text Animation Powerhouse)

SplitText splits any text element into individual characters, words, and/or lines — each wrapped in its own element for granular animation control. This is the go-to for cinematic hero headings.

```js
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(SplitText);

const split = new SplitText(".heading", { type: "chars,words" });

gsap.from(split.chars, {
  opacity: 0,
  y: 20,
  rotationX: -90,
  stagger: 0.02,
  duration: 0.5,
  ease: "back.out(1.7)"
});
```

**Common text animation effects:**

```js
// 1. Typewriter reveal (char by char)
gsap.from(split.chars, {
  opacity: 0,
  stagger: 0.03,
  duration: 0.01,
  ease: "none"
});

// 2. Word cascade (word by word, rising)
const splitWords = new SplitText(".heading", { type: "words" });
gsap.from(splitWords.words, {
  opacity: 0,
  y: 40,
  stagger: 0.08,
  duration: 0.6,
  ease: "power3.out"
});

// 3. Line-by-line reveal (great for paragraphs)
const splitLines = new SplitText(".paragraph", { type: "lines" });
gsap.from(splitLines.lines, {
  opacity: 0,
  y: 30,
  stagger: 0.12,
  duration: 0.5,
  ease: "power2.out"
});

// 4. Scramble effect (chars rotate in from random positions)
gsap.from(split.chars, {
  opacity: 0,
  scale: 0,
  y: () => gsap.utils.random(-80, 80),
  x: () => gsap.utils.random(-40, 40),
  rotation: () => gsap.utils.random(-30, 30),
  stagger: { amount: 0.6, from: "center" },
  duration: 0.5,
  ease: "back.out(2)"
});
```

**SplitText in React:**

```tsx
function AnimatedHeading({ text }) {
  const headingRef = useRef(null);

  useGSAP(() => {
    const split = new SplitText(headingRef.current, { type: "chars,words" });
    
    gsap.from(split.chars, {
      opacity: 0,
      y: 30,
      rotationX: -90,
      stagger: 0.02,
      duration: 0.6,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: headingRef.current,
        start: "top 80%"
      }
    });

    // SplitText cleanup is handled by useGSAP revert
  }, { scope: headingRef });

  return <h1 ref={headingRef}>{text}</h1>;
}
```

**Important:** Always set `overflow: hidden` on the parent container when using `y` or `rotationX` transforms on split text to prevent clipping artifacts during animation.

---

## Performance Tips

1. **Animate only transform and opacity** — everything else triggers layout/paint
2. **Use `will-change: transform`** on elements about to animate, remove after
3. **Avoid animating `filter` and `boxShadow`** — expensive GPU operations
4. **Use `gsap.quickTo()` for frequent updates** (mousemove, scroll):
   ```js
   const moveX = gsap.quickTo(".cursor", "x", { duration: 0.3, ease: "power3" });
   const moveY = gsap.quickTo(".cursor", "y", { duration: 0.3, ease: "power3" });
   document.addEventListener("mousemove", (e) => {
     moveX(e.clientX);
     moveY(e.clientY);
   });
   ```
5. **Batch ScrollTriggers** with `ScrollTrigger.batch()` for lists:
   ```js
   ScrollTrigger.batch(".card", {
     onEnter: (elements) => {
       gsap.from(elements, { opacity: 0, y: 30, stagger: 0.08 });
     }
   });
   ```
6. **Kill animations on unmount** — `useGSAP` does this automatically in React

---

## Common Patterns

### Hero Section Reveal
```js
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

tl.from(".hero-bg", { scale: 1.1, opacity: 0, duration: 1.2 })
  .from(".hero-title", { y: 80, opacity: 0, duration: 0.8 }, "-=0.6")
  .from(".hero-subtitle", { y: 40, opacity: 0, duration: 0.6 }, "-=0.4")
  .from(".hero-cta", { y: 30, opacity: 0, scale: 0.9, duration: 0.5 }, "-=0.3");
```

### Horizontal Scroll Section
```js
const sections = gsap.utils.toArray(".panel");

gsap.to(sections, {
  xPercent: -100 * (sections.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".panels-container",
    pin: true,
    scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => "+=" + document.querySelector(".panels-container").offsetWidth
  }
});
```

### Magnetic Button Effect
```js
const btn = document.querySelector(".magnetic-btn");

btn.addEventListener("mousemove", (e) => {
  const { left, top, width, height } = btn.getBoundingClientRect();
  const x = (e.clientX - left - width / 2) * 0.3;
  const y = (e.clientY - top - height / 2) * 0.3;
  gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
});

btn.addEventListener("mouseleave", () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
});
```

### Parallax Sections (ScrollTrigger)

```js
// Simple: background moves slower than foreground
gsap.to(".parallax-bg", {
  y: -200,
  ease: "none",
  scrollTrigger: {
    trigger: ".parallax-section",
    start: "top bottom",
    end: "bottom top",
    scrub: true  // ties animation to scroll position
  }
});
```

```tsx
// React: Multi-layer parallax
function ParallaxHero() {
  const sectionRef = useRef(null);

  useGSAP(() => {
    const layers = [
      { selector: ".layer-bg", speed: -80 },
      { selector: ".layer-mid", speed: -160 },
      { selector: ".layer-fg", speed: -280 }
    ];

    layers.forEach(({ selector, speed }) => {
      gsap.to(selector, {
        y: speed,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      <div className="layer-bg absolute inset-0">{/* Sky */}</div>
      <div className="layer-mid absolute inset-0">{/* Mountains */}</div>
      <div className="layer-fg absolute inset-0">{/* Content */}</div>
    </section>
  );
}
```

**Subtlety matters**: Keep parallax speed differences at 20-30%. Extreme differences cause motion sickness. Always provide a `prefers-reduced-motion` fallback that disables all parallax.

### Pinned Scroll Storytelling

Pin a section and animate through "scenes" as user scrolls:

```tsx
function ScrollStory() {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=3000",   // 3000px of scroll distance
        pin: true,       // freeze section in place
        scrub: 1,        // smooth scrubbing
      }
    });

    tl.from(".scene-1", { opacity: 0, y: 50 })
      .to(".scene-1", { opacity: 0 }, "+=0.5")
      .from(".scene-2", { opacity: 0, y: 50 })
      .to(".scene-2", { opacity: 0 }, "+=0.5")
      .from(".scene-3", { opacity: 0, scale: 0.9 });

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <div className="scene-1 absolute inset-0 flex items-center justify-center">
        <h2>Chapter 1</h2>
      </div>
      <div className="scene-2 absolute inset-0 flex items-center justify-center">
        <h2>Chapter 2</h2>
      </div>
      <div className="scene-3 absolute inset-0 flex items-center justify-center">
        <h2>Chapter 3</h2>
      </div>
    </section>
  );
}
```

### Progress Bar Linked to Scroll

```js
gsap.to(".progress-bar", {
  scaleX: 1,
  ease: "none",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.3  // slight smoothing
  }
});
```

```css
.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #3b82f6;
  transform-origin: left;
  transform: scaleX(0);
  z-index: 9999;
}
```

### Smooth Number Counter on Scroll

```tsx
function AnimatedStat({ value, suffix = "" }) {
  const ref = useRef(null);
  const numRef = useRef({ val: 0 });

  useGSAP(() => {
    gsap.to(numRef.current, {
      val: value,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
      },
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(numRef.current.val) + suffix;
        }
      }
    });
  }, { scope: ref });

  return <span ref={ref}>0{suffix}</span>;
}

// Usage
<AnimatedStat value={10000} suffix="+" />
<AnimatedStat value={99} suffix="%" />
```
