"use client";

import { useEffect, useRef } from "react";

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      el!.style.background = `radial-gradient(600px at ${e.clientX}px ${e.clientY}px, oklch(0.55 0.12 55 / 0.07), transparent 80%)`;
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-10 transition-[background] duration-300"
      aria-hidden="true"
    />
  );
}
