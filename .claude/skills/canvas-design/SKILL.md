---
name: canvas-design
description: |
  Crea assets visuales estáticos de alta calidad como archivos PNG o PDF usando Python + Pillow.
  Úsalo cuando necesites: imágenes para landing pages, OG images para redes sociales, thumbnails 
  de estilos para el generador, mockups de before/after, posters o cualquier asset de imagen que 
  no sea UI interactiva. Activar cuando el usuario diga: "crea la imagen", "genera el asset", 
  "necesito un PNG para", "crea el placeholder", "OG image", "thumbnail". NO es para generar 
  interfaces React — para eso usa frontend-design. Sigue siempre el proceso en dos pasos: 
  primero filosofía de diseño, luego ejecución en canvas con Python.
---

# Canvas Design Skill

Crea imágenes estáticas (.png, .pdf) con filosofía de diseño real. Proceso en dos pasos obligatorios: primero define la filosofía visual, luego la ejecuta en código Python.

## Stack técnico

```python
# Dependencias
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np  # para texturas y gradientes complejos

# Fuentes disponibles en el sistema
FONTS_DIR = "/mnt/skills/examples/canvas-design/canvas-fonts/"
# Explorar con: ls /mnt/skills/examples/canvas-design/canvas-fonts/

# Output
# PNG: para web, redes sociales, assets de proyectos
# PDF: para documentos, presentaciones
```

## Paso 1 obligatorio: Filosofía visual

Antes de escribir código, escribe una filosofía de diseño en formato .md.

La filosofía NO es: "Haré un fondo beige con texto negro"
La filosofía SÍ es: un manifiesto de movimiento artístico que guía cada decisión visual.

**Estructura:**
```
Nombre del movimiento (2-3 palabras)
↓
4-6 párrafos que describen:
- Relación entre forma y espacio
- Lenguaje de color y material  
- Ritmo, escala y jerarquía
- Cómo se comunican ideas sin texto
- Qué hace que esta obra parezca labrada durante horas
```

**La filosofía debe enfatizar craftsmanship repetidamente.** El output final debe parecer que alguien al top de su campo dedicó incontables horas a cada detalle.

**Ejemplos de filosofías:**

*"Warm Stillness"* — Para assets de interior-ai:
> La quietud no es vacío sino presencia. Superficies que respiran. El color como material físico, denso y sedimentado. La composición se equilibra como arquitectura: no por simetría sino por peso visual. El texto es raro, casi ausente — un susurro tipográfico que no compite con la imagen.

*"Editorial Geometry"* — Para thumbnails y OG images:
> Geometría que sirve a la narrativa. Cada forma tiene intención. La paleta reducida a 3 colores máximo crea tensión y unidad simultáneamente. El trabajo final debe parecer recortado de las páginas de Apartamento magazine.

## Paso 2: Ejecución en canvas

Con la filosofía definida, implementar en Python.

### Template base

```python
#!/usr/bin/env python3
"""
Asset: [nombre]
Filosofía: [nombre del movimiento]
Dimensiones: [W]x[H]px
Destino: [dónde se usa]
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, sys

# ── CONFIGURACIÓN ──────────────────────────────────────────
W, H = 1200, 630        # dimensiones
OUTPUT = "/mnt/user-data/outputs/asset-name.png"
FONTS  = "/mnt/skills/examples/canvas-design/canvas-fonts/"

# Paleta del proyecto (no hardcodear colores arbitrarios)
CREAM   = (250, 250, 248)   # interior-ai bg
BLACK   = ( 20,  20,  20)   # text
EARTH   = (196, 168, 130)   # accent interior-ai
MUTED   = (102, 102, 102)   # text muted

# ── CANVAS ─────────────────────────────────────────────────
img  = Image.new("RGB", (W, H), CREAM)
draw = ImageDraw.Draw(img)

# ── FONDO / TEXTURA ────────────────────────────────────────
# Gradiente sutil (más sofisticado que color plano)
for y in range(H):
    ratio = y / H
    r = int(CREAM[0] + (245 - CREAM[0]) * ratio * 0.3)
    g = int(CREAM[1] + (243 - CREAM[1]) * ratio * 0.3)
    b = int(CREAM[2] + (238 - CREAM[2]) * ratio * 0.3)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# ── COMPOSICIÓN ────────────────────────────────────────────
# Añadir elementos visuales aquí

# ── TIPOGRAFÍA ─────────────────────────────────────────────
# Buscar fuente disponible
def load_font(name, size):
    for ext in [".ttf", ".otf", ".TTF", ".OTF"]:
        path = os.path.join(FONTS, name + ext)
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

# ── REFINAMIENTO ───────────────────────────────────────────
# Suavizado sutil para calidad fotográfica
img = img.filter(ImageFilter.GaussianBlur(radius=0.3))

# ── EXPORT ─────────────────────────────────────────────────
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
img.save(OUTPUT, "PNG", quality=95, optimize=True)
print(f"✅ Guardado en {OUTPUT}")
```

### Técnicas de calidad

**Gradientes:**
```python
# Gradiente lineal horizontal
for x in range(W):
    ratio = x / W
    color = tuple(int(c1 + (c2 - c1) * ratio) for c1, c2 in zip(COLOR1, COLOR2))
    draw.line([(x, 0), (x, H)], fill=color)

# Gradiente radial (viñeta)
import numpy as np
cx, cy = W//2, H//2
Y, X = np.ogrid[:H, :W]
dist = np.sqrt((X-cx)**2 + (Y-cy)**2) / (W * 0.7)
vignette = np.clip(1 - dist, 0, 1)
```

**Formas geométricas precisas:**
```python
# Rectángulo con margen exacto
MARGIN = 60
draw.rectangle([MARGIN, MARGIN, W-MARGIN, H-MARGIN], 
               outline=BLACK, width=1)

# Línea de separación elegante
draw.line([(MARGIN, H//2), (W-MARGIN, H//2)], 
          fill=EARTH, width=1)

# Círculo perfecto
cx, cy, r = W//2, H//2, 100
draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=BLACK, width=2)
```

**Texto tipográfico:**
```python
# Texto centrado con control total
def draw_centered_text(draw, text, font, y, color, tracking=0):
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    x = (W - w) // 2
    draw.text((x, y), text, font=font, fill=color)

# Texto con letter-spacing manual
def draw_tracked_text(draw, text, font, x, y, color, spacing=8):
    cursor_x = x
    for char in text:
        draw.text((cursor_x, y), char, font=font, fill=color)
        bbox = draw.textbbox((0, 0), char, font=font)
        cursor_x += bbox[2] - bbox[0] + spacing
```

**Segunda pasada obligatoria:**
Después de generar el asset, revisar:
1. ¿Los márgenes son consistentes? (mínimo 40px en todos los lados)
2. ¿Ningún texto se corta ni sale del canvas?
3. ¿La paleta de color es coherente con el proyecto?
4. ¿El resultado parece profesional o genérico?

Si algo falla, refinar el código — no añadir más elementos, sino mejorar los existentes.

## Assets a crear para interior-ai

### OG Image (1200×630px)
```
Filosofía: "Warm Editorial" — espacio, tipografía serif italic, línea earth tone
Contenido: Logo/nombre · tagline · imagen de habitación como fondo con overlay
Paleta: CREAM background · BLACK text · EARTH accent
```

### Style Thumbnails (400×500px × 6)
```
Un asset abstracto por estilo que evoque su esencia:
minimalista  → espacio negativo, una sola línea, monocromático
nordico      → textura de madera, tonos cálidos, forma orgánica
industrial   → grises oscuros, líneas rectas, textura rugosa
mediterraneo → terracota, arco geométrico, cálido
japandi      → asimetría zen, beige y negro, equilibrio
clasico      → simetría, moldura estilizada, dorado
```

### Before/After Placeholder (1200×600px)
```
Dos mitades contrastantes separadas por línea vertical
Izquierda: habitación "vacía" — neutrales, poco contraste
Derecha: habitación "diseñada" — más carácter, más color
Mínimo texto: "ANTES" / "DESPUÉS" en tipografía pequeña
```

## Checklist de calidad

```
□ ¿Hay filosofía escrita antes del código?
□ ¿Los márgenes son ≥40px en todos los lados?
□ ¿Ningún elemento se solapa sin intención?
□ ¿La paleta de color coincide con el proyecto?
□ ¿El texto es legible? (contraste suficiente)
□ ¿Se hizo segunda pasada de refinamiento?
□ ¿El archivo se guarda en /mnt/user-data/outputs/?
□ ¿El resultado parece hecho por un diseñador experto?
```
