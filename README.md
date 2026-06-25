# ☕ CUPPING

**Tu ritual de café, documentado.**

App web para calificar, coleccionar y descubrir cafés — desde granos specialty hasta cápsulas.

## Stack

- **Framework:** Next.js 15 (App Router, React Server Components)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@theme`, oklch color space)
- **UI:** Shadcn UI + Aceternity UI
- **State:** Zustand (client) + TanStack Query v5 (server)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deploy:** Vercel

## Setup

```bash
# 1. Clonar e instalar
git clone https://github.com/tu-usuario/cupping.git
cd cupping
npm install

# 2. Variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Base de datos
# Copiar el contenido de supabase/schema.sql
# Pegarlo en Supabase Dashboard > SQL Editor > Run

# 4. Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
src/
  app/                  # App Router pages
    _components/        # Client components de la página
    globals.css         # Design tokens Tailwind v4
    layout.tsx          # Root layout con fonts
    page.tsx            # Homepage
  components/
    coffee/             # RatingCups, FlavorTag, CoffeeCard...
    ui/                 # Shadcn components customizados
    dashboard/          # StatsCard, FlavorWheel...
    social/             # FollowButton, ActivityFeed...
    layout/             # Header, Sidebar, MobileNav
    shared/             # SearchBar, FilterPanel, EmptyState
  lib/
    supabase/           # Client y server helpers
    hooks/              # Custom hooks
    utils/              # cn(), formatters, labels
    stores/             # Zustand stores
  types/
    coffee.ts           # Domain types y enums
supabase/
  schema.sql            # Database schema completo
```

## Design Tokens

La paleta y tokens están en `src/app/globals.css` dentro de `@theme`. Usa las clases de Tailwind directamente:

```tsx
<div className="bg-copper-500 text-cream">CTA primario</div>
<div className="bg-roast-dark text-white">Dark roast badge</div>
<span data-flavor="chocolate" style={{ color: 'var(--flavor-color)' }}>Chocolate</span>
```

