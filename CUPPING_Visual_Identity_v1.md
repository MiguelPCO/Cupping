# ☕ CUPPING — Visual Identity v1.0
## "The Sensory Lab"

> **Proyecto:** Cupping — Tu ritual de café, documentado
> **Concepto:** Superficies limpias como una mesa de cupping profesional. El color viene exclusivamente del café: tonos cobre, caramelo, chocolate. La interfaz es el lienzo neutral; el café es el protagonista.
> **Fecha:** Marzo 2026

---

## 1. CONCEPTO DE MARCA

### Personalidad
**Cupping** es el proceso profesional de cata de café. Es ritual, sensorial, metódico. La marca hereda esas cualidades:

- **Precisa** — Como un catador evaluando cada dimensión del sabor
- **Cálida** — El calor de una taza recién servida, nunca fría ni clínica
- **Auténtica** — Conocimiento real, no postureo hipster
- **Social** — El cupping es un acto compartido, nunca solitario

### Metáfora visual: "The Sensory Lab"
Imagina la mesa de un tostador de specialty coffee: superficie de madera clara, tazas blancas alineadas, cucharas de cobre pulido, formularios de evaluación impresos en papel cálido. Todo es limpio y funcional, pero la calidez viene del material — madera, cobre, cerámica — y del café mismo.

**La interfaz es la mesa. Los cafés son los protagonistas.**

### Voz y tono
- Conocedora pero accesible ("No necesitas ser barista para disfrutar esto")
- Directa, sin palabrería
- Usa terminología real de café cuando aporta (cupping, body, acidity, notes)
- Nunca condescendiente con quien toma café de cápsula

---

## 2. PALETA DE COLOR

### Arquitectura de 3 niveles (Primitivos → Semánticos → Componente)

### 2.1 Foundations — "La mesa de cupping"
Los colores base que definen el mood general. Neutros cálidos derivados del café.

| Token | Hex | oklch | Uso |
|-------|-----|-------|-----|
| `cream` | `#F5EDE0` | `oklch(0.96 0.02 80)` | Fondo principal (light mode) |
| `parchment` | `#DDD0BD` | `oklch(0.85 0.03 80)` | Bordes, superficies secundarias |
| `linen` | `#EDE4D4` | `oklch(0.92 0.02 80)` | Cards, elevación sutil |
| `espresso` | `#2A1F17` | `oklch(0.22 0.04 50)` | Texto principal, fondo dark mode |
| `espresso-light` | `#4A3B2E` | `oklch(0.32 0.04 50)` | Texto secundario dark mode |

### 2.2 Primary — "La cuchara de cobre"
El cobre de la cuchara de cupping es el acento primario. Transmite calidad artesanal y calidez profesional.

| Token | Hex | oklch | Uso |
|-------|-----|-------|-----|
| `copper-50` | `#FAF0E6` | `oklch(0.96 0.03 70)` | Background hover, selection |
| `copper-100` | `#EDD8C0` | `oklch(0.88 0.05 70)` | Background subtle |
| `copper-200` | `#D4B896` | `oklch(0.78 0.07 65)` | Borders active |
| `copper-300` | `#C9A57A` | `oklch(0.72 0.08 60)` | Icons secondary |
| `copper-400` | `#B8895A` | `oklch(0.64 0.10 58)` | Icons primary |
| `copper-500` | `#A8693A` | `oklch(0.55 0.12 55)` | **CTA principal**, links |
| `copper-600` | `#8B5232` | `oklch(0.46 0.10 50)` | CTA hover, emphasis |
| `copper-700` | `#7A4A25` | `oklch(0.40 0.10 48)` | Active, pressed |
| `copper-800` | `#5C3518` | `oklch(0.32 0.08 45)` | Text on copper-50 |
| `copper-900` | `#3D220E` | `oklch(0.24 0.06 42)` | Darkest accent |

### 2.3 Roast Levels — Semántica del tueste
Cada nivel de tueste tiene un color derivado del tono real del grano.

| Token | Hex | Nombre | Visual |
|-------|-----|--------|--------|
| `roast-light` | `#D4A645` | Light Roast | Dorado trigo — "Cinnamon" |
| `roast-medium` | `#9A6B3A` | Medium Roast | Caramelo — "City" |
| `roast-medium-dark` | `#6B4530` | Medium-Dark | Chocolate — "Full City" |
| `roast-dark` | `#3E2820` | Dark Roast | Carbón — "French/Italian" |

### 2.4 Rating System
| Token | Hex | Uso |
|-------|-----|-----|
| `cup-empty` | `#E0D5C6` | Taza sin llenar (rating pendiente) |
| `cup-filled` | `#8B5232` | Taza llena (rating dado) |
| `cup-half` | `#B8845C` | Media taza (0.5 rating) |
| `cup-hover` | `#A8693A` | Taza en hover |

### 2.5 Flavor Families — Notas de cata
Cada familia de sabor del SCA Flavor Wheel tiene un color asociado. Se usa en tags/chips y en el flavor radar chart.

| Familia | Hex | Background (20% alpha) | Uso |
|---------|-----|----------------------|-----|
| `flavor-chocolate` | `#7B5B3A` | `#7B5B3A33` | Chocolate negro, cacao, brownie |
| `flavor-nutty` | `#9A7D5E` | `#9A7D5E33` | Almendra, avellana, maní |
| `flavor-fruity` | `#C8574E` | `#C8574E33` | Cereza, frambuesa, ciruela |
| `flavor-floral` | `#B87A96` | `#B87A9633` | Jazmín, lavanda, rosa |
| `flavor-citrus` | `#D4A030` | `#D4A03033` | Limón, naranja, bergamota |
| `flavor-spicy` | `#B85430` | `#B8543033` | Canela, pimienta, clavo |
| `flavor-herbal` | `#5A9A6A` | `#5A9A6A33` | Menta, hierba, té verde |
| `flavor-sweet` | `#C9A57A` | `#C9A57A33` | Caramelo, vainilla, miel |
| `flavor-earthy` | `#6B5B4A` | `#6B5B4A33` | Tierra, madera, tabaco |
| `flavor-smoky` | `#5A5048` | `#5A504833` | Ahumado, ceniza, tostado |

### 2.6 Semantic Colors
| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#5A9A6A` | Confirmación, guardado |
| `warning` | `#D4A030` | Atención, pendiente |
| `error` | `#C44030` | Error, eliminar |
| `info` | `#4A7AB0` | Información, links externos |

---

## 3. TIPOGRAFÍA

### Font Stack

| Rol | Fuente | Peso | Fallback | Google Fonts |
|-----|--------|------|----------|-------------|
| **Display** | Instrument Serif | 400 (regular) | Georgia, serif | `?family=Instrument+Serif` |
| **Body** | Outfit | 300, 400, 500, 600 | system-ui, sans-serif | `?family=Outfit:wght@300;400;500;600` |
| **Mono/Data** | JetBrains Mono | 400, 500 | ui-monospace, monospace | `?family=JetBrains+Mono:wght@400;500` |

### Por qué estas fuentes

**Instrument Serif** — Serif editorial con carácter. Elegante sin ser pretenciosa. Las curvas tienen una suavidad orgánica que evoca la forma de una taza. Contrasta bellamente con la sans-serif del body. Trending en diseño editorial 2025-2026.

**Outfit** — Geométrica limpia con calidez. Más suave que Inter, más moderna que DM Sans. Los terminales redondeados le dan un toque humano. Legibilidad excelente en todas las sizes. Diferente de Plus Jakarta Sans (que ya usas en Spritz).

**JetBrains Mono** — Para ratings numéricos, stats, y datos. El monospace da precisión visual a los números de puntuación. Ligaduras opcionales para código.

### Escala Tipográfica

```
Display XL:  Instrument Serif  48px / 1.1  400  → Títulos hero
Display L:   Instrument Serif  36px / 1.15 400  → Títulos de sección
Display M:   Instrument Serif  28px / 1.2  400  → Nombres de café
Display S:   Instrument Serif  22px / 1.25 400  → Subtítulos

Heading L:   Outfit  20px / 1.3  500  → Sección headers
Heading M:   Outfit  18px / 1.3  500  → Card headers
Heading S:   Outfit  16px / 1.3  500  → Labels importantes

Body L:      Outfit  16px / 1.6  400  → Texto principal
Body M:      Outfit  14px / 1.5  400  → Texto secundario
Body S:      Outfit  13px / 1.5  400  → Texto terciario, captions

Label:       Outfit  12px / 1.3  500  → Tags, badges, buttons pequeños
Overline:    Outfit  11px / 1.3  500  → Sección labels, CAPS + tracking

Data L:      JetBrains Mono  18px / 1.3  500  → Rating principal
Data M:      JetBrains Mono  14px / 1.3  400  → Stats, scores
Data S:      JetBrains Mono  12px / 1.3  400  → Meta info
```

---

## 4. ELEMENTOS VISUALES DISTINTIVOS

### 4.1 Rating con tazas de cupping
El hero visual del producto. Cada taza es un SVG custom:
- **Vacía:** Fill `cup-empty`, stroke transparente
- **Llena:** Fill `cup-filled` con handle
- **Media:** Fill dividido horizontal
- **Hover:** Color `cup-hover` con scale 1.05
- **Animación:** Fill sube como café vertiéndose (100ms ease-out)

### 4.2 Flavor Radar Chart
Radar/spider chart personal mostrando tu perfil de sabor basado en todos tus ratings. Cada eje es una familia de sabor. El relleno usa gradiente radial suave. Se actualiza con cada nueva review.

### 4.3 Grain Texture
Fondo con textura sutil de "paper grain" — solo en la landing page y headers principales. Se logra con CSS `background-image` usando SVG noise, no imagen real.

### 4.4 Steam Micro-animation
Al hover en coffee cards: partículas de "vapor" suben suavemente (CSS keyframes, `opacity` + `transform: translateY`). Sutil, no distractora. Respetar `prefers-reduced-motion`.

### 4.5 Roast Level Badge
Pill/badge con gradiente lineal del roast-level color correspondiente. Texto blanco. Border radius pill.

### 4.6 Brew Method Icons
Set custom de iconos SVG para cada método de preparación:
- Espresso machine, Pour over (V60/Chemex), French press, AeroPress
- Moka pot, Drip/Filter, Cold brew, Capsule machine
- Estilo: línea monocromática, 24x24px, stroke-width 1.5px

---

## 5. DARK MODE

### Principio: "Evening cupping session"
El dark mode no invierte colores — simula una sesión de cupping nocturna. Los tonos cobre se calientan ligeramente, el fondo se vuelve espresso profundo.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `bg-primary` | `#FFFFFF` | `#1A1410` |
| `bg-secondary` | `#F5EDE0` | `#241C14` |
| `bg-card` | `#FFFFFF` | `#2A2018` |
| `text-primary` | `#2A1F17` | `#F5EDE0` |
| `text-secondary` | `#6B5B4A` | `#C9A57A` |
| `text-tertiary` | `#9A8B7A` | `#8B7B6A` |
| `border-default` | `#DDD0BD` | `#3E3028` |
| `copper-500` | `#A8693A` | `#C9A57A` |
| `cup-filled` | `#8B5232` | `#C9A57A` |

---

## 6. DESIGN TOKENS — Tailwind CSS v4

```css
/* cupping-theme.css — Tailwind CSS v4 configuration */
@import "tailwindcss";

@theme {
  /* ══════ TYPOGRAPHY ══════ */
  --font-display: "Instrument Serif", Georgia, serif;
  --font-body: "Outfit", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* ══════ FOUNDATIONS ══════ */
  --color-cream: oklch(0.96 0.02 80);
  --color-parchment: oklch(0.85 0.03 80);
  --color-linen: oklch(0.92 0.02 80);
  --color-espresso: oklch(0.22 0.04 50);
  --color-espresso-light: oklch(0.32 0.04 50);

  /* ══════ COPPER RAMP ══════ */
  --color-copper-50: oklch(0.96 0.03 70);
  --color-copper-100: oklch(0.88 0.05 70);
  --color-copper-200: oklch(0.78 0.07 65);
  --color-copper-300: oklch(0.72 0.08 60);
  --color-copper-400: oklch(0.64 0.10 58);
  --color-copper-500: oklch(0.55 0.12 55);
  --color-copper-600: oklch(0.46 0.10 50);
  --color-copper-700: oklch(0.40 0.10 48);
  --color-copper-800: oklch(0.32 0.08 45);
  --color-copper-900: oklch(0.24 0.06 42);

  /* ══════ ROAST LEVELS ══════ */
  --color-roast-light: oklch(0.75 0.12 85);
  --color-roast-medium: oklch(0.55 0.10 60);
  --color-roast-medium-dark: oklch(0.42 0.08 45);
  --color-roast-dark: oklch(0.28 0.06 40);

  /* ══════ RATING ══════ */
  --color-cup-empty: oklch(0.88 0.02 75);
  --color-cup-filled: oklch(0.46 0.10 50);
  --color-cup-half: oklch(0.62 0.09 55);
  --color-cup-hover: oklch(0.55 0.12 55);

  /* ══════ FLAVOR FAMILIES ══════ */
  --color-flavor-chocolate: oklch(0.48 0.08 50);
  --color-flavor-nutty: oklch(0.58 0.07 65);
  --color-flavor-fruity: oklch(0.55 0.14 25);
  --color-flavor-floral: oklch(0.60 0.10 350);
  --color-flavor-citrus: oklch(0.74 0.14 85);
  --color-flavor-spicy: oklch(0.52 0.14 40);
  --color-flavor-herbal: oklch(0.62 0.12 150);
  --color-flavor-sweet: oklch(0.72 0.08 60);
  --color-flavor-earthy: oklch(0.45 0.05 60);
  --color-flavor-smoky: oklch(0.40 0.03 55);

  /* ══════ SEMANTIC ══════ */
  --color-success: oklch(0.62 0.12 150);
  --color-warning: oklch(0.74 0.14 85);
  --color-error: oklch(0.55 0.18 25);
  --color-info: oklch(0.55 0.10 240);

  /* ══════ SPACING ══════ */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 0.75rem;   /* 12px */
  --spacing-lg: 1rem;      /* 16px */
  --spacing-xl: 1.5rem;    /* 24px */
  --spacing-2xl: 2rem;     /* 32px */
  --spacing-3xl: 3rem;     /* 48px */
  --spacing-4xl: 4rem;     /* 64px */

  /* ══════ BORDER RADIUS ══════ */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* ══════ SHADOWS (light, café-tinted) ══════ */
  --shadow-sm: 0 1px 2px oklch(0.22 0.04 50 / 0.06);
  --shadow-md: 0 4px 12px oklch(0.22 0.04 50 / 0.08);
  --shadow-lg: 0 8px 24px oklch(0.22 0.04 50 / 0.12);

  /* ══════ BREAKPOINTS ══════ */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;

  /* ══════ ANIMATION ══════ */
  --ease-out-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 400ms;
}

/* ══════ DARK MODE OVERRIDES ══════ */
@media (prefers-color-scheme: dark) {
  :root {
    --color-cream: oklch(0.15 0.02 50);
    --color-parchment: oklch(0.25 0.03 50);
    --color-linen: oklch(0.18 0.02 50);
    --color-cup-filled: oklch(0.72 0.08 60);
    --color-cup-empty: oklch(0.30 0.03 55);
  }
}

/* ══════ DATA ATTRIBUTES FOR FLAVOR THEMING ══════ */
[data-flavor="chocolate"] { --flavor-color: var(--color-flavor-chocolate); }
[data-flavor="nutty"]     { --flavor-color: var(--color-flavor-nutty); }
[data-flavor="fruity"]    { --flavor-color: var(--color-flavor-fruity); }
[data-flavor="floral"]    { --flavor-color: var(--color-flavor-floral); }
[data-flavor="citrus"]    { --flavor-color: var(--color-flavor-citrus); }
[data-flavor="spicy"]     { --flavor-color: var(--color-flavor-spicy); }
[data-flavor="herbal"]    { --flavor-color: var(--color-flavor-herbal); }
[data-flavor="sweet"]     { --flavor-color: var(--color-flavor-sweet); }
[data-flavor="earthy"]    { --flavor-color: var(--color-flavor-earthy); }
[data-flavor="smoky"]     { --flavor-color: var(--color-flavor-smoky); }

/* ══════ DATA ATTRIBUTES FOR ROAST THEMING ══════ */
[data-roast="light"]       { --roast-color: var(--color-roast-light); }
[data-roast="medium"]      { --roast-color: var(--color-roast-medium); }
[data-roast="medium-dark"] { --roast-color: var(--color-roast-medium-dark); }
[data-roast="dark"]        { --roast-color: var(--color-roast-dark); }
```

---

## 7. DESIGN TOKENS — W3C Format (JSON)

```json
{
  "$type": "color",
  "$description": "Cupping Design Tokens v1.0",
  "foundations": {
    "cream":      { "$value": "#F5EDE0", "$description": "Primary background" },
    "parchment":  { "$value": "#DDD0BD", "$description": "Borders, secondary surfaces" },
    "linen":      { "$value": "#EDE4D4", "$description": "Card backgrounds" },
    "espresso":   { "$value": "#2A1F17", "$description": "Primary text" }
  },
  "copper": {
    "50":  { "$value": "#FAF0E6" },
    "100": { "$value": "#EDD8C0" },
    "200": { "$value": "#D4B896" },
    "300": { "$value": "#C9A57A" },
    "400": { "$value": "#B8895A" },
    "500": { "$value": "#A8693A", "$description": "Primary CTA" },
    "600": { "$value": "#8B5232" },
    "700": { "$value": "#7A4A25" },
    "800": { "$value": "#5C3518" },
    "900": { "$value": "#3D220E" }
  },
  "roast": {
    "light":       { "$value": "#D4A645" },
    "medium":      { "$value": "#9A6B3A" },
    "medium-dark": { "$value": "#6B4530" },
    "dark":        { "$value": "#3E2820" }
  },
  "rating": {
    "cup-empty":  { "$value": "#E0D5C6" },
    "cup-filled": { "$value": "#8B5232" },
    "cup-half":   { "$value": "#B8845C" },
    "cup-hover":  { "$value": "#A8693A" }
  },
  "flavor": {
    "chocolate": { "$value": "#7B5B3A" },
    "nutty":     { "$value": "#9A7D5E" },
    "fruity":    { "$value": "#C8574E" },
    "floral":    { "$value": "#B87A96" },
    "citrus":    { "$value": "#D4A030" },
    "spicy":     { "$value": "#B85430" },
    "herbal":    { "$value": "#5A9A6A" },
    "sweet":     { "$value": "#C9A57A" },
    "earthy":    { "$value": "#6B5B4A" },
    "smoky":     { "$value": "#5A5048" }
  }
}
```

---

## 8. FIGMA SETUP GUIDE

### Collections a crear

**1. Primitives (oculta de publicación)**
- `color/cream`, `color/parchment`, `color/linen`, `color/espresso`
- `color/copper/50` ... `color/copper/900`
- `color/roast/light` ... `color/roast/dark`
- `color/flavor/chocolate` ... `color/flavor/smoky`
- `spacing/xs` ... `spacing/4xl`
- `radius/sm` ... `radius/full`

**2. Semantic (publicada)**
- `bg/primary` → refs `cream` (light) / `espresso` (dark)
- `bg/secondary` → refs `linen` / adjusted dark
- `bg/card` → refs `#FFFFFF` / dark card
- `text/primary` → refs `espresso` / `cream`
- `text/secondary` → refs `espresso-light` / `copper-300`
- `accent/primary` → refs `copper-500` / `copper-300`
- `accent/hover` → refs `copper-600` / `copper-400`
- `border/default` → refs `parchment` / dark border
- Modes: **Light**, **Dark**

**3. Component-specific (publicada)**
- `button/bg` → refs `accent/primary`
- `button/text` → refs `#FFFFFF`
- `card/bg` → refs `bg/card`
- `card/border` → refs `border/default`
- `rating/filled` → refs `cup-filled`
- `rating/empty` → refs `cup-empty`
- `tag/[flavor]/bg` → refs cada flavor al 20% alpha
- `tag/[flavor]/text` → refs cada flavor al 100%

### Variable Modes
- **Fidelity:** Low (wireframe grays) / Mid (brand colors, no images) / High (full visual)
- **Theme:** Light / Dark
- **Roast:** Ninguno / Light / Medium / Medium-Dark / Dark (afecta badges y detalles contextuales)

---

## 9. RESUMEN DE DECISIONES

| Decisión | Elegido | Alternativa descartada | Por qué |
|----------|---------|----------------------|---------|
| Nombre | CUPPING | BREW, SIP, MOKA | Auténtico, profesional, transmite expertise |
| Concepto visual | "The Sensory Lab" | "Warm Craft Journal" | Más preciso, menos genérico hipster |
| Color primario | Copper (#A8693A) | Terracotta, Amber | Referencia directa a la cuchara de cupping |
| Display font | Instrument Serif | Playfair Display, Fraunces | Editorial moderno, no recargado |
| Body font | Outfit | DM Sans, Plus Jakarta | Diferenciación de Spritz, geometría cálida |
| Espacio de color | oklch | hex | Tailwind v4 nativo, mejor perceptual uniformity |
| Rating visual | Tazas de cupping SVG | Estrellas, números | Diferenciación total, on-brand |
| Flavor system | Familias con color propio | Color único para todos | Reconocimiento visual instantáneo |

---

*Siguiente paso: Sprint 0 — Setup del proyecto + implementar design tokens en código*
*Alternativo: Diseñar el componente RatingCups en detalle (SVG + interacción)*
