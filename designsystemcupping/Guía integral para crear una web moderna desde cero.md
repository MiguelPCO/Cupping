# Guía integral para crear una web moderna desde cero

**Crear una página web moderna en 2025-2026 exige dominar un flujo de trabajo end-to-end que abarca desde la investigación de usuarios hasta las animaciones en producción.** Este documento presenta ese flujo completo, organizado en 8 fases accionables, con herramientas específicas, patrones de código y decisiones de diseño fundamentadas en evidencia. Está orientado a un frontend developer con experiencia en React/TypeScript que también estudia UX/UI, y complementa —sin repetir— la documentación existente sobre arquitectura integral de desarrollo web y Brand Design Systems en Figma.

El panorama tecnológico ha cambiado drásticamente: **GSAP es ahora 100% gratuito** tras la adquisición de GreenSock por Webflow, Tailwind CSS v4 reescribió su motor en Rust con builds 5× más rápidos, Figma introdujo MCP Server para conectar diseño con IDEs de IA, y el **80% de los investigadores UX ya usan IA** en su flujo de trabajo. Este documento integra todas estas novedades.

---

## Fase 1: investigación UX como cimiento de todo el proyecto

Ninguna decisión de diseño o desarrollo debería tomarse sin antes entender al usuario. La investigación UX no es un paso opcional previo al diseño; es la infraestructura sobre la que se sostiene cada decisión posterior.

### El Double Diamond en la práctica

El framework Double Diamond, creado por el British Design Council en 2005, organiza el proceso creativo en dos diamantes: el **Espacio del Problema** y el **Espacio de la Solución**. Cada diamante alterna entre pensamiento divergente (explorar ampliamente) y convergente (sintetizar y decidir).

**Diamante 1 — Descubrir y Definir.** En la fase Discover se lanza una red amplia: entrevistas con usuarios, análisis de competidores, revisión de analytics, service safaris. Se recoge todo sin filtrar. En Define se sintetiza: se crean personas, journey maps y problem statements. El entregable es un **design brief** claro que guía todo lo que sigue. Un error común es saltar directamente a soluciones; este diamante obliga a entender el problema primero.

**Diamante 2 — Desarrollar y Entregar.** En Develop se generan múltiples soluciones mediante ideación colaborativa, sketches y wireframes de baja fidelidad. En Deliver se prototipa, se testea con usuarios reales y se refina iterativamente. El proceso no es lineal: si el problema y la solución son evidentes (por ejemplo, un cambio de microcopy), se puede comprimir o saltar fases.

### Plan de investigación en 5 pasos

El flujo operativo de un estudio de UX Research sigue esta secuencia:

1. **Definir objetivos y problema.** Preguntas como "¿qué no sabemos?" y "¿qué debe ser verdad para considerar esta investigación completa?" alinean al equipo. Se formulan research questions específicas y accionables.
2. **Seleccionar métodos y herramientas.** La elección depende de la etapa del producto, el tipo de datos necesarios (cualitativos/cuantitativos, actitudinales/conductuales) y las restricciones de presupuesto y tiempo. La regla de Nielsen indica que **5 usuarios descubren ~85% de los problemas de usabilidad**, pero esto aplica solo a testing cualitativo con grupos homogéneos.
3. **Reclutar y ejecutar trabajo de campo.** Se reclutan 5-10 participantes por pregunta de investigación, con un buffer del 10-20% por no-shows. Se usan guías de entrevista con preguntas abiertas, evitando sesgo del moderador.
4. **Analizar y sintetizar.** Se transcriben las sesiones, se aplica análisis temático (codificación, clustering, identificación de patrones) y se usa affinity mapping en herramientas como Miro o FigJam. Se combinan insights cualitativos con datos cuantitativos.
5. **Entregar recomendaciones.** Se crean reportes claros y accionables adaptados a la audiencia. Los entregables incluyen personas, journey maps, highlight reels y decks de investigación. Se evita la jerga UX para audiencias no técnicas.

### Métodos cuantitativos y cualitativos

Los métodos cuantitativos incluyen **analytics web** (GA4, Mixpanel, Amplitude), **encuestas** (Typeform, Sprig para in-context), **A/B testing** (PostHog, VWO), **heatmaps** (Hotjar, Crazy Egg) y **análisis de funnels**. Los métodos cualitativos comprenden **entrevistas** (Lookback, Marvin para IA-moderadas), **contextual inquiry**, **diary studies** (dscout), **card sorting** y **tree testing** (Optimal Workshop, UXtweak).

La mejor práctica en 2025-2026 es combinar ambos tipos. Los equipos maduros usan mixed-methods por defecto: profundidad cualitativa para entender el "por qué" y amplitud cuantitativa para medir el "cuánto".

### IA en la investigación UX: acelerador, no reemplazo

Según el State of User Research Report 2025, el **80% de los investigadores UX usan IA**, un aumento de 24 puntos porcentuales interanual. Las aplicaciones más fuertes son análisis de datos (**74%**), transcripción (**58%**) y generación de preguntas de investigación (**54%**).

Las herramientas líderes incluyen Maze AI Moderator (entrevistas automatizadas a escala), Dovetail (repositorio de investigación con análisis de sentimiento y auto-tagging), Looppanel (transcripción con 90%+ de precisión y codificación automática) y Miro AI (clustering automático de notas adhesivas). Sin embargo, según Nielsen Norman Group (actualizado enero 2026), **la IA no puede reemplazar el análisis humano**: pierde matices, sarcasmo, cambios emocionales y significado implícito. La IA funciona mejor como "un pasante" que necesita instrucciones detalladas, contexto y correcciones constantes.

**Stack recomendado por tamaño de equipo:**
- **Solo/equipo pequeño:** Maze (free tier) + Hotjar (free tier) + Claude/ChatGPT para planificación
- **Equipo mediano:** Maze + Dovetail + Optimal Workshop + Sprig
- **Enterprise:** UserTesting + Dovetail + Optimal Workshop + FullStory

---

## Fase 2: psicología cognitiva que define cada decisión de interfaz

Las leyes de UX no son teoría abstracta; son principios basados en décadas de investigación en psicología cognitiva que determinan si un usuario completa una tarea o abandona la página.

### Hick, Fitts y Miller: el trío esencial

**La Ley de Hick** establece que el tiempo de decisión aumenta con el número y complejidad de opciones. En la práctica: limitar la navegación principal a **5-7 ítems**, presentar UN solo CTA primario por pantalla, dividir formularios largos en pasos y usar progressive disclosure. Google Search es el ejemplo canónico: un input, una acción.

**La Ley de Fitts** dice que el tiempo para alcanzar un objetivo depende de su tamaño y distancia. Los targets táctiles mínimos son **44×44px** (Apple) o **48×48dp** (Material Design). Las acciones principales deben ubicarse en las zonas naturales del pulgar en móvil. En 2026, la aplicación va más allá de "hacer el botón más grande": si se agregan controles de IA (respuestas inteligentes, ediciones sugeridas), deben ser tan fáciles de deshacer como de activar.

**La Ley de Miller** afirma que la memoria de trabajo retiene ~7 (±2) elementos. No se trata del número exacto sino del hecho de que la sobrecarga ocurre más rápido de lo esperado. Los dashboards, páginas de precios y pantallas de configuración son los infractores habituales. El principio derivado es "reconocimiento sobre recuerdo": si el usuario necesita memorizar reglas o códigos mientras navega, la interfaz está haciendo demasiado.

### Gestalt: cómo el cerebro organiza la información visual

Los principios Gestalt determinan cómo los usuarios perciben agrupaciones en una interfaz. **Proximidad**: elementos cercanos se perciben como relacionados (agrupar labels con sus campos de formulario, separar secciones con whitespace). **Similitud**: elementos con rasgos visuales compartidos (color, forma) se ven como un grupo (estilos consistentes de botones, categorías codificadas por color). **Continuidad**: el ojo sigue el camino más fluido (sliders horizontales de productos, grids alineados). **Cierre**: el cerebro completa formas incompletas (imágenes parciales en carruseles que invitan al scroll). **Figura-fondo**: distinguimos objetos de su contexto (modales con overlay, dropdowns con sombra). **Región común**: elementos dentro de un borde se perciben agrupados (diseño basado en cards).

### Von Restorff, Jakob y el umbral de Doherty

El **efecto Von Restorff** dice que el elemento que difiere del resto será el más recordado. Aplicación directa: hacer el CTA primario visualmente distinto, destacar el plan "recomendado" en tablas de precios con color diferente y badge. La clave en 2026: usar contraste y énfasis como un presupuesto limitado. Gastarlo en la **única acción que verdaderamente importa**.

**La Ley de Jakob** recuerda que los usuarios pasan la mayor parte de su tiempo en *otros* sitios. Prefieren que tu web funcione igual que las que ya conocen. Logo arriba-izquierda enlazando a home, barra de navegación arriba, carrito de compras arriba-derecha, filtros en sidebar izquierdo. La innovación debe ser gradual: si introduces una interacción nueva (gesture, comando de IA), enséñala rápido con cues ligeros y mantén un fallback familiar.

El **umbral de Doherty** establece que la productividad se dispara cuando la respuesta del sistema es inferior a **400ms**. La percepción importa tanto como la velocidad real: skeleton screens, optimistic UI updates y micro-animaciones crean la ilusión de inmediatez. La **Peak-End Rule** de Kahneman complementa: los usuarios juzgan una experiencia por su momento más intenso y por cómo termina. Invertir esfuerzo de diseño en el onboarding (el peak) y en la confirmación final (el end) genera experiencias memorables.

---

## Fase 3: sistemas de diseño y la arquitectura de tokens

Un design system no es una biblioteca de componentes bonitos: es un contrato vivo entre diseño y desarrollo que garantiza consistencia, velocidad y escalabilidad.

### Atomic Design como modelo mental, no como dogma

La metodología de Brad Frost organiza la UI en cinco niveles: **Átomos** (Button, Input, Label, Icon), **Moléculas** (SearchBar = Label + Input + Button), **Organismos** (Header = Logo + Nav + SearchBar), **Templates** (layouts con contenido placeholder) y **Páginas** (templates con contenido real). En 2025, la nomenclatura rígida importa menos que el concepto: construir UI como un sistema de piezas componibles.

La evolución actual agrega capas emergentes: "Iones" (decisiones sub-atómicas como motion y micro-interacciones) y design tokens como capa paralela. Para aplicaciones con lógica de negocio compleja, se complementa con **Feature-Sliced Design**, que organiza por funcionalidad (`features/auth/`, `features/billing/`) manteniendo los UI primitives compartidos en `components/ui/`.

### Design tokens: el puente entre Figma y código

Los design tokens son **entidades nombradas que almacenan decisiones de diseño** (colores, tipografía, spacing, sombras) en formato agnóstico de plataforma. En 2025, el **84% de los equipos los han adoptado**. La distinción clave: tokens ≠ Figma Variables. Los tokens son la receta; las variables son cómo se cocina en cada herramienta.

La arquitectura de tokens se organiza en tres niveles. **Primitivos/Globales** almacenan valores crudos (`--color-blue-500: #3B82F6`). **Semánticos/Alias** referencian por propósito (`--color-primary: var(--color-blue-500)`). **Específicos de componente** acotan al contexto (`--button-bg-primary: var(--color-primary)`). Esta jerarquía permite cambiar toda la paleta de un producto modificando solo los primitivos.

**El flujo de implementación es:** crear colección Primitiva en Figma (oculta de publicación) → crear colección Semántica referenciando primitivos → agregar modos para temas light/dark → aplicar tokens a componentes → exportar con **Tokens Studio** a JSON (formato W3C Design Tokens) → sincronizar a GitHub → transformar con **Style Dictionary** de Amazon → generar CSS variables, iOS Swift o Android XML según plataforma.

### Documentación del design system

La combinación recomendada en 2025-2026 es **Storybook** para desarrollo de componentes en aislamiento (free, open-source, soporta React/Vue/Angular/Svelte), **Chromatic** para testing de regresión visual y hosting de Storybook, y **ZeroHeight** para documentación cross-funcional con editor WYSIWYG, sync con Figma y Storybook, y features de IA para generación y refinamiento de contenido. ZeroHeight ha lanzado integración MCP para herramientas de coding con IA como Claude y Cursor.

---

## Fase 4: de Figma a código con el workflow de 2026

El flujo de trabajo en Figma ha evolucionado de simple herramienta de diseño a plataforma integral de desarrollo de producto, con IA nativa, variables avanzadas y conexión directa a IDEs.

### Wireframes con fidelity modes

El proceso tradicional (wireframe low-fi → mid-fi → high-fi) se ha transformado con los **Fidelity Modes** de Figma: los componentes se construyen con Variables que cambian de valor según un modo "Fidelity" (Low, Mid, High). **Un solo clic** transforma un diseño completo de wireframe a mockup de alta fidelidad, eliminando la necesidad de mantener archivos separados por nivel de fidelidad.

La mejor práctica es construir wireframes usando componentes desde el inicio (approach de design system), aplicar Auto Layout para comportamiento responsive, y nombrar las capas descriptivamente. Los wireframes de baja fidelidad se usan para testing con usuarios; los de alta fidelidad para presentaciones a stakeholders.

### Figma en 2025-2026: variables, slots y AI

**Auto Layout** ahora incluye **Grid layout** (Config 2025) que genera CSS Grid limpio en Dev Mode. **Variables** soportan Color, Number, String y Boolean, con tipos Composite/Array próximamente. Las **Collections** organizan tokens por propósito y los **Modes** habilitan temas light/dark, breakpoints responsivos y variaciones multi-marca. El rendimiento de switching entre variables y modos mejoró **30-60%** tras la reescritura de 2025.

Los **Slots** (Config 2025) permiten instancias dinámicas de componentes: agregar opciones de menú, botones o iconos sin detach. **Figma Make** genera prototipos de alta fidelidad desde prompts de texto. **Check Designs** usa IA para identificar automáticamente variables que deben alinearse con el design system. El **Figma MCP Server** (ahora remoto, sin requerir desktop) conecta datos de Figma directamente a IDEs de IA como VS Code, Cursor, Windsurf y Claude.

### Dev Mode y Code Connect

El Dev Mode ha evolucionado a un **workspace de desarrollo con IA**. Los diseñadores marcan frames como "Ready for dev"; los desarrolladores filtran solo esos frames en Focus View. **Compare Changes** muestra diffs visuales y de código entre versiones. El **Component Playground** permite explorar todas las variaciones de un componente con snippets de código. **Code Connect** vincula componentes de Figma con código real (React, React Native, SwiftUI, Jetpack Compose), mostrando ejemplos de uso y props en lugar de snippets auto-generados. La nueva UI de Code Connect permite conectar repositorios de GitHub y usar sugerencias de IA para mapear archivos de código sin necesidad de programar.

### Herramientas AI design-to-code: comparativa honesta

**Kombai** produce el código más limpio y production-ready. Usa modelos ensemble entrenados específicamente para design-to-code (no LLMs genéricos), escanea tu repositorio para reutilizar componentes existentes, maneja archivos Figma desordenados y soporta **30+ librerías frontend** incluyendo Shadcn UI. Es la primera herramienta que "se siente construida para un desarrollador".

**Builder.io Visual Copilot** usa un pipeline de IA de tres etapas con 2M+ puntos de entrenamiento. Soporta React, Vue, Svelte, Angular. Su feature de **Component Mapping** mapea tus componentes existentes a Figma vía CLI, generando código que usa TUS componentes. Produce output de calidad media-alta que requiere revisión.

**v0 de Vercel** genera componentes React/Next.js con Tailwind CSS y Shadcn UI desde prompts de texto o screenshots. Es el "acelerador de UI más creíble para equipos ya en React/Next.js", ideal para evitar la página en blanco. Solo soporta React/Tailwind y requiere cableado manual de estado, validación y data fetching.

**Locofy** ofrece one-click auto-optimization y soporta múltiples frameworks. Es más amigable para principiantes pero puede perder elementos de media y fuentes custom. **Anima** tiene 1.4M+ instalaciones en Figma y partnership con Bolt.new.

**Limitación universal de todas las herramientas:** la lógica de negocio compleja, animaciones avanzadas, accesibilidad y gestión de estado dinámico requieren desarrollo manual. Archivos Figma bien estructurados (Auto Layout, naming correcto, componentes) mejoran dramáticamente la calidad del output.

---

## Fase 5: arquitectura frontend con Next.js, Tailwind y componentes modernos

La arquitectura frontend moderna en 2025-2026 se basa en tres pilares: Next.js App Router con React Server Components, Tailwind CSS v4 con configuración CSS-first, y librerías de componentes copy-paste lideradas por Shadcn UI.

### Estructura de proyecto Next.js recomendada

El App Router de Next.js (estable desde v13.4, maduro en v15+) usa file-system routing con convenciones de archivos especiales. La estructura recomendada organiza `/app` para rutas (con `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), `/components/ui/` para primitivos reutilizables (átomos y moléculas), `/components/features/` para componentes de lógica de negocio (organismos), `/lib/` para utilidades y clientes API, `/hooks/` para hooks custom, `/stores/` para estado con Zustand, y `/types/` para definiciones TypeScript.

Los **Route Groups** (`(marketing)/`, `(dashboard)/`) organizan rutas sin afectar URLs. Los **Parallel Routes** (`@desktop`, `@mobile`) permiten renderizado específico por dispositivo. **Partial Prerendering (PPR)** pre-renderiza el shell estático y transmite contenido dinámico vía Suspense, combinando lo mejor de SSG y SSR.

La regla de oro para Server vs Client Components: **Server Components por defecto** (data fetching, acceso a backend, reducción de JS en cliente). Se agrega `"use client"` **solo cuando hay interactividad** (useState, useEffect, event handlers, browser APIs). Mantener la frontera client lo más abajo posible en el árbol de componentes.

### Tailwind CSS v4: la revolución CSS-first

Tailwind v4, lanzado el 22 de enero de 2025, reescribió su motor en **Rust (Oxide Engine)** con builds completos **5× más rápidos** y builds incrementales **100×+ más rápidos**. El cambio más significativo es la **configuración CSS-first** que reemplaza `tailwind.config.js`:

```css
@import "tailwindcss";
@theme {
  --font-display: "Satoshi", "sans-serif";
  --color-brand-500: oklch(0.72 0.19 240);
  --breakpoint-3xl: 1920px;
}
```

Las novedades clave incluyen CSS `@layer` nativo (resuelve problemas de especificidad), `@property` para custom properties registradas, `color-mix()` para modificadores de opacidad, **container queries** en el core (`@min-*`, `@max-*`), espacio de color oklch para gamut amplio, y detección automática de archivos sin configuración. Tailwind v4.1 agregó text shadows y masks; v4.2 soporte para vanilla JS en Tailwind Plus (antes Tailwind UI). El requisito mínimo de navegador es Safari 16.4+, Chrome 111+, Firefox 128+.

### Shadcn UI como base, Aceternity y ReactBits como complemento

**Shadcn UI** es la librería de componentes dominante en 2025. Su filosofía es copy-paste: los componentes se copian a tu proyecto, no se instalan como dependencia npm. Construido sobre **Radix UI** (accesibilidad excelente) + Tailwind CSS, ofrece **50+ componentes** funcionales. Se instalan con `npx shadcn@latest add button`. Empresas como OpenAI, Sonos y Adobe lo usan. En octubre 2025 se agregaron Spinner, Kbd, ButtonGroup, InputGroup, Field (compatible con React Hook Form, TanStack Form y Server Actions), Item y Empty.

**Aceternity UI** se enfoca en componentes con animaciones intensivas para landing pages y marketing: 3D Card Effect, Aurora Background, Globe, Hero Parallax, Typewriter Effect y **200+ componentes** construidos con Tailwind + Motion (Framer Motion). Todos requieren `"use client"`. Es compatible con Shadcn CLI: `npx shadcn@latest add @aceternity/animated-modal`. El pass de acceso completo cuesta **$199 lifetime**.

**ReactBits** ofrece **135+ componentes** de animación creativa, cada uno en **4 variantes** (JS-CSS, JS-Tailwind, TS-CSS, TS-Tailwind). Es completamente gratuito y open-source, con dependencias mínimas.

**21st.dev** funciona como "npm para design engineers": un marketplace comunitario de componentes compatibles con Shadcn UI, con **1.4M+ desarrolladores** y respaldo de Y Combinator W26. Se instalan con `npx shadcn@latest add "https://21st.dev/r/author/component"`.

### Estado: Zustand + TanStack Query como dúo ganador

El consenso en 2025 es claro: **Zustand** (líder en satisfacción en State of React 2025, ~1.2KB) para estado del cliente (UI, preferencias, modales, temas) y **TanStack Query v5** (~13KB) para estado del servidor (datos de API, caché, revalidación). Esta combinación reduce ~40% el tamaño del bundle versus configuraciones con Redux. Para estado atómico de grano fino (formularios complejos, editores), **Jotai** (~4KB) es la alternativa. React Context + useState siguen siendo válidos para apps simples sin dependencias adicionales.

---

## Fase 6: animaciones que comunican, no que decoran

Cada animación en una web moderna debe comunicar algo: un cambio de estado, una relación espacial, una dirección de atención. En 2025-2026, las dos herramientas dominantes son GSAP y Motion.dev, con perfiles complementarios.

### GSAP: ahora gratuito y más poderoso que nunca

Desde el **30 de abril de 2025, GSAP es 100% gratuito** para todos, incluyendo todos los plugins premium anteriores (ScrollTrigger, ScrollSmoother, SplitText, MorphSVG, DrawSVG, Flip, CustomEase). Esto ocurrió tras la adquisición de GreenSock por Webflow a finales de 2024. La licencia es propietaria de Webflow (no MIT), con la restricción principal de no construir herramientas de animación visual que compitan con Webflow.

La integración con React/Next.js usa el hook oficial **`useGSAP`** (`@gsap/react`), que reemplaza `useEffect` con cleanup automático vía `gsap.context()`, selectores scoped al contenedor, compatibilidad con SSR y React 18 Strict Mode. Los plugins se registran una vez centralmente en un client component provider.

**ScrollTrigger** es donde GSAP brilla sin rival. Conecta la posición del scroll con el estado de animación, soporta scrub (vinculación directa al progreso del scroll), pin (fijar elementos durante la animación), snap (anclar a puntos específicos), y marcadores de debug. El patrón de scrollytelling combina Timeline con ScrollTrigger para secuencias complejas scroll-driven con pinning y scrubbing.

La regla fundamental de GSAP: usar `scrub` para progreso vinculado al scroll O `toggleActions` para play/reverse discretos, **nunca ambos**. ScrollTrigger va en el timeline o tween de nivel superior, no en tweens hijos. Cuando se fija un elemento, se animan sus **hijos**, no el elemento fijado mismo.

### Motion.dev: el estándar declarativo para React

Framer Motion se renombró a **Motion** a mediados de 2025, ahora como proyecto independiente con licencia **MIT** (irrevocable). El paquete es `motion` en npm, el import es `"motion/react"`. La versión actual es **v12** con soporte para oklch/oklab, animaciones de scroll hardware-accelerated vía ScrollTimeline API nativa, y `layoutAnchor` para puntos de ancla personalizados.

Motion destaca en cuatro áreas. **AnimatePresence** resuelve animaciones de entrada/salida con `mode="wait"` (espera exit antes de enter). **Layout animations** con `layoutId` crean transiciones de "magic move" entre elementos compartidos, con corrección automática de escala — una característica líder en la industria. **Gestures** declarativos (`whileHover`, `whileTap`, `drag`) simplifican interacciones complejas. **Scroll animations** con `useScroll` y `useTransform` aprovechan la ScrollTimeline API nativa del navegador para animaciones **GPU-accelerated** que mantienen 60/120fps incluso cuando JavaScript está bloqueado.

### Cuándo usar cada uno y cómo combinarlos

**Elegir GSAP cuando:** scrollytelling complejo con pinning y scrubbing, animaciones SVG (MorphSVG y DrawSVG no tienen rival), orquestación de timelines mutables, integración con Canvas/WebGL/Three.js, o control pixel-perfect sobre cada frame.

**Elegir Motion cuando:** proyecto React/Next.js priorizando developer experience, transiciones de UI y página, layout animations con elementos compartidos, interacciones basadas en gestos, animaciones de entrada/salida, performance crítico con hardware acceleration, o necesidad de licencia MIT sin riesgo corporativo.

**Coexisten perfectamente** en el mismo proyecto: Motion para animaciones de UI (transiciones de página, enter/exit, hover states, layout animations) y GSAP para secuencias scroll-driven complejas, morphing SVG y Canvas/WebGL. Operan en paradigmas diferentes (declarativo vs imperativo) y no generan conflictos.

### Optimización de rendimiento: las reglas no negociables

Las propiedades GPU-accelerated son `transform` (translate, scale, rotate), `opacity`, `filter` y `clipPath`. **Nunca animar** `width`, `height`, `margin`, `top`, `left` (disparan layout) ni `box-shadow` o `border-radius` (disparan paint). Usar `filter: drop-shadow()` en lugar de `boxShadow` y `clipPath: inset(0 round 50px)` en lugar de `borderRadius` para composición GPU.

Las duraciones recomendadas son: micro-interacciones **100-300ms**, transiciones de UI **200-500ms**, transiciones de página **300-600ms**. Usar `ease-out` para entradas, `ease-in` para salidas, `ease-in-out` para cambios de estado. Stagger de elementos hijos entre 50-100ms. Siempre respetar `prefers-reduced-motion` con `useReducedMotion()` en Motion o `gsap.matchMedia()` en GSAP.

---

## Fase 7: testing y validación basados en evidencia

Diseñar sin testear es adivinar. Testear sin metodología es perder tiempo. Esta fase cubre los tres pilares de validación: usability testing, A/B testing y validación de arquitectura de información.

### Usability testing: moderar o no moderar

El **testing moderado** involucra un facilitador en vivo que guía a participantes, hace follow-ups y observa lenguaje corporal. Es más costoso y menos escalable, pero produce insights cualitativos profundos. Ideal para prototipado temprano y workflows complejos. El **testing no moderado** permite que participantes completen tareas independientemente usando plataformas como Maze o Lyssna. Es rápido (resultados el mismo día), económico y escalable. Ideal para prototipos de alta fidelidad y recolección de datos cuantitativos.

La regla de los 5 usuarios de Nielsen aplica **solo** a testing cualitativo con grupos homogéneos. Para estudios cuantitativos se necesitan **30+ participantes**. Para card sorting y tree testing, **50-150 participantes**. La recomendación real de Nielsen es iterativa: **3 rondas de 5 usuarios** a lo largo de iteraciones de diseño, no una sola ronda de 15.

Las métricas fundamentales son **Task Success Rate** (>80% = bueno, >90% = excelente), **Time on Task** (media geométrica para distribuciones sesgadas), **Error Rate**, **SUS** (System Usability Scale, 10 preguntas, score 0-100 donde 68 es el promedio y 80+ es excelente) y **SEQ** (Single Ease Question, escala de 7 puntos post-tarea).

### A/B testing: rigor estadístico o nada

La hipótesis sigue la estructura: "Si cambiamos [X], entonces [métrica Y] [aumentará/disminuirá] porque [razón basada en research/datos]". Se cambia **una sola variable** a la vez. El umbral de significancia estadística es **95% de confianza** (p-value < 0.05). Se requiere un mínimo de **30,000+ visitantes por variación** para resultados confiables. Los tests deben ejecutarse durante **2-4 semanas** completas para capturar efectos de día y hora. Nunca mirar resultados anticipadamente para decidir parar el test.

Tras el sunset de Google Optimize (septiembre 2023), las alternativas dominantes son **PostHog** (open-source, análisis bayesiano, free tier generoso), **VWO** (all-in-one CRO con heatmaps y recordings), **GrowthBook** (open-source, warehouse-native), y **Statsig** (análisis real-time, enterprise-scale). Para feature flags y rollouts progresivos, **LaunchDarkly** lidera con rollouts granulares (0.001%) y **Unleash** ofrece la alternativa open-source con filosofía privacy-first.

### Validación de arquitectura de información

El framework óptimo es secuencial: **Card sorting abierto** (30-50 participantes) para descubrir modelos mentales → **Definir IA** basándose en los resultados → **Tree testing** (50-150 participantes) para validar findability → **First-click testing** en diseños para verificar navegación → **Iterar** con modificaciones. La investigación muestra que si el primer clic del usuario es correcto, tiene un **87% de probabilidad** de completar la tarea exitosamente; si es incorrecto, solo **46%**.

---

## Fase 8: herramientas, accesibilidad y calidad de código

### Accesibilidad: obligación legal, no solo buena práctica

La **European Accessibility Act (EAA)** es ejecutable desde el **28 de junio de 2025**, requiriendo WCAG 2.1 Level AA con multas de hasta €500,000. El ADA Title II tiene plazo hasta el **24 de abril de 2026** para sitios gubernamentales de EE.UU. A pesar de esto, el WebAIM Million 2025 report encontró que el **94.8% de los top 1M de homepages** todavía tienen fallos WCAG detectables.

Las herramientas automatizadas detectan solo **30-40% de los problemas** WCAG. La combinación recomendada es **axe DevTools** (zero false positives, integración CI/CD), **WAVE** (overlay visual para no-desarrolladores), **Lighthouse** (auditorías rápidas) más testing manual de teclado y screen reader.

### Calidad de código y herramientas de productividad

El setup de calidad de código recomendado es **ESLint + Prettier** para linting y formato, **Husky + lint-staged** para pre-commit hooks (ejecutar linters solo en archivos staged), **TypeScript** para type safety, y un pipeline CI/CD ejecutando todos los checks en pull requests. Para testing, **Vitest** (rápido, compatible con Vite) para unit tests y **Playwright** para E2E. Para deployment, **Vercel** (integración nativa con Next.js), **Netlify** o **Cloudflare Pages**.

### Recursos curados para el flujo completo

**checklist.design** ofrece checklists de UX/UI organizados por páginas (landing, marketing), componentes (botones, forms, nav) y flujos (onboarding, checkout), disponible también como plugin de Figma gratuito. **gooddesign.tools** cataloga **400+ herramientas** de diseño organizadas por categoría: inspiración, design systems, colores, tipografía, iconos, ilustraciones, mockups, IA y aprendizaje. **openalternative.co** lista **500+ alternativas open-source** a SaaS propietario: Supabase (Firebase), Coolify (Heroku), PostHog (Mixpanel), Plausible (GA), Cal.com (Calendly). **designsystemsrepo.com** cataloga 100+ design systems corporativos y open-source como referencia.

---

## Conclusión: el flujo completo en una secuencia clara

El desarrollo web moderno no es una cadena lineal sino un ciclo iterativo, pero tiene una secuencia lógica que maximiza la eficiencia: investigar antes de diseñar, sistematizar antes de construir, animar con propósito, y validar con datos.

El cambio más significativo de 2025-2026 no es una herramienta específica sino la **convergencia de diseño y código** a través de IA. Figma MCP Server conecta diseño directamente a IDEs de IA. Kombai genera código production-ready que reutiliza tus propios componentes. Motion.dev ejecuta animaciones en el GPU del navegador sin JavaScript. GSAP es completamente gratuito. Tailwind v4 se configura solo con CSS. Esta convergencia reduce la fricción entre las fases que históricamente estaban separadas por silos organizacionales.

La clave para un frontend developer que también estudia UX/UI es entender que **cada fase informa a las demás**: las leyes de UX determinan la arquitectura de componentes, los design tokens garantizan que Figma y Tailwind hablen el mismo idioma, los resultados de tree testing validan la estructura del App Router, y las métricas de usability testing revelan dónde invertir en animaciones significativas. El flujo end-to-end no es solo una secuencia de pasos: es un sistema de retroalimentación donde cada decisión amplifica o corrige las anteriores.