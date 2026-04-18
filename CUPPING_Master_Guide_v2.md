# CUPPING — Guía Maestra v2.0
## Tu ritual de café, documentado

> **Stack:** Next.js 15 · Tailwind CSS v4 · Shadcn UI · Aceternity UI · Supabase · Zustand + TanStack Query
> **Concepto visual:** "The Sensory Lab"
> **Última actualización:** Marzo 2026

---

## Qué es este documento

La guía maestra del proyecto. Todo lo que necesitas para tomar decisiones y ejecutar está aquí. No es un tutorial ni un estado del arte — es lo que abres el lunes por la mañana para saber qué toca.

Organizado en 8 fases. No son estrictamente secuenciales: la fase 7 (performance) se mide desde el Sprint 0, y la fase 1 (research) se reabre cuando hay datos reales de uso. Pero el orden refleja la dependencia natural: no diseñas sin investigar, no implementas sin tokens, no lanzas sin medir.

---

## Fase 0 — Producto: qué construimos y para quién

### Problem statement
No existe una app moderna, visualmente atractiva y social para registrar, calificar y descubrir cafés — desde granos hasta cápsulas — con el nivel de detalle que un amante del café necesita.

Los competidores directos (Beanhunter, Coffee Guru, Filtru) están fragmentados: UX anticuada, solo specialty coffee, sin componente social real. Las referencias indirectas (Vivino, Letterboxd, Untappd) demuestran que el modelo funciona — pero nadie lo ha ejecutado bien para café.

### Usuarios

**Persona principal — "El Curioso del Café."** 22-38 años. Compra café en grano, molido y cápsulas. Prueba marcas nuevas con frecuencia. Su frustración: no recuerda qué café compró hace 2 meses ni si le gustó. Quiere un registro personal bonito y descubrir qué toman otros.

**Persona secundaria — "El Entusiasta Specialty."** 25-45 años. Invierte en equipo, conoce orígenes y métodos. Su frustración: las apps de café existentes son feas o demasiado simples para su nivel de detalle.

### Gap de mercado
Ningún competidor combina: diseño premium + rating multi-dimensión + colecciones personales + social + todos los tipos de café (no solo specialty).

### Alcance

**MVP (Sprints 0-3) — "Mi Diario de Café":** CRUD de cafés con foto, rating global (1-5 tazas) + 6 sub-ratings, notas de sabor por familia, colecciones (en casa / favoritos / pendientes / probados), filtros y búsqueda, dashboard personal con flavor wheel.

**Social (Sprint 4-5) — "Descubre y Conecta":** Auth + perfil público, follow system + feed de actividad, explorar cafés de la comunidad, rating comunitario agregado.

**Futuro (post-MVP):** Recomendaciones AI, barcode scanner, mapa de tostadores, comparador, export, PWA.

---

## Fase 1 — Research: validar con datos, no con intuición

### Qué hacer concretamente

**Antes de construir cada feature:**
1. Revisar cómo lo resuelven Vivino, Letterboxd y Untappd — no para copiar, para entender decisiones
2. Preguntar a 3-5 bebedores de café: ¿qué información guardarías? ¿qué te haría abrir la app otra vez?
3. Card sorting informal de las categorías de sabor — ¿la gente piensa en familias o en descriptores sueltos?

**Después de lanzar MVP:**
- Heatmaps en "agregar café" — ¿dónde abandonan?
- Task Success Rate del flujo completo (objetivo: >85%)
- SUS score en primera ronda (objetivo: >75)

### Rol de la IA en research
En 2026, la IA ya forma parte del flujo de work de research en la mayoría de equipos, pero su papel óptimo sigue siendo el de acelerador: transcribir, resumir, agrupar patrones, generar primeras hipótesis y reducir tiempo operativo. El trabajo crítico sigue siendo humano: formular buenas preguntas, interpretar ambigüedad, detectar contradicciones y convertir hallazgos en decisiones de producto.

Para CUPPING: usa IA para analizar reviews de café en Amazon/Reddit y extraer dimensiones reales, sintetizar competitive analysis, generar variantes de microcopy. No la uses para decidir si una feature va al MVP ni para sustituir conversaciones reales con usuarios.

---

## Fase 2 — Psicología de interfaz: checklist por pantalla

Antes de dar por terminada cualquier pantalla:
- ¿UN solo CTA primario visible? (Hick)
- ¿Targets táctiles mínimo 44x44px? (Fitts)
- ¿Menos de 7 elementos compitiendo por atención? Si no, agrupar o colapsar (Miller)
- ¿Elementos relacionados cerca, no-relacionados separados? (Gestalt)
- ¿El elemento prioritario es visualmente distinto del resto? (Von Restorff)
- ¿Navegación sigue patrones conocidos? (Jakob)
- ¿Respuesta del sistema <400ms o feedback inmediato? (Doherty)

**Aplicación directa en CUPPING:** La pantalla de calificar tiene muchos inputs → progressive disclosure (rating global primero, expand para detalles). El flavor selector puede tener 15+ opciones → agrupar por familia, 4-5 visibles, expand. Dashboard → 3-4 stats arriba, detalles con scroll.

---

## Fase 3 — Design system: tokens como source of truth

### Identidad resuelta

Los archivos de referencia: `cupping-tokens.json` (W3C), `cupping-theme.css` (Tailwind v4), `CUPPING_Visual_Identity_v1.md`.

**Resumen ejecutivo:**
- Foundations: cream (#F5EDE0), parchment (#DDD0BD), espresso (#2A1F17)
- Primary: copper ramp 50-900 — CTA en copper-500 (#A8693A)
- Roast levels: 4 colores del grano real (light → dark)
- Flavor families: 10 colores basados en SCA Flavor Wheel
- Rating: tazas de cupping SVG (cup-filled #8B5232, cup-empty #E0D5C6)
- Tipografía: Instrument Serif (display) + Outfit (body) + JetBrains Mono (data)
- Dark mode: "evening cupping session" — fondo espresso, cobre cálido

### Flujo de tokens
```
cupping-tokens.json (source of truth)
  → Figma Variables (diseño)
  → cupping-theme.css / @theme (código)
  → Componentes Shadcn customizados
  → Storybook (documentación viva)
```

### Figma
Figma ya no es solo herramienta de diseño: entre Dev Mode, "Ready for dev", Figma Make, Variables, Slots y el remote MCP server, el flujo diseño→desarrollo es mucho más directo. A marzo de 2026, Slots funciona como funcionalidad en open beta/rollout, y el MCP remoto es la vía recomendada para conectar Figma con editores y agentes sin depender de la app de escritorio.

Tres colecciones: Primitives (oculta), Semantic (publicada, modes Light/Dark), Component (publicada). Variable Modes para Fidelity y Theme.

---

## Fase 4 — De Figma a código

**Componentes base:** Shadcn UI con tokens CUPPING. Copy-paste + customize CSS.
**Componentes hero:** RatingCups, FlavorTags, FlavorWheel — custom desde cero. Son el diferenciador; no pueden ser genéricos.
**Componentes wow:** Aceternity UI para 3D cards, spotlight, particles. Siempre `"use client"`.
**Scaffold de páginas:** v0 de Vercel para layout inicial, luego refinar. Kombai si Figma está limpio.

Limitación universal: ninguna herramienta genera lógica de negocio, animaciones avanzadas, accesibilidad real ni estado dinámico. Eso es manual.

---

## Fase 5 — Arquitectura frontend

### Estructura del proyecto
```
/app
  /(auth)/login, /register
  /(main)
    /layout.tsx → Nav principal
    /page.tsx → Feed o landing
    /dashboard/page.tsx
    /collection/[type]/page.tsx
    /coffee/new/page.tsx | /coffee/[id]/page.tsx | /coffee/[id]/review/page.tsx
    /explore/page.tsx
    /profile/[username]/page.tsx | /profile/settings/page.tsx
/components
  /ui → Shadcn customizados
  /coffee → CoffeeCard, CoffeeForm, RatingCups, FlavorTags, FlavorWheel
  /dashboard → StatsCard, RatingDistribution, TopBrands, Timeline
  /social → FollowButton, ActivityFeed, UserCard
  /layout → Header, Sidebar, MobileNav
  /shared → SearchBar, FilterPanel, EmptyState, LoadingState, ErrorState
/lib
  /supabase, /hooks, /utils, /stores
/types
  /database.ts (generated), /coffee.ts (domain)
```

### Server vs Client Components
Server Components por defecto. `"use client"` solo cuando hay interactividad. Frontera client lo más abajo posible.

### Modelo de datos
Tablas: users, coffees, coffee_entries (con 6 sub-ratings), entry_flavor_tags, collections, collection_items, follows. Supabase RLS para aislamiento de datos por usuario. Types auto-generados con `supabase gen types typescript`.

### Analytics desde el día 1
Vercel Analytics para Web Vitals. Custom events: "café agregado", "rating completado", "filtro usado". Esto alimenta el research post-lanzamiento.

---

## Fase 6 — UI implementation

### Checklist por componente
1. Types explícitos — props tipadas, defaults sensibles
2. Todos los estados — loading (skeleton), error (retry), empty (mensaje + CTA), success
3. Accesible — roles ARIA, keyboard nav, focus management
4. Responsive — mobile-first, testear en 375px, 768px, 1280px
5. Motion — enter/exit con Motion.dev, respetar `prefers-reduced-motion`

### Componentes hero

**RatingCups:** SVG custom de taza con handle. Estados: empty, filled, half, hover. Fill animado (100ms ease-out). Keyboard arrows, aria-valuenow. Permite 0.5 increments.

**FlavorTags:** Chips con color de familia (fondo 20% alpha, texto 100%). Agrupados por familia, máximo 4-5 visibles, expand para más. Multi-select.

**FlavorWheel:** Recharts radar chart, ejes por flavor family, se actualiza con cada review. Copper 30% fill.

### Empty states
Cada pantalla sin datos: ilustración sutil SVG + copy claro + CTA primario. "Todavía no tienes cafés en casa. Agrega tu primer café →"

### Responsive real
Touch targets 44px en móvil. Nav → bottom bar en móvil. Cards de grid a lista en <640px. Form full-screen en móvil, modal en desktop. Dashboard una columna en móvil.

---

## Fase 7 — Performance, accesibilidad y SEO

### Principio
Una web moderna no termina cuando "se ve bien" en local. Debe medirse y protegerse en producción. El mínimo pasa por Core Web Vitals, budgets de JS/CSS, imágenes optimizadas, fuentes bien cargadas, y monitorización real. El objetivo no es rendimiento técnico puro; es reducir fricción perceptiva y mantener respuesta dentro de umbrales que el usuario sienta como inmediatos.

### Core Web Vitals — objetivos
- LCP < 2.5s · INP < 200ms · CLS < 0.1

### Performance checklist
- Imágenes: `next/image` con priority/blur. Supabase Storage transformations
- Fuentes: `next/font/google`, display swap, subsets latin, preload en layout raíz
- Code splitting: Aceternity con `dynamic()` + `ssr: false`. FlavorWheel lazy loaded
- Budgets: First Load JS < 100KB, Total CSS < 50KB
- Monitorización: Vercel Analytics + Lighthouse CI en PRs (threshold 90+)

### Accesibilidad no negociable
- Contraste WCAG 2.1 AA (verificar copper-500 sobre cream)
- Todo el flujo completable con keyboard
- RatingCups: `role="slider"`, aria-valuenow/min/max
- `prefers-reduced-motion` respetado en todas las animaciones
- Focus ring visible en todos los interactivos

### SEO
Metadata dinámica por página, structured data JSON-LD para reviews, sitemap dinámico, og:image.

---

## Fase 8 — QA, release y observabilidad

### Antes de cada deploy
- [ ] `tsc --noEmit` sin errores
- [ ] `eslint .` limpio
- [ ] `next build` exitoso
- [ ] Revisión visual en Chrome, Safari, Firefox + mobile
- [ ] Lighthouse 90+ en los 4 scores

### Testing progresivo
Sprint 0-1: solo type checking + build. Sprint 2+: Vitest para hooks críticos. Sprint 4+: Playwright E2E para flujos completos.

### Deploy
Push a main → deploy automático Vercel. PR → preview URL. Env vars separadas: prod/staging.

### Observabilidad post-launch
- Vercel Logs para errores en real-time
- Vercel Analytics para Web Vitals reales
- Custom events: funnels de visita → registro → primer café → primera review
- Supabase Dashboard: queries lentas, RLS denials, storage

### Experimentación
PostHog (free tier) para feature flags post-MVP. Primer experimento: ¿rating global obligatorio o calculado del promedio de sub-ratings?

### Post-launch review (semana 2)
1. Analytics: ¿dónde abandonan "agregar café"?
2. Heatmaps: ¿usan sub-ratings o solo global?
3. Feedback: ¿qué feature piden más?
4. Decisión: ¿priorizar social o iterar sobre core?

---

## Sprints

### Sprint 0: Setup + Design System (3-4 días)
- [ ] `npx create-next-app@latest cupping` (TS, Tailwind, App Router)
- [ ] Copiar `cupping-theme.css` como config de Tailwind v4
- [ ] `npx shadcn@latest init` + Button, Input, Card, Badge, Dialog, Sheet, Tabs
- [ ] Aceternity: `npx shadcn@latest add @aceternity/3d-card`
- [ ] Supabase: crear schema SQL completo
- [ ] `supabase gen types typescript`
- [ ] Implementar RatingCups (SVG + interacción)
- [ ] Implementar FlavorTag chip
- [ ] Zustand stores: useUIStore, useFilterStore
- [ ] Google Fonts: Instrument Serif, Outfit, JetBrains Mono
- [ ] Deploy inicial a Vercel

### Sprint 1: Core CRUD (5-6 días)
- [ ] Supabase Auth (Google + GitHub)
- [ ] Layout: Header + nav + mobile bottom bar
- [ ] CoffeeForm multi-step (info → ratings → sabores → foto)
- [ ] CoffeeCard, lista con colecciones, detalle, editar/eliminar
- [ ] Upload foto a Supabase Storage

### Sprint 2: Ratings + Filtros (4-5 días)
- [ ] RatingCups interactivo con sub-ratings
- [ ] FlavorTag selector con familias
- [ ] SearchBar + FilterPanel + ordenar
- [ ] Empty states

### Sprint 3: Dashboard (4-5 días)
- [ ] Stats overview, FlavorWheel, distribución ratings
- [ ] Top marcas/orígenes, timeline, contadores de colección

### Sprint 4: Social (5-7 días)
- [ ] Perfil público, follow/unfollow, feed de actividad
- [ ] Explorar cafés comunidad, rating comunitario

### Sprint 5: Polish + Deploy (3-4 días)
- [ ] Animaciones, responsive audit, dark mode
- [ ] SEO, Lighthouse 90+, custom domain + production deploy

---

## Decisiones tomadas

| Decisión | Elegido | Por qué |
|----------|---------|---------|
| Nombre | CUPPING | Auténtico, referencia directa al proceso de cata |
| Concepto | "The Sensory Lab" | Preciso, mesa limpia, café protagonista |
| Color | Copper (#A8693A) | Cuchara de cupping, diferenciador único |
| Display | Instrument Serif | Editorial moderno, trending 2025-2026 |
| Body | Outfit | Geométrica cálida, diferente de Spritz |
| Color space | oklch | Tailwind v4 nativo |
| Rating | Tazas SVG | On-brand, memorable |
| State | Zustand + TanStack Query | ~40% menos bundle que Redux |
| Backend | Supabase | PostgreSQL + Auth + Storage + Realtime |

## Pendientes

- [ ] Idioma: ¿español, inglés, o bilingüe?
- [ ] Sub-ratings: ¿opcionales u obligatorios?
- [ ] Onboarding: ¿quiz de preferencias?

---

*Archivos de referencia: `CUPPING_Visual_Identity_v1.md` · `cupping-theme.css` · `cupping-tokens.json`*
