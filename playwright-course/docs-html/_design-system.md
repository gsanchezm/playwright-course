# Design System — `playwright-course/docs-html/`

> Esto es el sistema visual del **mini-sitio de handouts HTML** del curso de Playwright. Es **independiente** del frontend de `qa-automation-academy-web/` y se rige por sus propios tokens. Inspiración: Stripe Docs / Linear / Vercel.

## Principios

1. **El código es el protagonista.** Tipografía monoespaciada nítida, fondo de bloque diferenciado del fondo del cuerpo, line-height holgado para diff/bash.
2. **Una sola fuente de variación entre módulos:** el color acento (`--accent`). Todo lo demás (tipografía, spacing, layout) es idéntico para evitar whiplash visual entre módulos.
3. **Self-contained, offline, sin build de runtime.** El build (`pnpm docs:build`) genera HTML con CSS+JS inline. Cada archivo abre por doble clic sin conexión.
4. **Mobile-first.** Single column < 768px, dos columnas (TOC sticky + cuerpo) ≥ 1024px.
5. **A11y AA mínimo.** Contraste ≥ 4.5:1 para texto normal; focus visible; navegación por teclado funcional; respeta `prefers-reduced-motion` y `prefers-color-scheme`.

---

## Tipografía

| Rol | Familia | Tamaño / line-height |
|---|---|---|
| Cuerpo | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 16px / 1.7 |
| Encabezados | misma familia | H1 32px/1.2, H2 24px/1.3, H3 18px/1.4 |
| Código | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace` | 14px / 1.6 |
| Inline code | misma mono | 0.92em del contenedor |

Las dos familias se cargan **system-first** — no se descargan webfonts para no romper la promesa offline. Si Inter / JetBrains Mono están instalados localmente, se usan; si no, fallback a system sans/mono.

Escala vertical: **4/8pt grid**. Margen entre secciones = 32px; entre párrafos = 16px.

---

## Color tokens

### Neutrales (light mode default)

```css
--bg:           #ffffff;
--bg-elevated:  #f8fafc;   /* code blocks, cards */
--border:       #e2e8f0;
--text:         #0f172a;
--text-muted:   #64748b;
--text-soft:    #475569;
--link:         var(--accent);
--code-bg:      #0f172a;   /* dark code on light page */
--code-text:    #e2e8f0;
--code-comment: #94a3b8;
--code-string:  #86efac;
--code-keyword: #fbbf24;
--code-number:  #93c5fd;
```

### Dark mode (auto via `prefers-color-scheme`)

```css
--bg:           #0b1220;
--bg-elevated:  #111827;
--border:       #1f2937;
--text:         #e5e7eb;
--text-muted:   #94a3b8;
--text-soft:    #cbd5e1;
--code-bg:      #020617;
--code-text:    #e2e8f0;
```

### Acentos por módulo (8 colores)

| Módulo | Tema | Hex | CSS var | Rationale |
|---|---|---|---|---|
| **M00** | Git esencial | `#ea580c` (orange-600) | `--accent` | Fundacional, "fuego inicial" de la disciplina. Cálido, no agresivo. |
| **M01** | Smoke feo | `#d97706` (amber-600) | `--accent` | Primer intento, áspero pero brillante — color de "borrador funcional". |
| **M02** | Locators & data | `#059669` (emerald-600) | `--accent` | Estructura, datos limpios — verde de "todo encaja". |
| **M03** | POM | `#7c3aed` (violet-600) | `--accent` | Abstracción, OOP — violeta de "ingeniería seria". |
| **M04** | Setup & fixtures | `#0d9488` (teal-600) | `--accent` | Plumbing, infraestructura silenciosa — teal industrial. |
| **M05** | API layer | `#e11d48` (rose-600) | `--accent` | Red layer, capa de servidor — rojo de "señal/respuesta". |
| **M06** | CI/CD | `#4f46e5` (indigo-600) | `--accent` | Pipelines, automatización, GitHub Actions — el indigo "ops". |
| **M07** | IA + MCP | `#c026d3` (fuchsia-600) | `--accent` | Novedad, IA — fucsia distintivo, "magic but earned". |

Todos los acentos pasan **4.5:1 contraste sobre `--bg` blanco** y **3:1 sobre `--bg` oscuro**.

---

## Componentes

### Hero

```
┌────────────────────────────────────────┐
│  M07                                   │ ← número grande en acento
│  IA + Playwright MCP                   │ ← H1
│  45-60 min · Pieza: integración de…    │ ← meta línea muted
└────────────────────────────────────────┘
```

- Banda lateral izquierda de 4px en `--accent`.
- Fondo `--bg-elevated`, padding 32px.
- "Pieza que suma al framework" en `--text-soft`.

### Callouts (4 tipos)

Cada callout es un `<aside class="callout callout--<tipo>">` con icono unicode + borde-left de 3px del color del tipo:

| Tipo | Icono | Color borde | Uso |
|---|---|---|---|
| `tip` | 💡 | `--accent` (modo claro) | Tips, atajos del facilitador |
| `warn` | ⚠️ | `#dc2626` (red-600) | Advertencias, anti-patterns |
| `big-idea` | 🎯 | `#0891b2` (cyan-600) | Idea grande, "lo que importa" |
| `learn-more` | 📚 | `--text-muted` | Profundización opcional |

Detectados en el markdown por el prefijo del blockquote (`> 💡`, `> ⚠️`, `> 🎯`, `> 📚`).

### Code blocks

- Fondo `--code-bg` (oscuro siempre, incluso en modo claro — alto contraste).
- Padding 16px 20px, border-radius 8px.
- Sin syntax highlighting completo — solo destaca comentarios (`#`, `//`, `--`) en `--code-comment` vía regex post-render para mantener autonomía.
- Encabezado opcional con lenguaje (`bash`, `ts`, `json`, `diff`) en chip pequeño top-right.
- Botón "Copiar" en hover (vanilla JS, navegador-only).

### Tablas

- Borde superior/inferior `--border` 1px.
- Encabezado `--bg-elevated`, texto `--text-soft`, uppercase tracking 0.04em font-size 12px.
- Filas separadas por hairline `--border`.
- Sin zebra-striping (más limpio).

### TOC sticky (≥1024px)

- Sidebar de 240px a la izquierda, sticky `top: 24px`.
- Lista de H2 con número de sección.
- Link activo en `--accent` con barra izquierda 2px.

### Prev / Next

Footer con dos cards lado a lado:

```
← Anterior                          Siguiente →
M01 Smoke feo                       M03 POM
```

Hover: borde se vuelve `--accent`. Cada card linkea al HTML correspondiente.

---

## Layout

```
┌─────────────────────────────────────────────────┐
│  Top nav (sticky)                               │
│  [Logo curso]  M00  M01 …  M07     [☀/🌙]      │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│  TOC     │   Hero                               │
│  sticky  │   ──────                             │
│          │   Body (max-width 720px)             │
│          │                                      │
│          │   Prev / Next                        │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

- < 768px: TOC se vuelve un `<details>` colapsable arriba del body. Single column.
- 768-1023px: single column, sin sidebar.
- ≥ 1024px: dos columnas (240px TOC + 1fr body, max-width body 720px).

---

## Naming de archivos

```
docs-html/
├── _design-system.md          ← este archivo
├── build.mjs                  ← build script (genera los .html)
├── styles.css                 ← (opcional, no usado — CSS está inline en cada HTML)
├── index.html                 ← listado de los 8 módulos
├── m00.html                   ← README de M00
├── m00-01-config.html         ← sublecciones de M00
├── m00-02-init-add-commit.html
├── m00-03-gitignore.html
├── m00-04-log.html
├── m01.html                   ← README de M01
├── m02.html
├── m03.html
├── m04.html
├── m05.html
├── m06.html
└── m07.html
```

**No se incluyen retos** — el HTML es referencia visual de las lecciones, no del trabajo práctico.
