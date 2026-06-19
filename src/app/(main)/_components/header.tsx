"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useUIStore } from "@/lib/stores";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Menu, Plus, User, LogOut } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  displayName: string;
  avatarUrl: string | null;
}

export function Header({ displayName, avatarUrl }: HeaderProps) {
  const { toggleSidebar, setAddCoffeeModal } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 border-b border-parchment bg-cream/95 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:bg-copper-500 focus:text-white focus:rounded text-sm"
      >
        Saltar al contenido
      </a>

      <button
        onClick={toggleSidebar}
        className="hidden sm:flex items-center justify-center size-9 rounded-md hover:bg-linen text-espresso-light transition-colors"
        aria-label="Alternar menú lateral"
      >
        <Menu className="size-5" />
      </button>

      <Link href="/dashboard" className="font-display text-xl text-espresso select-none hover:opacity-80 transition-opacity">
        CUPPING
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          className="hidden sm:flex gap-1.5 bg-copper-500 hover:bg-copper-600 text-white border-0"
          onClick={() => setAddCoffeeModal(true)}
        >
          <Plus className="size-4" />
          Nuevo café
        </Button>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`Menú de ${displayName}`}
            className="flex items-center justify-center size-9 rounded-full bg-copper-100 text-copper-700 font-medium text-sm hover:bg-copper-200 transition-colors overflow-hidden"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={displayName}
                className="size-full object-cover"
              />
            ) : initials ? (
              initials
            ) : (
              <User className="size-4" />
            )}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-11 w-48 bg-white rounded-xl border border-parchment shadow-lg py-1 z-50"
            >
              <div className="px-3 py-2 border-b border-parchment">
                <p className="text-sm font-medium text-espresso truncate">
                  {displayName}
                </p>
              </div>
              <Link
                href="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-espresso-light hover:bg-linen transition-colors"
              >
                <User className="size-4" />
                Mi perfil
              </Link>
              <button
                role="menuitem"
                disabled={isPending}
                onClick={() => {
                  setMenuOpen(false);
                  startTransition(() => signOut());
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <LogOut className="size-4" />
                {isPending ? "Cerrando…" : "Cerrar sesión"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
