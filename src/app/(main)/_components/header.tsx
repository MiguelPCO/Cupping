"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/stores";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Plus, User, LogOut, Search, LayoutDashboard, Library, Compass } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUnreadActivityCount } from "@/lib/hooks/use-activity-feed";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SearchModal } from "./search-modal";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/collection", label: "Colección", icon: Library },
  { href: "/explore", label: "Explorar", icon: Compass },
];

interface HeaderProps {
  displayName: string;
  avatarUrl: string | null;
  userId: string;
}

export function Header({ displayName, avatarUrl, userId }: HeaderProps) {
  const { setAddCoffeeModal, searchOpen, setSearchOpen } = useUIStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const unread = useUnreadActivityCount();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="border-b border-border bg-cream/95 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-5xl mx-auto h-14 px-4 sm:px-6 flex items-stretch">
          {/* Logo */}
          <div className="flex items-center mr-6 shrink-0">
            <Link
              href="/dashboard"
              className="font-display text-xl text-espresso select-none hover:opacity-80 transition-opacity"
            >
              CUPPING
            </Link>
          </div>

          {/* Desktop nav — full-height underline pattern */}
          <nav className="hidden sm:flex items-stretch" aria-label="Navegación principal">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 px-3 text-sm font-medium border-b-2 transition-colors",
                    active
                      ? "border-copper-500 text-espresso"
                      : "border-transparent text-espresso-light hover:text-espresso"
                  )}
                >
                  {label}
                  {href === "/dashboard" && unread > 0 && (
                    <span className="flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-copper-500 text-white text-[10px] font-bold leading-none">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Buscar cafés (Ctrl+K)"
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-sm text-espresso-light hover:border-copper-300 hover:text-espresso transition-colors"
            >
              <Search className="size-3.5 shrink-0" />
              <span className="hidden lg:inline text-xs">Buscar…</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-linen text-parchment border border-border">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <Button
              size="sm"
              className="hidden sm:flex gap-1.5 bg-copper-500 hover:bg-copper-600 text-white border-0"
              onClick={() => setAddCoffeeModal(true)}
            >
              <Plus className="size-4" />
              Añadir café
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
                  className="absolute right-0 top-11 w-48 bg-card rounded-xl border border-border shadow-lg py-1 z-50"
                >
                  <div className="px-3 py-2 border-b border-border">
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
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="size-4" />
                    {isPending ? "Cerrando…" : "Cerrar sesión"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        userId={userId}
      />
    </>
  );
}
