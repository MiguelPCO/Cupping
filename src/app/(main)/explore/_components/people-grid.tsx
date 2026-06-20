"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { searchUsers, type FollowUser } from "@/lib/supabase/queries";
import { useDebounce } from "@/lib/hooks";
import { UserCard } from "@/components/social/user-card";

export function PeopleGrid() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    const supabase = createClient();
    searchUsers(supabase, debouncedQuery)
      .then((users) => {
        if (!ignore) {
          setResults(users);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [debouncedQuery]);

  return (
    <div>
      <div className="relative mb-4">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-parchment pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar personas…"
          aria-label="Buscar personas"
          className="w-full h-9 pl-9 pr-4 rounded-lg border border-parchment bg-card text-sm text-espresso placeholder:text-parchment focus:outline-none focus:ring-2 focus:ring-copper-300"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-parchment/40 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && debouncedQuery.trim() && results.length === 0 && (
        <p className="text-center text-espresso-light text-sm py-10">
          Sin resultados para &ldquo;{debouncedQuery}&rdquo;
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {!debouncedQuery.trim() && !loading && (
        <p className="text-center text-espresso-light text-sm py-10">
          Busca personas por nombre o usuario
        </p>
      )}
    </div>
  );
}
