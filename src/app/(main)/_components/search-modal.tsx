"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog as ModalPrimitive } from "@base-ui/react/dialog";
import { Search, X, Coffee, Star, Loader2 } from "lucide-react";
import { useCoffeeEntries } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function SearchModal({ open, onClose, userId }: SearchModalProps) {
  const router = useRouter();
  const { data: entries = [], isLoading } = useCoffeeEntries(userId);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Adjust state during render instead of chaining effects off the `open`
  // prop: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  const trimmedQuery = query.trim();
  const results = trimmedQuery
    ? entries.filter((e) => {
        const q = trimmedQuery.toLowerCase();
        return (
          e.coffee?.name?.toLowerCase().includes(q) ||
          e.coffee?.brand?.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : entries.slice(0, 8);

  const activeOption = results[activeIndex];

  const navigate = useCallback(
    (entryId: string) => {
      router.push(`/coffee/${entryId}`);
      onClose();
    },
    [router, onClose]
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  // Capture phase, not bubble: base-ui's DialogPopup calls stopPropagation()
  // on arrow/home/end keys during the bubble phase (composite-widget
  // support), which would otherwise stop these keys from ever reaching a
  // normal document-level bubble listener. Capture-phase listeners run
  // before that, so they see the key regardless.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (
        e.key === "Enter" &&
        e.target === inputRef.current &&
        results[activeIndex]
      ) {
        e.preventDefault();
        navigate(results[activeIndex].id);
      }
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open, results, activeIndex, navigate]);

  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  return (
    <ModalPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <ModalPrimitive.Portal>
        <ModalPrimitive.Backdrop className="fixed inset-0 z-50 bg-espresso/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <ModalPrimitive.Popup
          initialFocus={inputRef}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 outline-none"
        >
          <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
            <ModalPrimitive.Title className="sr-only">Buscar cafés</ModalPrimitive.Title>
            <ModalPrimitive.Description className="sr-only">
              Busca en tu colección por nombre de café o marca
            </ModalPrimitive.Description>

            {/* Search input */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
              <Search className="size-4 text-hint-text shrink-0" />
              <label htmlFor="search-modal-query" className="sr-only">
                Buscar por café o marca
              </label>
              <input
                id="search-modal-query"
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={results.length > 0}
                aria-controls="search-modal-listbox"
                aria-activedescendant={activeOption ? `search-option-${activeOption.id}` : undefined}
                aria-autocomplete="list"
                autoComplete="off"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Buscar por café o marca…"
                className="flex-1 bg-transparent text-sm text-espresso placeholder:text-hint-text focus:outline-none"
              />
              <ModalPrimitive.Close
                className="flex items-center justify-center size-6 rounded-md hover:bg-linen text-hint-text hover:text-espresso transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X className="size-3.5" />
              </ModalPrimitive.Close>
            </div>

            {/* Results */}
            <ul
              id="search-modal-listbox"
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto py-1.5"
              role="listbox"
              aria-label="Resultados de búsqueda"
            >
              {isLoading ? (
                <li className="px-4 py-8 flex items-center justify-center gap-2 text-sm text-espresso-light">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando…
                </li>
              ) : results.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <Coffee className="size-8 text-hint-text mx-auto mb-2" />
                  <p className="text-sm text-espresso-light">
                    {trimmedQuery
                      ? `Sin resultados para "${trimmedQuery}"`
                      : "Aún no tienes cafés en tu colección"}
                  </p>
                </li>
              ) : (
                results.map((entry, i) => (
                  <li
                    key={entry.id}
                    id={`search-option-${entry.id}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    tabIndex={-1}
                    onClick={() => navigate(entry.id)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors",
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
                  </li>
                ))
              )}
            </ul>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 border-t border-border">
                <span className="text-[11px] text-hint-text">
                  <kbd className="font-sans">↑↓</kbd> navegar
                </span>
                <span className="text-[11px] text-hint-text">
                  <kbd className="font-sans">↵</kbd> abrir
                </span>
                <span className="text-[11px] text-hint-text">
                  <kbd className="font-sans">Esc</kbd> cerrar
                </span>
              </div>
            )}
          </div>
        </ModalPrimitive.Popup>
      </ModalPrimitive.Portal>
    </ModalPrimitive.Root>
  );
}
