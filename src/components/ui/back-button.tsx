"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "Volver", className }: BackButtonProps) {
  const router = useRouter();
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <button
      onClick={handleBack}
      className={cn(
        "flex items-center gap-1.5 text-sm text-espresso-light hover:text-espresso transition-colors",
        className
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
