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
          error: "!bg-error/10 !border-error/20 !text-error",
          success: "!bg-success/10 !border-success/20 !text-success",
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
