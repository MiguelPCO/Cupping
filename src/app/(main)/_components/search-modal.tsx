"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Coffee, Star } from "lucide-react";
import { useCoffeeEntries } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function SearchModal({ open, onClose, userId }: SearchModalProps) {
  const router = useRouter();
  const { data: entries = [] } = useCoffeeEntries(userId);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = query.trim()
    ? entries.filter((e) => {
        const q = query.toLowerCase();
        return (
          e.coffee?.name?.toLowerCase().includes(q) ||
          e.coffee?.brand?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : entries.slice(0, 8);

  const navigate = useCallback(
    (entryId: string) => {
      router.push(`/coffee/${entryId}`);
      onClose();
    },
    [router, onClose]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[activeIndex]) {
        navigate(results[activeIndex].id);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, results, activeIndex, navigate, onClose]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <Search className="size-4 text-parchment shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por café o marca…"
            className="flex-1 bg-transparent text-sm text-espresso placeholder:text-parchment focus:outline-none"
          />
          <button
            onClick={onClose}
            className="flex items-center justify-center size-6 rounded-md hover:bg-linen text-parchment hover:text-espresso transition-colors"
            aria-label="Cerrar búsqueda"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Results */}
        <ul ref={listRef} className="max-h-[60vh] overflow-y-auto py-1.5" role="listbox">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center">
              <Coffee className="size-8 text-parchment mx-auto mb-2" />
              <p className="text-sm text-espresso-light">Sin resultados para &ldquo;{query}&rdquo;</p>
            </li>
          ) : (
            results.map((entry, i) => (
              <li key={entry.id} role="option" aria-selected={i === activeIndex}>
                <button
                  onClick={() => navigate(entry.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === activeIndex ? "bg-linen" : "hover:bg-linen/50"
                  )}
                >
                  <div className="flex items-center justify-center size-8 rounded-lg bg-copper-50 shrink-0">
                    <Coffee className="size-4 text-copper-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">
                      {entry.coffee.name}
                    </p>
                    <p className="text-xs text-espresso-light truncate">
                      {entry.coffee.brand}
                    </p>
                  </div>
                  {entry.rating_global > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star className="size-3 text-copper-400 fill-copper-400" />
                      <span className="text-xs text-espresso-light font-medium">
                        {entry.rating_global.toFixed(1)}
                      </span>
                    </div>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-t border-border">
            <span className="text-[11px] text-parchment">
              <kbd className="font-sans">↑↓</kbd> navegar
            </span>
            <span className="text-[11px] text-parchment">
              <kbd className="font-sans">↵</kbd> abrir
            </span>
            <span className="text-[11px] text-parchment">
              <kbd className="font-sans">Esc</kbd> cerrar
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
