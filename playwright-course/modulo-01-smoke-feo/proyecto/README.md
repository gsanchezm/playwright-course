# m01-smoke-feo — proyecto autocontenido

Snapshot **runnable** de `playwright-course` **tal como queda al terminar el
Módulo 01** (smoke "feo") sobre la app **OmniPizza**. Es la **referencia de forma
esperada** del módulo: el proyecto que el alumno construye paso a paso en
[`../../modulo-01-smoke-feo/README.md`](../../modulo-01-smoke-feo/README.md), ya
armado y listo para clonar y correr aislado — sin arrastrar el resto del curso.

> **Es un checkpoint, no el módulo de enseñanza.** El "por qué" de cada línea (config,
> tsconfig, dotenv, el dolor de la duplicación) vive en el README del módulo. Aquí
> solo está el **estado final** de M01, ejecutable.

## Qué incluye el estado M01

- `playwright.config.ts` — estado mínimo M01: `testDir: "."` + `testMatch: modulo-*`,
  `import "dotenv/config"`, timeouts generosos (cold start de Render), `trace:
  retain-on-failure`, y **un solo** project **`ui-anon`** (anónimo: M01-M05 son
  ejercicios de login por UI, sin sesión heredada).
- `tsconfig.json` — `strict`, tipos de `node` + `@playwright/test`, `resolveJsonModule`.
- `.env.example` — plantilla de variables (cópiala a `.env`, gitignored).
- `tests/ejemplo.spec.ts` — TC-001 (login) + TC-002 (catálogo), **con la
  duplicación deliberada**.
- `tests/reto.spec.ts` — TC-003 (filtrar por categoría "popular").

**Todavía NO existe** (llega en módulos siguientes): `data/`+`types/` (M03), `pages/`
(M04), `fixtures/`+`helpers/` (M05), `tests/setup/` (M06), `services/` (M07), CI real en
`.github/workflows/` (M08).

## Cómo correr

```bash
# 1. Instalar dependencias y navegadores
pnpm install
pnpm install:browsers

# 2. Configurar entorno (copia y ajusta)
cp .env.example .env

# 3. Chequeo de tipos (sin ejecutar tests)
pnpm typecheck

# 4. Ejecutar el smoke de M01
pnpm m1              # TC-001 + TC-002 en el project ui-anon
pnpm test:ui         # UI mode (recomendado la 1ª vez)
pnpm test:headed     # con browser visible
pnpm report          # abrir el último reporte HTML
```

> **Cold start de Render.** OmniPizza corre en free tier: el primer request del día
> tarda 30-40s. Si el primer run falla con `TimeoutError`, vuelve a correr — el
> backend ya estará despierto. Los timeouts del config están dimensionados para
> absorberlo.
