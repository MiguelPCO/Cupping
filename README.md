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

## Testing

Dos suites, dos propósitos:

- **Unit/integration** (Vitest + Testing Library): `npm test` (una vez) o `npm run test:watch`. Supabase va mockeado a nivel de módulo — no toca red.
- **E2E** (Playwright): `npm run test:e2e`. Corre contra un proyecto Supabase Cloud dedicado a testing (nunca prod) y levanta `next dev` en el puerto 3100.

### Configurar el proyecto de test en Supabase

1. Crea un proyecto Supabase Cloud aparte, solo para E2E (nunca reutilices el de prod).
2. Copia `.env.test.example` a `.env.test` y rellena con la URL y las keys de ese proyecto:
   ```bash
   cp .env.test.example .env.test
   ```
3. `.env.test` está en `.gitignore` — nunca se commitea.

`playwright.config.ts` carga `.env.test` automáticamente (con `override: true`, así que siempre gana sobre variables de entorno ya presentes en el shell) y solo reenvía las vars públicas (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) al servidor de dev — la `SERVICE_ROLE_KEY` se queda en el proceso de test, nunca llega al cliente.

### Datos de prueba

Los specs E2E crean y limpian sus propios usuarios/filas vía `tests/e2e/helpers/create-test-user.ts` y `tests/e2e/helpers/admin-client.ts` (cliente admin con la service role key). Cada suite borra en orden de dependencia de FK (entries → follows → coffees → users) en su `afterAll`, porque el proyecto de test no tiene `ON DELETE CASCADE` en esas relaciones.

Si quieres sembrar datos manualmente para explorar la app contra el proyecto de test:
```bash
npm run seed:test
```

### Nota conocida

El test de signup (`auth-visibility.spec.ts`) puede fallar con un 429 (`over_email_send_rate_limit`) si se corre la suite muchas veces seguidas — es un rate-limit externo de Supabase Auth sobre el proyecto de test, no un bug de la app.

## Design Tokens

La paleta y tokens están en `src/app/globals.css` dentro de `@theme`. Usa las clases de Tailwind directamente:

```tsx
<div className="bg-copper-500 text-cream">CTA primario</div>
<div className="bg-roast-dark text-white">Dark roast badge</div>
<span data-flavor="chocolate" style={{ color: 'var(--flavor-color)' }}>Chocolate</span>
```

