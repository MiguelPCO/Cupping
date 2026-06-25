"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "font-body text-sm bg-card border border-border text-espresso shadow-md rounded-xl",
          error: "!bg-red-500/10 !border-red-500/20 !text-red-700 dark:!text-red-400",
          success: "!bg-green-500/10 !border-green-500/20 !text-green-700 dark:!text-green-400",
          description: "text-espresso/60",
          actionButton: "bg-copper-500 text-white",
          cancelButton: "bg-linen text-espresso",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
