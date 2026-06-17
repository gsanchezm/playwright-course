# QA Automation Academy Web

Landing page para la academia práctica de QA Automation. Presenta rutas de TypeScript, Git/GitHub y Playwright, y hostea la **documentación navegable** de los cursos en `/docs`.

Vive como proyecto independiente dentro del monorepo y **no modifica** `typescript-qa-course/`.

## Stack

- Vite
- React 18 + TypeScript
- Tailwind CSS
- Deploy: Render (Static Site)

## Requisitos

- Node.js 20.x
- pnpm 10 (`pnpm --version`)

## Desarrollo local

```bash
cd qa-automation-academy-web
pnpm install
pnpm dev          # servidor Vite en http://localhost:5173
pnpm build        # build de producción en dist/
pnpm preview      # sirve dist/ para verificación
```

## Estructura

```
qa-automation-academy-web/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig*.json
├── render.yaml
├── public/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    ├── sections/
    ├── data/
    └── styles/
```

## Documentación de cursos (`/docs`)

La app sirve los cursos como lecciones navegables bajo `/docs/<seccion>/<slug>`:

| Ruta | Estado | Contenido |
|------|--------|-----------|
| `/docs/setup` | ✅ Completo | Guía de setup (terminal, Node, pnpm, Git, VS Code, GitHub/SSH, Playwright browsers, herramientas de IA). |
| `/docs/typescript` | ✅ Completo | Módulos 1–6 del curso de TypeScript: Hello World, Tipos, Funciones, Objetos, Clases (POM) e Interfaces, con reto al final de cada módulo. |
| `/docs/git-github` | ✅ Completo | Módulos 1–6 del curso de Git/GitHub: Introducción, Git básico, Undo/remotos/tags, Ramas y merge, Workflows y rebase, GitHub, con reto al final de cada módulo. |
| `/docs/playwright` | 🚧 Próximamente | Aún no publicado en `/docs` (el curso fuente vive en `playwright-course/`). |

El contenido vive en `src/content/<seccion>/<slug>.md` y se carga con `import.meta.glob` (raw markdown → `MarkdownContent`). El índice y los grupos por módulo se definen en `src/data/docsNav.ts`. Para añadir una lección nueva: crear el `.md` en la carpeta de la sección y registrar el slug en `docsNav.ts`.

## Design system

Los tokens (colores `qa.*`, tipografías, sombras, gradientes `qa-hero` / `qa-accent`) están definidos en `tailwind.config.ts` siguiendo `docs/render-landing/DESIGN.md`.

## Deploy en Render

### Opción A — Blueprint declarativo (recomendado)

El archivo `render.yaml` en esta carpeta define el servicio. Desde el dashboard de Render:

1. **New +** → **Blueprint**.
2. Conecta el repo y apunta al blueprint `qa-automation-academy-web/render.yaml`.
3. Render detecta un Static Site con:
   - Root directory: `qa-automation-academy-web`
   - Build command: `corepack pnpm install --frozen-lockfile=false && corepack pnpm build`
   - Publish directory: `./dist`
   - Rewrite SPA: `/*` → `/index.html`

### Opción B — Configuración manual

Si prefieres crearlo a mano: **New +** → **Static Site** con los mismos valores del blueprint.

### Notas

- El proyecto usa pnpm vía Corepack, pero sin `corepack enable`, porque en Render el filesystem del binario global puede ser de solo lectura.
- `pullRequestPreviewsEnabled: true` genera previews por PR.
- Headers de seguridad básicos ya están incluidos en `render.yaml`.

## Tests E2E (Playwright)

Los smoke tests corren sobre el build estático servido por `pnpm preview` (no sobre el dev server). Playwright levanta el `webServer` automáticamente en `http://localhost:4173` antes de correr.

### Primera vez

```bash
pnpm install
pnpm exec playwright install chromium
pnpm build
```

### Ejecutar tests

```bash
pnpm test:e2e          # headless, chromium desktop + mobile
pnpm test:e2e:ui       # UI mode interactivo
pnpm test:e2e:report   # abre el último reporte HTML
```

### Qué cubren

- **`tests/e2e/home.spec.ts`** — hero (headline, CTAs), navegación ancla, grid de rutas, estados Live/Soon, tabs del code showcase, metodología, highlights, consola limpia.
- **`tests/e2e/a11y.spec.ts`** — landmarks, jerarquía de headings, `rel="noopener"` en links externos, nombres accesibles en elementos interactivos.

Los tests usan locators accesibles (`getByRole`, `getByText`, `getByLabel`), nunca CSS frágil. Proyecto Playwright: `chromium-desktop` (1440×900) y `mobile-chrome` (Pixel 5).
