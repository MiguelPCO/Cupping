"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "font-body text-sm bg-card border border-parchment text-espresso shadow-md rounded-xl",
          error: "!bg-red-50 !border-red-200 !text-red-800",
          success: "!bg-green-50 !border-green-200 !text-green-800",
          description: "text-espresso/60",
          actionButton: "bg-copper-500 text-white",
          cancelButton: "bg-parchment text-espresso",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
