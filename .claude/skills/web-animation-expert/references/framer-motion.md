# Framer Motion (Motion) Reference Guide

> **Note**: Framer Motion was rebranded to "Motion" in late 2024. The npm package is now `motion` (v12+), but `framer-motion` still works. The API is the same.

## Table of Contents
1. [Setup & Installation](#setup--installation)
2. [Core Concepts](#core-concepts)
3. [Variants & Orchestration](#variants--orchestration)
4. [AnimatePresence (Exit Animations)](#animatepresence)
5. [Gestures](#gestures)
6. [Scroll Animations](#scroll-animations)
7. [Layout Animations](#layout-animations)
8. [Performance Optimization](#performance-optimization)
9. [Common Patterns](#common-patterns)

---

## Setup & Installation

```bash
npm install motion
# or for legacy
npm install framer-motion
```

```tsx
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
// or from "framer-motion" for legacy installs
```

**Next.js App Router**: Components using `motion` need `"use client"` directive.

### Bundle Size Optimization with LazyMotion

Cut bundle from ~30kb to ~15kb by loading only DOM animations:

```tsx
import { LazyMotion, domAnimation, m } from "motion/react";

// Use `m` instead of `motion` with LazyMotion
export default function Layout({ children }) {
  return (
    <LazyMotion features={domAnimation}>
      {children}
    </LazyMotion>
  );
}

// In components:
<m.div animate={{ opacity: 1 }} />
```

---

## Core Concepts

### The motion Component

Replace any HTML/SVG element with its `motion` equivalent:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}     // Starting state
  animate={{ opacity: 1, y: 0 }}      // Target state
  transition={{ duration: 0.4, ease: "easeOut" }}
/>
```

### Animatable Properties

Motion can animate: `x`, `y`, `z`, `rotate`, `rotateX/Y/Z`, `scale`, `scaleX/Y`, `opacity`, `width`, `height` (with layout), `borderRadius`, `color`, `backgroundColor`, CSS custom properties, SVG path data, and more.

**Best for performance**: Stick to `x`, `y`, `scale`, `rotate`, `opacity`. Add `style={{ willChange: "transform" }}` for transform animations.

### Transition Types

```tsx
// Tween (default for most properties)
transition={{ duration: 0.4, ease: "easeOut" }}
transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }} // custom bezier

// Spring (default for physical values like x, y, scale)
transition={{ type: "spring", stiffness: 200, damping: 20 }}
transition={{ type: "spring", bounce: 0.3 }}

// Inertia (for drag release)
transition={{ type: "inertia", velocity: 200 }}
```

**Spring guidelines**: 
- Snappy UI: `stiffness: 300, damping: 30`
- Bouncy playful: `stiffness: 150, damping: 15`  
- Gentle settle: `stiffness: 100, damping: 25`

---

## Variants & Orchestration

Variants let you define named states and coordinate parent-child animations.

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] }
  }
};

function StaggeredList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.text}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Propagation rule**: When a parent `motion` component has `animate="visible"`, all child `motion` components with matching variant keys automatically trigger. This makes orchestration effortless.

### Centralized Variants Library

Create `lib/motion-variants.ts` and reuse across your app:

```tsx
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export const stagger = (delay = 0.08) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: delay, delayChildren: 0.1 } }
});
```

---

## AnimatePresence

The key differentiator — animate elements as they unmount from the DOM.

```tsx
import { AnimatePresence, motion } from "motion/react";

function Modal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            Modal content
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Critical**: Every direct child of `AnimatePresence` that conditionally renders MUST have a unique `key` prop.

### Page Transitions (Next.js App Router)

```tsx
// app/template.tsx — wraps each page
"use client";
import { motion } from "motion/react";

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Gestures

Built-in gesture handling — no external library needed.

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
>
  Click me
</motion.button>

// Draggable
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1, cursor: "grabbing" }}
/>

// Drag within a container
const constraintsRef = useRef(null);
<motion.div ref={constraintsRef}>
  <motion.div drag dragConstraints={constraintsRef} />
</motion.div>
```

---

## Scroll Animations

### useScroll + useTransform (Smooth Parallax)

```tsx
import { motion, useScroll, useTransform } from "motion/react";

function ParallaxHero() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.div style={{ y, opacity }}>
      Hero content that moves with scroll
    </motion.div>
  );
}
```

### Scroll-Triggered with whileInView

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
  transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
>
  Appears when scrolled into view
</motion.div>
```

`viewport={{ once: true }}` — animate only on first scroll into view (most common). Remove `once` for re-trigger on every scroll.

---

## Layout Animations

Animate between different CSS layouts automatically — Motion's most unique feature.

```tsx
function ExpandableCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout  // Enable layout animation
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        width: isExpanded ? 400 : 200,
        height: isExpanded ? 300 : 100,
        borderRadius: 16
      }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
    >
      <motion.h2 layout="position">Title</motion.h2>
      {isExpanded && <p>Expanded content here</p>}
    </motion.div>
  );
}
```

### Shared Layout Animation (LayoutGroup)

Animate an element between two different components:

```tsx
import { LayoutGroup, motion } from "motion/react";

function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <LayoutGroup>
      <div style={{ display: "flex", gap: 8 }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}>
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                style={{ 
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 2, background: "blue" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```

---

## Performance Optimization

1. **Use `LazyMotion`** — reduces bundle by ~50%
2. **Stick to transform/opacity** — GPU-accelerated
3. **Add `willChange: "transform"`** to elements with transform animations
4. **`useScroll` and `useTransform` don't trigger React re-renders** — they use MotionValues which bypass React's rendering cycle
5. **Use `viewport={{ once: true }}`** to prevent re-triggering scroll animations
6. **`layout` prop on parent + `layout="position"` on children** for complex layout animations
7. **Avoid animating `height: "auto"`** — use `AnimatePresence` with opacity/y instead

---

## Common Patterns

### Notification Toast

```tsx
<AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {toast.message}
    </motion.div>
  ))}
</AnimatePresence>
```

### Accordion / Collapse

```tsx
<AnimatePresence initial={false}>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  )}
</AnimatePresence>
```

### Animated Counter

```tsx
import { motion, useSpring, useTransform, useMotionValue } from "motion/react";
import { useEffect } from "react";

function AnimatedNumber({ value }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}
```

### Staggered Cards Grid

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true }}
  className="grid grid-cols-3 gap-4"
>
  {cards.map((card) => (
    <motion.div key={card.id} variants={item}>
      <Card {...card} />
    </motion.div>
  ))}
</motion.div>
```

### Parallax Section

```tsx
"use client";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

function ParallaxSection() {
  const ref = useRef(null);
  
  // Track scroll of this specific section (not the whole page)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"] // from section entering to leaving viewport
  });

  // Background moves slower than content (parallax)
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  // Text fades out as you scroll past
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.7], [1, 0]);
  // Subtle scale on image
  const imgScale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <section ref={ref} className="relative h-[80vh] overflow-hidden">
      {/* Parallax background image */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY, scale: imgScale }}
      >
        <img src="/hero.jpg" alt="" className="w-full h-full object-cover" />
      </motion.div>

      {/* Content that fades */}
      <motion.div
        className="relative z-10 flex items-center justify-center h-full"
        style={{ opacity: textOpacity }}
      >
        <h2 className="text-5xl font-bold text-white">Scroll to explore</h2>
      </motion.div>
    </section>
  );
}
```

**Key insight**: `useScroll` with `target` and `offset` lets you control exactly when the parallax starts and stops relative to the section's position in the viewport. The MotionValues (`bgY`, `textOpacity`) update on every frame without causing React re-renders.

### Multi-Layer Parallax

```tsx
function LayeredParallax() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Each layer moves at a different speed
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -100]);    // slowest
  const midY = useTransform(scrollYProgress, [0, 1], [0, -200]);   // medium
  const fgY = useTransform(scrollYProgress, [0, 1], [0, -350]);    // fastest

  return (
    <section ref={ref} className="relative h-screen overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Mountains / sky */}
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: midY }}>
        {/* Trees / mid-ground */}
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: fgY }}>
        {/* Foreground content */}
      </motion.div>
    </section>
  );
}
```

### Page Transitions (Next.js App Router)

**Simple approach — template.tsx (recommended for most apps):**

```tsx
// app/template.tsx
"use client";
import { motion } from "motion/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

This runs the entrance animation on every route change. `template.tsx` re-mounts on navigation (unlike `layout.tsx` which persists).

**Advanced approach — with exit animations:**

```tsx
// components/PageTransition.tsx
"use client";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

```tsx
// app/layout.tsx
import { PageTransition } from "@/components/PageTransition";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
```

**`mode="wait"`** ensures exit finishes before enter starts. Use `mode="popLayout"` if you want overlap transitions.

**Timing rule**: Keep page transitions under 300ms total. Anything longer makes the app feel slow. Users are waiting for content — don't make them watch an animation.

### Micro-Interactions

```tsx
// Animated toggle switch
function Toggle({ isOn, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 50, height: 28, borderRadius: 14,
        background: isOn ? "#22c55e" : "#e5e7eb",
        display: "flex", alignItems: "center",
        padding: 3, cursor: "pointer",
        justifyContent: isOn ? "flex-end" : "flex-start",
        transition: "background 0.2s ease"
      }}
    >
      <motion.div
        layout
        style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}

// Animated tab indicator
function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, position: "relative" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{ padding: "8px 16px", position: "relative", background: "none", border: "none" }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                height: 2, background: "#3b82f6", borderRadius: 1
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// Copy-to-clipboard button with feedback
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy}>
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            ✓ Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
```
