# m08-ci-debugging — proyecto autocontenido (framework completo)

Snapshot **runnable** de `playwright-course` **al terminar el Módulo 08**
(CI + debugging) sobre **OmniPizza**. Es el **capstone**: el framework **completo**,
con las 6 capas y los 8 módulos, cableado para correr la suite entera en CI. El "por
qué" vive en [`../../modulo-08-ci-debugging/README.md`](../../modulo-08-ci-debugging/README.md).

## Qué contiene (todo el framework)

- **Todas las capas:** `data/`, `types/`, `pages/`, `fixtures/`, `helpers/`,
  `services/`, `tests/` (setup + api).
- **Todos los módulos:** `modulo-01-smoke-feo/` … `modulo-08-ci-debugging/`.
- **Config final:** los 5 projects (`setup`, `ui-chromium/firefox/webkit`, `api`,
  `ui-anon`) + flags de CI (`fullyParallel`, `forbidOnly`, `retries`, `workers`),
  reporters de CI (`github` + `junit`) y `video: retain-on-failure`.
- `.github/workflows/playwright.yml` — el workflow de GitHub Actions que corre la
  suite en CI (deja de estar *latente*: aquí es su lección).

> **Por qué M08 sí es el framework completo** (a diferencia de M01-M07, que son
> proyectos enfocados en su lección): el tema de M08 **es** integrar y correr **toda**
> la suite en CI. Un snapshot enfocado no tendría suite que orquestar.

## Cómo correr

```bash
pnpm install
pnpm install:browsers
cp .env.example .env
pnpm typecheck

# Atajos por módulo
pnpm m1 ; pnpm m2 ; pnpm m3 ; pnpm m4   # UI anónimos (ui-anon)
pnpm m5 ; pnpm m6                # UI autenticado (setup → ui-chromium)
pnpm m7                          # API (project api)
pnpm m8                          # UI autenticado (CI)

# Suites transversales
pnpm test                        # toda la suite (todos los projects)
pnpm test:cross                  # chromium + firefox + webkit
pnpm test:api                    # solo API
pnpm report
```

> **CI.** El workflow `.github/workflows/playwright.yml` inyecta `BASE_URL`/`API_URL`
> y credenciales vía `secrets.*` y sube el HTML report + junit como artifacts.
> **Cold start de Render:** los `retries: 2` en CI absorben el primer request lento.
