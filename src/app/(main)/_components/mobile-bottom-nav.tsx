"use client";

import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/stores";
import { LayoutDashboard, Library, Plus, Compass, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/collection", label: "Colección", icon: Library },
];

const NAV_LINKS_RIGHT = [
  { href: "/explore", label: "Explorar", icon: Compass },
  { href: "/profile", label: "Perfil", icon: User },
];

export function MobileBottomNav() {
  const { setAddCoffeeModal } = useUIStore();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed bottom-0 left-0 right-0 sm:hidden z-40 bg-cream border-t border-parchment"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] transition-colors",
                active ? "text-copper-500" : "text-espresso-light"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}

        {/* FAB */}
        <div className="flex-1 flex items-center justify-center py-2 min-h-[56px]">
          <button
            onClick={() => setAddCoffeeModal(true)}
            aria-label="Añadir nuevo café"
            className="flex items-center justify-center size-11 rounded-full bg-copper-500 text-white shadow-md hover:bg-copper-600 active:bg-copper-700 transition-colors"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {NAV_LINKS_RIGHT.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] transition-colors",
                active ? "text-copper-500" : "text-espresso-light"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
