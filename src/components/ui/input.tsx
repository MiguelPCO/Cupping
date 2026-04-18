import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Bottom-border-only editorial style — no box, no radius
        "h-10 w-full min-w-0 rounded-none border-0 border-b border-parchment bg-transparent px-0 py-2",
        "text-base text-espresso placeholder:text-parchment",
        "transition-colors outline-none",
        "focus-visible:border-copper-500",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
