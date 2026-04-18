"use client";

import { Controller, type Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { CoffeeFormInput } from "@/lib/validations/coffee";

type SubRatingField = keyof Pick<
  CoffeeFormInput,
  | "rating_aroma"
  | "rating_body"
  | "rating_acidity"
  | "rating_sweetness"
  | "rating_bitterness"
  | "rating_aftertaste"
>;

interface SubRatingInputProps {
  label: string;
  name: SubRatingField;
  control: Control<CoffeeFormInput>;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
}

export function SubRatingInput({
  label,
  name,
  control,
  minLabel,
  maxLabel,
  className,
}: SubRatingInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const numValue = field.value ?? null;
        const sliderValue = numValue ?? 5;

        return (
          <div className={cn("space-y-1.5", className)}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-espresso">{label}</label>
              <span
                className={cn(
                  "font-mono text-sm tabular-nums w-6 text-right",
                  numValue === null ? "text-parchment" : "text-copper-600"
                )}
              >
                {numValue === null ? "–" : numValue}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={sliderValue}
              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              onBlur={field.onBlur}
              className="w-full h-1.5 rounded-full cursor-pointer accent-copper-500 bg-parchment appearance-none"
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={sliderValue}
            />
            {(minLabel || maxLabel) && (
              <div className="flex justify-between">
                <span className="text-[10px] text-parchment">{minLabel}</span>
                <span className="text-[10px] text-parchment">{maxLabel}</span>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
