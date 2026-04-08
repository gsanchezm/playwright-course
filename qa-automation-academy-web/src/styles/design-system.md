# Design System — QA Automation Academy

Contrato de ejecución para implementar la landing. Fuente de verdad: `docs/render-landing/DESIGN.md`.  
Los tokens ya existen en `tailwind.config.ts`. **No redefinir colores, fuentes ni gradientes** — consumir solo vía clases `qa-*`.

Principio rector: **developer-first clarity, cyberpunk controlado**. Más Playwright que gaming dashboard.

---

## 1. Paleta y uso

### Superficies (dark stack)

| Token | Uso | Nunca usar como |
|---|---|---|
| `bg-qa-base` (`#050816`) | Fondo raíz del `<body>`, fondo entre secciones | Fondo de botón, fondo de input |
| `bg-qa-elevated` (`#0C1226`) | Fondo de secciones pares (metodología, highlights) | Fondo de card individual |
| `bg-qa-panel` (`#101A35`) | Cards, code showcase, inputs, panels flotantes | Fondo full-bleed de sección |
| `border-qa-line` (`#213052`) | Bordes sutiles de cards, separadores, outlines de botón secundario | Texto |

Regla: jerarquía de profundidad = `base → elevated → panel`. Nunca anidar `panel` dentro de `panel` sin `bg-qa-panel/60` + borde para separar.

### Texto

| Token | Uso | Contraste sobre `qa-base` |
|---|---|---|
| `text-qa-text` (`#EAF2FF`) | Headings, párrafos, labels principales | ~15.6:1 ✅ AAA |
| `text-qa-muted` (`#A9B9D6`) | Subheadings, metadata, descripciones cortas, footer | ~8.5:1 ✅ AAA |

### Acentos (orden de prominencia)

| Token | Uso | NO usar para |
|---|---|---|
| `text-qa-cyan` (`#77F2FF`) | Eyebrows, badges `Live`, highlights puntuales, hovers | **Párrafos largos** (fatiga visual, contraste borderline en serifas) |
| `text-qa-blue` (`#56B8FF`) | Links, acento principal de iconos, énfasis en headings secundarios | Fondo plano de botón primario (usar gradiente) |
| `text-qa-periwinkle` (`#8FA9FF`) | Gradientes intermedios, separadores decorativos, tokens de sintaxis | Texto sobre `bg-qa-panel` (contraste apenas AA) |
| `text-qa-lavender` (`#B495FF`) | Estados `In Progress`, tabs secundarios, detalles narrativos | CTAs primarios |
| `text-qa-violet` (`#8C5BFF`) | CTA secundario, profundidad de gradiente, outline de card destacada | Texto body |
| `text-qa-ice` (`#D9F7FF`) | Highlight sutil sobre glow, hover state de link blanco | Fondo |

### Reglas de contraste

1. Body copy: **solo** `text-qa-text` o `text-qa-muted`. Nunca cyan/periwinkle/lavender para más de 2 líneas.
2. Badges y eyebrows: cyan/lavender/violet permitidos porque son textos cortos (máx ~5 palabras).
3. Sobre `bg-qa-panel`: verificar que `text-qa-muted` no baje de 4.5:1 — si baja, promover a `text-qa-text`.
4. Nunca texto `qa-blue` sobre `qa-violet` o viceversa.

---

## 2. Tipografía aplicada

Escala móvil-first. Todas las headings usan `font-display` (Space Grotesk). Body `font-sans` (IBM Plex Sans). Código/badges `font-mono` (JetBrains Mono).

| Rol | Clases Tailwind | Notas |
|---|---|---|
| **H1 hero** | `font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight` | Máx 3 líneas, balancear con `text-balance` |
| **H2 sección** | `font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight` | 1 línea preferible |
| **H3 card / sub** | `font-display text-xl sm:text-2xl font-medium leading-snug` | |
| **Eyebrow** | `font-mono text-xs uppercase tracking-[0.2em] text-qa-cyan` | Siempre antes de un H2 importante |
| **Lead / subheadline** | `font-sans text-lg sm:text-xl text-qa-muted leading-relaxed max-w-2xl` | Ancho de lectura controlado |
| **Body** | `font-sans text-base text-qa-muted leading-relaxed` | Mínimo 16px (nunca `text-sm` en párrafos) |
| **Small / metadata** | `font-sans text-sm text-qa-muted` | |
| **Code inline** | `font-mono text-sm text-qa-cyan bg-qa-panel/60 px-1.5 py-0.5 rounded` | |
| **Code block** | `font-mono text-sm leading-[1.7] text-qa-text` | Dentro del code showcase |
| **Badge** | `font-mono text-[11px] uppercase tracking-[0.18em]` | |

Regla de line-length: párrafos con `max-w-prose` o `max-w-2xl`. Jamás full-width.

---

## 3. Componentes base

### 3.1 Botón primario (`Button variant="primary"`)

- **Fondo**: `bg-qa-accent` (gradiente definido en config).
- **Texto**: `text-qa-base` (navy profundo) con `font-medium`.
- **Forma**: `rounded-full`, `px-6 py-3`, altura mínima `min-h-[44px]`.
- **Borde**: `ring-1 ring-qa-cyan/30 ring-offset-2 ring-offset-qa-base` (halo luminoso sutil).
- **Sombra reposo**: `shadow-[0_10px_30px_-10px_rgba(119,242,255,0.35)]`.
- **Hover**: `hover:shadow-[0_16px_40px_-10px_rgba(119,242,255,0.55)]` + `hover:-translate-y-[1px]` (bloom, no escala).
- **Transition**: `transition-all duration-200 ease-out`.
- **Focus**: heredado de `:focus-visible` global (`ring-2 ring-qa-cyan`).
- **Disabled**: `opacity-60 cursor-not-allowed shadow-none`.

### 3.2 Botón secundario (`Button variant="ghost"`)

- **Fondo**: `bg-qa-panel/40 backdrop-blur-sm`.
- **Texto**: `text-qa-text`.
- **Borde**: `border border-qa-line`.
- **Hover**: `hover:border-qa-cyan hover:text-qa-cyan hover:bg-qa-panel/60`.
- Mismas dimensiones y `min-h-[44px]` que el primario.

### 3.3 Card

- **Base**: `rounded-2xl bg-qa-panel/60 border border-qa-line shadow-card backdrop-blur-sm`.
- **Padding**: `p-6 sm:p-8`.
- **Highlight superior** (línea luminosa): pseudo-elemento o `<span>` absoluto `absolute inset-x-6 top-0 h-px bg-qa-accent opacity-60`.
- **Hover**: `hover:-translate-y-1 hover:border-qa-cyan/40 hover:shadow-[0_24px_70px_-20px_rgba(86,184,255,0.35)] transition-all duration-300`.
- Cards NO deben tener glow permanente — solo en hover.
- Cards destacadas (ruta Live) pueden agregar `ring-1 ring-qa-cyan/20`.

### 3.4 Badge (estados)

Base común: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[11px] uppercase tracking-[0.18em]`.

| Estado | Clases adicionales | Dot |
|---|---|---|
| **Live** | `border-qa-cyan/40 bg-qa-cyan/10 text-qa-cyan` | `<span class="h-1.5 w-1.5 rounded-full bg-qa-cyan shadow-[0_0_8px_#77F2FF]">` |
| **Soon** | `border-qa-periwinkle/30 bg-qa-periwinkle/10 text-qa-periwinkle` | dot `bg-qa-periwinkle` sin glow |
| **In Progress** | `border-qa-lavender/40 bg-qa-lavender/10 text-qa-lavender` | dot `bg-qa-lavender` con glow suave |

### 3.5 Code showcase (editor panel — hero de esta landing)

Anatomía obligatoria:

```
┌─ wrapper ───────────────────────────────────────────┐
│  rounded-2xl bg-qa-panel shadow-card shadow-glow    │
│  border border-qa-line overflow-hidden              │
│                                                     │
│  ┌─ window chrome ─────────────────────────────┐   │
│  │  h-10 bg-qa-elevated border-b border-qa-line│   │
│  │  dots · · ·    [ tabs: TS | GH | Playwright]│   │
│  └─────────────────────────────────────────────┘   │
│  ┌─ code area ─────────────────────────────────┐   │
│  │  font-mono text-sm leading-[1.7] p-6        │   │
│  │  linenos `text-qa-muted/50 select-none`     │   │
│  │  active line: `bg-qa-cyan/5 border-l-2      │   │
│  │                border-qa-cyan -mx-6 px-6`   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

Reglas:

- Window dots: 3 spans `h-2.5 w-2.5 rounded-full` con colores `bg-qa-violet/60`, `bg-qa-periwinkle/60`, `bg-qa-cyan/60` (NO rojo/amarillo/verde — mataría la paleta).
- Tabs: texto `font-mono text-xs`. Activa: `text-qa-cyan border-b border-qa-cyan`. Inactiva: `text-qa-muted hover:text-qa-text`.
- Glow del borde externo: solo vía `shadow-glow` del theme (ya definido). No agregar box-shadows adicionales.
- Syntax highlighting minimal: keywords `text-qa-lavender`, strings `text-qa-cyan`, comments `text-qa-muted/60`, funciones `text-qa-periwinkle`.
- Snippets deben ser **reales y legibles**, no lorem.

---

## 4. Hero

Layout:

- **Mobile (`< 1024px`)**: columna única. Orden: eyebrow → H1 → lead → CTAs (stack vertical, `w-full`) → badges de tech → editor panel debajo.
- **Desktop (`≥ 1024px`)**: grid `lg:grid-cols-[1.1fr_1fr] gap-12 xl:gap-16`. Izquierda texto + CTAs, derecha editor panel sticky opcional.

Fondo: `<section class="relative bg-qa-hero overflow-hidden">` + sección completa `min-h-[88vh]`. Orbs decorativos permitidos (2-3 máximo) como `<div>` absolutos con `bg-qa-cyan/10 blur-3xl rounded-full` — casi estáticos.

Contenido obligatorio:

1. Eyebrow: `QA AUTOMATION ACADEMY`.
2. H1: 2-3 líneas, balance tight. Sugerido: `Aprende automatización con ejercicios reales, desde TypeScript hasta Playwright.`
3. Subheadline `max-w-2xl`: conectar las 3 rutas.
4. CTA primario: "Explorar ejercicios" (`#rutas`).
5. CTA secundario: "Ver el repo" (link externo GitHub, `rel="noopener"`).
6. Badges de tech inline (debajo de CTAs o encima de H1): `TypeScript`, `Git/GitHub`, `Playwright` con badge `Soon` para los no disponibles.
7. Editor panel (§3.5) mostrando por default la tab `TypeScript`.

---

## 5. Grid de rutas

Sección `id="rutas"` sobre `bg-qa-base`.

- Header de sección: eyebrow + H2 + lead corto.
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8`.
- Cada card (§3.3) contiene:
  1. Badge de estado (top-left): `Live` | `Soon` | `In Progress`.
  2. Icono SVG (24x24, `text-qa-cyan`/`periwinkle`/`lavender` según ruta).
  3. H3 ruta.
  4. Descripción 2 líneas (`text-qa-muted`).
  5. Lista de 3 capacidades: `<ul>` con bullets `·` o checks SVG, `font-sans text-sm`.
  6. CTA: link con flecha `hover:gap-3 transition-all` — NO botón completo dentro de card.

Diferenciación cromática sutil (accent por ruta, solo en highlight superior e icono):

| Ruta | Accent |
|---|---|
| TypeScript (Live) | `qa-cyan` |
| Git/GitHub (Soon) | `qa-periwinkle` |
| Playwright (Soon) | `qa-lavender` |

---

## 6. Motion

Regla de oro: **funcional, no decorativa**. Todo respeta `prefers-reduced-motion: reduce`.

| Elemento | Animación | Duración | Easing |
|---|---|---|---|
| Sección al entrar viewport | Fade + translate-y 16px → 0 | 600ms | `ease-out` |
| Card hover | `translate-y -4px` + shadow expand | 300ms | `ease-out` |
| Botón primario hover | `translate-y -1px` + shadow bloom | 200ms | `ease-out` |
| CTA glow (opcional) | Pulse `opacity 0.6 → 0.9` en un halo externo | 2.4s | `ease-in-out infinite` |
| Tabs code showcase | Cross-fade contenido | 150ms | `ease-out` |
| Link con flecha | `gap 2 → 3` + traslación flecha | 200ms | `ease-out` |

Implementación:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

Incluir este bloque en `index.css` dentro de `@layer base`.

Para fade-in de secciones usar IntersectionObserver + clase toggle `opacity-0 translate-y-4` → `opacity-100 translate-y-0`. No librerías.

---

## 7. Anti-patrones (prohibido)

1. ❌ **Magenta dominante** o cualquier hue fuera de la paleta `qa.*`. Nada de rosa neón, rojo ni verde lima.
2. ❌ **Glow agresivo**: box-shadows > 60px de radio, múltiples glows apilados en el mismo elemento.
3. ❌ **Glassmorphism pesado**: `backdrop-blur-xl` con opacidades altas. Máximo `backdrop-blur-sm`/`md`.
4. ❌ **HUD sci-fi**: marcos corner, scan lines, grids técnicos decorativos sobre texto, crosshairs.
5. ❌ **Fuentes infantiles**: nada de Fredoka, Baloo, Comic, Pacifico, Lobster.
6. ❌ **Cyan/periwinkle/lavender en párrafos largos** (>2 líneas).
7. ❌ **Scanlines permanentes** sobre texto o imágenes.
8. ❌ **Parallax** de cualquier tipo en scroll.
9. ❌ **Emojis como iconos**. Siempre SVG inline (Lucide/Heroicons, trazos).
10. ❌ **Gradientes de texto extensos**. `bg-qa-accent bg-clip-text` permitido solo en 1-2 palabras clave del H1.
11. ❌ **Hero con video de fondo** o partículas animadas.
12. ❌ **Scale en hover** (`hover:scale-105`) — causa layout shift y se ve barato. Usar `translate-y`.
13. ❌ **Border radius inconsistente**. Stack: `rounded-full` (botones/pills), `rounded-2xl` (cards/panels), `rounded-lg` (inputs/tabs), nada más.
14. ❌ **Sombras cálidas** (`shadow-amber`, etc). Solo las del theme (`shadow-glow`, `shadow-card`) o halos cyan/blue.
15. ❌ **Contenido sin `max-w-*`** en párrafos. Produce líneas de 120+ chars.

---

## 8. Clases Tailwind clave (atajos reutilizables)

Combinaciones que se repiten — copiar tal cual:

```tsx
// Container de sección
"relative py-20 sm:py-28 lg:py-32"

// Wrapper de contenido
"mx-auto w-full max-w-6xl px-6 lg:px-8"

// Eyebrow
"font-mono text-xs uppercase tracking-[0.2em] text-qa-cyan"

// Heading de sección
"mt-4 font-display text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-qa-text"

// Lead de sección
"mt-4 max-w-2xl font-sans text-lg text-qa-muted leading-relaxed"

// Card base
"group relative rounded-2xl bg-qa-panel/60 border border-qa-line shadow-card backdrop-blur-sm p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-qa-cyan/40"

// Highlight superior de card
"absolute inset-x-6 top-0 h-px bg-qa-accent opacity-60"

// Botón primario
"inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-qa-accent px-6 py-3 font-sans font-medium text-qa-base ring-1 ring-qa-cyan/30 shadow-[0_10px_30px_-10px_rgba(119,242,255,0.35)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_16px_40px_-10px_rgba(119,242,255,0.55)]"

// Botón secundario
"inline-flex items-center justify-center gap-2 min-h-[44px] rounded-full border border-qa-line bg-qa-panel/40 px-6 py-3 font-sans font-medium text-qa-text backdrop-blur-sm transition-all duration-200 hover:border-qa-cyan hover:text-qa-cyan hover:bg-qa-panel/60"

// Badge base
"inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em]"

// Code showcase wrapper
"relative overflow-hidden rounded-2xl border border-qa-line bg-qa-panel shadow-card shadow-glow"

// Window chrome
"flex h-10 items-center gap-4 border-b border-qa-line bg-qa-elevated px-4"

// Tab activa / inactiva
"px-3 py-1 font-mono text-xs transition-colors text-qa-cyan border-b border-qa-cyan"
"px-3 py-1 font-mono text-xs transition-colors text-qa-muted hover:text-qa-text"

// Link con flecha
"inline-flex items-center gap-2 font-mono text-sm text-qa-cyan transition-all hover:gap-3"
```

---

## Checklist de entrega (para senior-frontend)

- [ ] Todas las secciones usan el container `max-w-6xl px-6 lg:px-8`.
- [ ] Ningún color hardcodeado fuera de `qa.*` (grep `#` en JSX/CSS).
- [ ] Párrafos siempre con `text-qa-text` o `text-qa-muted`, nunca acentos.
- [ ] `min-h-[44px]` en todos los botones y links tipo CTA.
- [ ] Cards con highlight superior y hover lift.
- [ ] Code showcase con 3 tabs funcionales y syntax highlighting manual por spans.
- [ ] `prefers-reduced-motion` respetado en `index.css`.
- [ ] Focus states visibles (heredados del `:focus-visible` global).
- [ ] Sin emojis como iconos — solo SVG inline.
- [ ] Responsive verificado a 375 / 768 / 1024 / 1440.
- [ ] Lighthouse a11y ≥ 95 antes de entregar.
