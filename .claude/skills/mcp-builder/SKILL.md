---
name: mcp-builder
description: |
  Crea servidores MCP (Model Context Protocol) que permiten a Claude Code interactuar con 
  APIs y servicios externos como herramientas nativas. Úsalo cuando necesites conectar 
  Claude Code con Replicate, Supabase, Spotify, Google Calendar u otros servicios. Activar 
  cuando el usuario diga: "crea un MCP para", "quiero que Claude Code pueda usar X", 
  "conecta Claude con la API de", o cuando una integración de API se va a usar en múltiples 
  proyectos y tiene sentido hacerla reutilizable. Stack recomendado: TypeScript + MCP SDK.
  Los servidores MCP del workspace viven en _global/mcp-servers/.
---

# MCP Builder Skill

Crea servidores MCP de alta calidad para que Claude Code interactúe con servicios externos. Un MCP bien diseñado convierte APIs complejas en herramientas simples que Claude usa de forma nativa.

## ¿Por qué MCP en lugar de integrar la API directamente?

```
Sin MCP:
  → Explicas la API cada vez que cambias de conversación
  → Escribes la misma lógica de autenticación en cada proyecto
  → Claude puede cometer errores al interpretar la documentación

Con MCP:
  → Claude tiene herramientas tipadas y documentadas
  → Autenticación resuelta una vez, disponible siempre
  → Reutilizable en todos los proyectos del workspace
```

## Stack y estructura

```
Lenguaje:    TypeScript (mejor soporte, tipado fuerte)
Transport:   stdio para uso local con Claude Code
Framework:   @modelcontextprotocol/sdk oficial
Runtime:     Node.js 18+
```

**Estructura de proyecto:**
```
_global/mcp-servers/[nombre]-mcp/
├── src/
│   ├── index.ts        ← Punto de entrada, registro de herramientas
│   ├── client.ts       ← Cliente autenticado del servicio
│   ├── tools/
│   │   ├── [domain].ts ← Herramientas agrupadas por dominio
│   │   └── types.ts    ← Tipos compartidos
│   └── utils/
│       └── errors.ts   ← Manejo de errores estandarizado
├── package.json
├── tsconfig.json
└── README.md           ← Instrucciones de configuración en Claude Code
```

## Proceso de 4 fases

### Fase 1: Research y diseño

**1.1 Estudiar el protocolo MCP**
Leer antes de implementar:
```
https://modelcontextprotocol.io/sitemap.xml
→ Buscar: specification, tools, transport
```

**1.2 Estudiar el SDK de TypeScript**
```
https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md
```

**1.3 Diseñar las herramientas**

Antes de escribir código, listar exactamente qué herramientas se expondrán:

```typescript
// Plantilla de diseño — completar antes de implementar
const TOOLS_DESIGN = {
  "[servicio]_[acción]": {
    description: "Qué hace esta herramienta (para Claude, no para humanos)",
    inputs: { /* parámetros con tipos */ },
    output: "Descripción del formato de respuesta",
    annotations: {
      readOnlyHint: true/false,
      destructiveHint: true/false,
    }
  }
}
```

**Reglas de naming:**
```
✅ replicate_generate_image
✅ supabase_query_table
✅ spotify_search_tracks
❌ generate           (demasiado genérico)
❌ replicateGenerateImage  (camelCase — usar snake_case)
```

---

### Fase 2: Implementación

**Template base `src/index.ts`:**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "[nombre]-mcp",
  version: "1.0.0",
});

// ── HERRAMIENTAS ──────────────────────────────────────────

server.registerTool(
  "[servicio]_[accion]",
  {
    description: "Descripción clara para Claude. Incluye: qué hace, cuándo usarlo, qué devuelve.",
    inputSchema: z.object({
      // Parámetros con .describe() en cada uno
      query: z.string().describe("La búsqueda a realizar"),
      limit: z.number().min(1).max(50).default(10).describe("Número de resultados (1-50)"),
    }),
    annotations: {
      readOnlyHint: true,     // No modifica datos
      destructiveHint: false, // No destruye datos
    },
  },
  async ({ query, limit }) => {
    try {
      const result = await apiClient.search(query, limit);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return handleError(error);
    }
  }
);

// ── INICIAR SERVIDOR ──────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[nombre]-mcp iniciado"); // stderr, no stdout
}

main().catch(console.error);
```

**Template `src/utils/errors.ts`:**
```typescript
export function handleError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  
  // Mensajes de error accionables — dicen qué hacer, no solo qué falló
  const actionableMessages: Record<string, string> = {
    "401": "Error de autenticación. Verifica que la variable de entorno esté configurada.",
    "429": "Rate limit alcanzado. Espera 60 segundos e intenta de nuevo.",
    "404": "Recurso no encontrado. Verifica que el ID sea correcto.",
  };

  const code = Object.keys(actionableMessages).find(k => message.includes(k));
  const userMessage = code ? actionableMessages[code] : `Error: ${message}`;

  return {
    content: [{ type: "text" as const, text: userMessage }],
    isError: true,
  };
}
```

**Template `package.json`:**
```json
{
  "name": "[nombre]-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/index.js",
    "inspect": "npx @modelcontextprotocol/inspector node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

### Fase 3: Testing

```bash
# 1. Compilar
npm run build

# 2. Inspeccionar con MCP Inspector
npm run inspect
# → Abre UI web para probar cada herramienta manualmente

# 3. Verificar que cada herramienta:
#    - Tiene descripción clara para Claude
#    - Devuelve errores accionables (no solo stack traces)
#    - Maneja casos edge (sin resultados, rate limit, auth error)
```

---

### Fase 4: Configurar en Claude Code

Generar el bloque de configuración para el CLAUDE.md del proyecto:

```json
// En ~/.claude/claude.json o en el CLAUDE.md del proyecto
{
  "mcpServers": {
    "[nombre]-mcp": {
      "command": "node",
      "args": ["/ruta/al/workspace/_global/mcp-servers/[nombre]-mcp/dist/index.js"],
      "env": {
        "API_KEY": "[VARIABLE_DE_ENTORNO]"
      }
    }
  }
}
```

---

## MCPs del workspace — plan de implementación

### 🔴 replicate-mcp (construir para interior-ai Sprint 2)

```typescript
// Herramientas a exponer:
replicate_generate_image(model, prompt, input)    // Inicia predicción
replicate_get_prediction(prediction_id)           // Estado del polling
replicate_list_models(category?)                  // Explorar modelos
replicate_cancel_prediction(prediction_id)        // Cancelar si falla

// Variables de entorno:
REPLICATE_API_TOKEN
```

### 🟡 supabase-mcp (construir cuando se repita en 3+ proyectos)

```typescript
// Herramientas:
supabase_select(table, filters?, order?, limit?)
supabase_insert(table, data)
supabase_update(table, match, data)
supabase_delete(table, match)
supabase_upload_file(bucket, path, content)
supabase_get_file_url(bucket, path)
supabase_run_sql(query)          // Solo para migrations/scripts

// Variables de entorno:
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY       // No anon key — el MCP corre en servidor
```

### 🟢 spotify-mcp (construir para VYBE)

```typescript
// Herramientas:
spotify_search(query, type, limit?)
spotify_get_track(track_id)
spotify_get_audio_features(track_id)
spotify_create_playlist(name, description?, public?)
spotify_add_tracks(playlist_id, track_uris)
spotify_get_recommendations(seed_tracks, features?)
```

### 🟢 google-calendar-mcp (construir para cineboxd)

```typescript
// Herramientas:
calendar_list_events(calendar_id, time_min, time_max)
calendar_get_event(calendar_id, event_id)
calendar_create_event(calendar_id, event_data)
calendar_parse_movie_event(event)      // Detecta si es un evento de cine
```
