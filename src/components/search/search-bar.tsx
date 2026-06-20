"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useFilterStore } from "@/lib/stores";
import { useDebounce } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = "Buscar cafés…",
}: SearchBarProps) {
  const { search, setSearch } = useFilterStore();
  const [inputValue, setInputValue] = useState(search);
  const debounced = useDebounce(inputValue, 300);

  // Push debounced value into store
  useEffect(() => {
    setSearch(debounced);
  }, [debounced, setSearch]);

  // Sync when store is cleared externally (e.g. resetFilters)
  useEffect(() => {
    if (search === "" && inputValue !== "") {
      setInputValue("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleClear = () => {
    setInputValue("");
    setSearch("");
  };

  return (
    <div role="search" className={cn("relative", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-parchment pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar cafés"
        className="w-full h-9 pl-9 pr-8 rounded-lg border border-parchment bg-card text-sm text-espresso placeholder:text-parchment focus:outline-none focus:ring-2 focus:ring-copper-300"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center size-5 rounded text-parchment hover:text-espresso transition-colors"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
