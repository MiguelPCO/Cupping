---
name: skill-creator
description: |
  Crea nuevos skills personalizados para tu workspace a partir de workflows repetitivos.
  Úsalo cuando repitas el mismo proceso más de 3 veces en conversaciones distintas, cuando 
  quieras capturar un patrón que acabas de desarrollar, o cuando quieras que Claude active 
  automáticamente un comportamiento específico. Activar cuando el usuario diga: "convierte 
  esto en skill", "quiero reutilizar este proceso", "crea un skill para", "captura este 
  workflow", o "quiero que Claude haga X automáticamente cada vez". El output es un SKILL.md 
  completo listo para guardar en _global/skills/ y referenciar desde los proyectos.
---

# Skill Creator

Convierte workflows repetitivos en skills de Claude reutilizables. Un skill bien escrito ahorra tiempo, garantiza consistencia y mejora la calidad de los outputs automáticamente.

## ¿Cuándo tiene sentido crear un skill?

**Sí crear skill cuando:**
- Has explicado el mismo proceso a Claude 3+ veces
- Un workflow tiene pasos específicos que Claude olvida o hace diferente cada vez
- Quieres garantizar calidad consistente en un tipo de output
- El proceso tiene decisiones no obvias que valen la pena documentar

**No crear skill cuando:**
- Es algo que solo harás una vez
- El proceso es tan simple que cabe en una línea
- No hay decisiones no obvias que documentar

## Proceso de creación

### Paso 1: Capturar el intent

Antes de escribir el SKILL.md, responder estas preguntas:

```
1. ¿Qué debe hacer Claude con este skill activo?
   (describir el output ideal, no el proceso)

2. ¿Cuándo debe activarse?
   (frases exactas que el usuario diría, contextos específicos)

3. ¿Qué hace diferente este skill vs el comportamiento default de Claude?
   (si la respuesta es "nada obvio", quizás no necesita skill)

4. ¿Hay archivos de referencia, templates o ejemplos que Claude debe usar?
   (si sí, van como recursos bundled)

5. ¿El output es verificable?
   (si sí, añadir checklist o criterios de calidad)
```

### Paso 2: Estructura del SKILL.md

```markdown
---
name: nombre-del-skill
description: |
  [2-4 líneas sobre qué hace y cuándo se activa]
  Ser específico sobre los triggers — frases exactas que lo invocan.
  Ser "ligeramente pushy" para combatir el undertriggering.
  Mencionar el tipo de output esperado.
---

# [Nombre del Skill]

[Párrafo breve de contexto — por qué existe este skill]

## [Sección de proceso / instrucciones]

[Las instrucciones específicas paso a paso]

## [Ejemplos cuando son útiles]

## [Checklist o criterios de calidad]

## [Anti-patterns — qué NO hacer]
```

**Reglas de escritura:**
- Usar imperativo: "Usa", "Genera", "Verifica" — no "Debes usar"
- Explicar el *por qué* de las reglas, no solo las reglas
- Menos de 500 líneas en el SKILL.md — si es más largo, crear archivos de referencia
- Los ejemplos concretos valen más que descripciones abstractas

### Paso 3: Description optimizada (anti-undertriggering)

La `description` en el frontmatter es el trigger principal. Si es vaga, Claude no la activará.

```markdown
# ❌ Demasiado vaga
description: Ayuda a crear componentes React.

# ✅ Con triggers específicos y contexto de uso
description: |
  Crea componentes React/TSX siguiendo el design system del proyecto.
  Úsalo SIEMPRE que el usuario pida: "crea el componente", "haz el botón",
  "construye el formulario", o cualquier elemento UI específico. Garantiza
  TypeScript types explícitos, accesibilidad y responsive design. El output
  es código listo para pegar en el proyecto, sin configuración adicional.
```

### Paso 4: Test cases

Crear 2-3 prompts de prueba realistas antes de dar el skill por terminado:

```json
{
  "skill_name": "nombre-del-skill",
  "test_cases": [
    {
      "prompt": "frase exacta que un usuario diría",
      "expected": "descripción del output ideal",
      "validates": "qué aspecto específico del skill prueba"
    }
  ]
}
```

Ejecutar los test cases mentalmente: ¿el skill produciría el output esperado?

### Paso 5: Guardar y referenciar

```bash
# Guardar en:
_global/skills/[nombre-del-skill]/SKILL.md

# Referenciar desde CLAUDE.md del proyecto:
## Skills disponibles
- `../../_global/skills/[nombre-del-skill]/SKILL.md` — descripción breve
```

---

## Skills prioritarios para crear en tu workspace

### 🔴 Alta prioridad

**`nextjs-supabase-setup`**
```
Trigger: "día 1 del sprint", "setup inicial", "crea el proyecto"
Contenido: El proceso completo de 10 pasos que ya conoces de memoria
Valor: Evitar olvidar pasos (Shadcn components, middleware, .env.example)
```

**`supabase-schema-generator`**
```
Trigger: "diseña el schema", "crea las tablas", "schema para"
Contenido: Patrón UUID + timestamps + RLS + índices + tipos TypeScript
Valor: Consistencia en todos los proyectos, nunca olvidar RLS
```

**`server-action-pattern`**
```
Trigger: "crea la server action", "acción del formulario", "guarda en DB"
Contenido: Estructura validación Zod + manejo errores + revalidatePath
Valor: Patrón consistente en magic-tracker, interior-ai, cineboxd
```

### 🟡 Media prioridad

**`replicate-integration`**
```
Trigger: "integra Replicate", "llama al modelo", "API de imagen"
Contenido: API route + polling hook + estados + manejo errores
Valor: Extraído de interior-ai, reutilizable en futuros proyectos con IA
```

**`sprint-planning`**
```
Trigger: "planifica el proyecto", "crea el PRD", "empieza la planificación"
Contenido: Proceso PRD → SCHEMA → SPRINTS → START.md que ya usas
Valor: Consistencia en la documentación de todos los proyectos
```

---

## Skill anatomy — referencia rápida

```
_global/skills/[nombre]/
├── SKILL.md              ← Obligatorio. Frontmatter + instrucciones
├── references/           ← Opcional. Docs largas que Claude lee si necesita
│   └── [tema].md
├── templates/            ← Opcional. Archivos de plantilla
│   └── [plantilla].ts
└── examples/             ← Opcional. Input/output de referencia
    └── [ejemplo].md
```

**Regla de los 3 niveles:**
1. Frontmatter (name + description) — siempre en contexto
2. SKILL.md body — en contexto cuando el skill se activa
3. Referencias bundled — Claude las lee solo cuando las necesita

Esto mantiene el contexto limpio y el skill eficiente.

---

## Ejemplo completo: `server-action-pattern`

```markdown
---
name: server-action-pattern
description: |
  Crea Server Actions para Next.js 14 App Router con validación Zod y manejo de errores.
  Úsalo SIEMPRE que el usuario pida: "crea la server action", "acción para el formulario",
  "guarda los datos", o cuando necesites una función que el cliente llama y corre en servidor.
  Output: función async con 'use server', tipado completo, validación Zod, errores en español.
---

# Server Action Pattern

Patrón estándar para Server Actions en este workspace.

## Estructura obligatoria

\`\`\`typescript
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// 1. Schema de validación Zod
const schema = z.object({
  campo: z.string().min(1, "El campo es requerido"),
})

// 2. Tipo del resultado
type ActionResult = 
  | { error: string }
  | { success: true; data?: unknown }

// 3. La action
export async function nombreAction(
  formData: FormData
): Promise<ActionResult> {
  // Validar
  const parsed = schema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }
  
  // Obtener usuario
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }
  
  // Ejecutar
  const { error } = await supabase
    .from('tabla')
    .insert({ ...parsed.data, user_id: user.id })
  
  if (error) return { error: "No se pudo guardar. Intenta de nuevo." }
  
  // Revalidar y/o redirigir
  revalidatePath('/ruta')
  return { success: true }
}
\`\`\`

## Anti-patterns

- No usar try/catch para errores de Supabase — usar el pattern `{ error }` del return
- No hacer redirect dentro de try/catch — redirect lanza una excepción especial
- No exponer mensajes de error de la DB al cliente — mapearlos a mensajes en español
```
