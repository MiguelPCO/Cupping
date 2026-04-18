"use client";

import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/stores";
import { LayoutDashboard, Library, Compass, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/collection", label: "Colección", icon: Library },
  { href: "/explore", label: "Explorar", icon: Compass },
  { href: "/profile", label: "Mi perfil", icon: User },
];

export function Sidebar() {
  const { sidebarOpen } = useUIStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden sm:flex flex-col shrink-0 border-r border-parchment bg-cream transition-[width] duration-200 overflow-hidden",
        sidebarOpen ? "w-56" : "w-14"
      )}
    >
      <nav className="flex flex-col gap-0.5 p-2 pt-3" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
                active
                  ? "text-copper-500 bg-linen"
                  : "text-espresso-light hover:bg-linen hover:text-espresso"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5 shrink-0" />
              <span
                className={cn(
                  "truncate transition-opacity duration-150",
                  sidebarOpen ? "opacity-100" : "opacity-0 w-0"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
