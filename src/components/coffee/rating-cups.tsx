"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface RatingCupsProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
}

const SIZES = {
  sm: { cup: 20, gap: 2, fontSize: "text-xs" },
  md: { cup: 28, gap: 4, fontSize: "text-sm" },
  lg: { cup: 36, gap: 6, fontSize: "text-base" },
} as const;

function CuppingCup({ filled, half, hovered, size }: {
  filled: boolean; half: boolean; hovered: boolean; size: number;
}) {
  const fillColor = hovered
    ? "var(--color-cup-hover)"
    : filled ? "var(--color-cup-filled)" : "var(--color-cup-empty)";

  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      {half && <defs><clipPath id={`hc-${size}`}><rect x="4" y="13" width="16" height="8" /></clipPath></defs>}
      <path d="M4 8h16v2c0 5-3 9-8 10C7 19 4 15 4 10V8z"
        fill={half ? "var(--color-cup-empty)" : fillColor}
        style={{ transition: "fill 150ms var(--ease-out-smooth)" }} />
      {half && <path d="M4 8h16v2c0 5-3 9-8 10C7 19 4 15 4 10V8z"
        fill="var(--color-cup-half)" clipPath={`url(#hc-${size})`}
        style={{ transition: "fill 150ms var(--ease-out-smooth)" }} />}
      <path d="M20 10h3c1 0 2 1 2 2v1c0 2-1 3-3 3h-1"
        stroke={filled || half ? fillColor : "var(--color-cup-empty)"}
        strokeWidth="1.5" strokeLinecap="round" fill="none"
        style={{ transition: "stroke 150ms var(--ease-out-smooth)" }} />
    </svg>
  );
}

export function RatingCups({
  value, onChange, max = 5, size = "md",
  readOnly = false, showValue = true, className,
}: RatingCupsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const { cup: cupSize, gap, fontSize } = SIZES[size];

  const handleClick = useCallback(
    (cupIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly || !onChange) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const isLeftHalf = (event.clientX - rect.left) < rect.width / 2;
      onChange(isLeftHalf ? cupIndex + 0.5 : cupIndex + 1);
    }, [readOnly, onChange]
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly || !onChange) return;
    let nv = value;
    switch (event.key) {
      case "ArrowRight": case "ArrowUp": nv = Math.min(value + 0.5, max); break;
      case "ArrowLeft": case "ArrowDown": nv = Math.max(value - 0.5, 0.5); break;
      case "Home": nv = 0.5; break;
      case "End": nv = max; break;
      default: return;
    }
    event.preventDefault();
    onChange(nv);
  }, [readOnly, onChange, value, max]);

  return (
    <div className={cn("inline-flex items-center", className)}
      style={{ gap: `${gap}px` }} role="slider"
      aria-label={`Rating: ${value} de ${max} tazas`}
      aria-valuenow={value} aria-valuemin={0.5} aria-valuemax={max}
      tabIndex={readOnly ? -1 : 0} onKeyDown={handleKeyDown}>
      {Array.from({ length: max }, (_, i) => {
        const cv = i + 1;
        const isFilled = displayValue >= cv;
        const isHalf = !isFilled && displayValue >= cv - 0.5;
        const isHovered = hoverValue !== null && cv <= Math.ceil(hoverValue);
        return (
          <button key={i} type="button" disabled={readOnly}
            onClick={(e) => handleClick(i, e)}
            onMouseEnter={() => !readOnly && setHoverValue(cv)}
            onMouseLeave={() => setHoverValue(null)}
            className={cn("relative transition-transform duration-100",
              !readOnly && "cursor-pointer hover:scale-110 active:scale-95",
              readOnly && "cursor-default")}
            style={{ lineHeight: 0 }} tabIndex={-1} aria-hidden="true">
            <CuppingCup filled={isFilled} half={isHalf}
              hovered={isHovered && !isFilled} size={cupSize} />
          </button>
        );
      })}
      {showValue && (
        <span className={cn("font-mono tabular-nums text-espresso-light ml-1", fontSize)}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
