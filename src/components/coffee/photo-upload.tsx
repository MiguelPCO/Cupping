"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 5;

interface PhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export function PhotoUpload({ onFileSelect, className }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten imágenes");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`La imagen debe pesar menos de ${MAX_SIZE_MB} MB`);
        return;
      }
      setError(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    },
    [preview, onFileSelect]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-2", className)}>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-parchment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Quitar foto"
            className="absolute top-2 right-2 flex items-center justify-center size-7 rounded-full bg-foreground/70 text-background hover:bg-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-colors",
            isDragging
              ? "border-copper-500 bg-copper-50"
              : "border-parchment hover:border-copper-300 hover:bg-linen/50"
          )}
          aria-label="Subir foto"
        >
          <ImagePlus className="size-8 text-copper-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-espresso-light">
              Arrastra una foto o haz clic
            </p>
            <p className="text-xs text-parchment mt-0.5">PNG, JPG hasta {MAX_SIZE_MB} MB</p>
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        aria-hidden="true"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
