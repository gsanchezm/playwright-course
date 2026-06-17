# M06 · Guía del módulo: CI/CD + Debugging

**Duración estimada:** 40-50 min
**Pieza que suma al framework:** `.github/workflows/playwright.yml` con **matrix real por browser** + reports + traces como artefactos descargables.

---

## 🏗️ Arquitectura al terminar este módulo (estado FINAL del framework)

Aparece **`.github/workflows/`** — el cuarto del robot. Con eso el framework queda completo: el mismo suite que corres con `pnpm m4` ahora corre **en paralelo en GitHub Actions** cada vez que abres un PR.

```
playwright-course/                  ← 🎯 ESTADO FINAL del framework
├── .auth/                          ← (M04 — gitignored)
├── .env                            ← (M01 — gitignored)
├── .env.example                    ← (M01)
├── .github/                        ← 🆕
│   └── workflows/                  ← 🆕
│       └── playwright.yml          ← 🆕 matrix: 3 browsers × 2 shards + api
├── .gitignore                      ← (M01)
├── data/                           ← (M02) markets.json, users.json
├── fixtures/                       ← (M04) omnipizza.ts
├── helpers/                        ← (M04) unique-data.ts
├── pages/                          ← (M03) Base + Login + Catalog + Checkout
├── services/                       ← (M05) Base (abstract) + Auth + Order + Pizza
├── tests/
│   ├── api/                        ← (M05) auth.spec.ts, pizzas.spec.ts
│   └── setup/                      ← (M04) auth.setup.ts
├── types/                          ← (M02) omnipizza.d.ts
├── modulo-00-git-esencial/         ← (lecciones — no contribuyen al framework)
├── modulo-01-smoke-feo/            ← (M01)
├── modulo-02-locators-data/        ← (M02)
├── modulo-03-pom/                  ← (M03)
├── modulo-04-setup-fixtures/       ← (M04)
├── modulo-05-api-layer/            ← (M05)
├── modulo-06-ci-debugging/         ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts             ← 🆕 smoke canary, regression, demo trace
│   └── reto.md                     ← 🆕 segundo workflow con cron + issues automáticos
├── package.json
├── playwright.config.ts            ← (proyectos: setup, ui-{chromium,firefox,webkit}, api, anonymous)
└── tsconfig.json
```

**Pipeline en GitHub Actions** (qué pasa cuando haces `git push`):

```
git push ──► trigger: on.push / on.pull_request
                       │
                       ▼
           ┌─────────────────────────┐
           │  matrix: project×shard  │  ← se expande en 7 jobs
           └────────────┬────────────┘
                        │
   ┌──────────┬─────────┼──────────┬──────────┬──────────┬──────────┐
   ▼          ▼         ▼          ▼          ▼          ▼          ▼
chromium  chromium  firefox    firefox    webkit    webkit       api
shard 1   shard 2   shard 1    shard 2    shard 1   shard 2      (1 job)
   │         │         │          │          │          │          │
   └─────────┴─────────┴──────────┴──────────┴──────────┴──────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  Artefactos por job:     │
                     │  · HTML report           │
                     │  · test-results/*.zip    │  ◄── traces descargables
                     └──────────────────────────┘
```

**Flujo de secrets** (cómo viajan las credenciales sin filtrarse):

```
gh secret set BASE_URL          ──► GitHub almacena ENCRIPTADO
                                          │
                                          ▼
       workflow.yml: env: BASE_URL: ${{ secrets.BASE_URL }}
                                          │
                                          ▼
   playwright.config.ts: baseURL: process.env.BASE_URL  ◄── inyectado en runtime
                                          │
                                          ▼
                              borrado al terminar el job
```

---

## Analogía de apertura

Ya tenemos un framework completo, pero corre sólo en tu laptop. Lo que necesitamos ahora es que **un robot lo ejecute cada vez que alguien hace push** — eso es CI/CD. Y cuando un test falle, necesitamos la **caja negra del avión**: `Trace Viewer` reconstruye paso a paso qué hizo el test, con screenshots, red y consola, para encontrar el bug sin reproducirlo a mano.

---

## ¿Qué aprenderás?

1. **`fullyParallel`, `workers`, `shards`** — paralelismo real.
2. **`retries` en CI vs local** — 2 vs 0, y por qué.
3. **Trace Viewer protagónico** — leer una traza como un bug report multimedia.
4. **GitHub Actions con matrix real** — 3 browsers × 2 shards + api.
5. **`secrets.*`** — credenciales nunca en plaintext.
6. **Artefactos dobles** — HTML report + traces descargables del PR.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `fullyParallel: true` | Varios testers corriendo la misma suite a la vez, cada uno en su worker |
| `workers` | Cuántos testers paralelos tienes disponibles |
| `--shard=1/4` | Repartir 200 TCs entre 4 máquinas: ésta corre 50 |
| `retries: 2` | Reintenta 2 veces antes de marcar como roto |
| `trace: 'retain-on-failure'` | Graba caja negra sólo cuando algo sale mal |
| Trace Viewer | Reconstruye el vuelo sin tener que repetirlo |
| `matrix.project` | Ambientes del test plan corriendo en paralelo en el pipeline |
| `secrets.BASE_URL` | La caja fuerte del equipo: credenciales sólo durante la corrida |

---

## Workflow

El archivo `.github/workflows/playwright.yml` define:

```
matrix:
  project: [ui-chromium, ui-firefox, ui-webkit, api]
  shard:   [1, 2]
  exclude: api con shard 2    ← api corre 1 sola vez
```

Eso da **7 jobs en paralelo** (3 browsers × 2 shards + 1 api).

---

## Artefactos descargables

Cada job sube **2 artefactos**:

1. **`playwright-report-<project>-shard<N>`** — HTML report navegable.
2. **`playwright-traces-<project>-shard<N>`** — `test-results/` con traces, videos, screenshots.

Desde un PR fallido, descargas la traza y la abres con:

```bash
pnpm exec playwright show-trace path/to/trace.zip
```

---

## Paso a paso

### Paso 0 — Pre-requisitos

Antes de tocar CI:

```bash
# Estando en playwright-course/
pnpm m5            # API layer corre en verde
pnpm typecheck     # sin errores

# Para los pasos de GitHub vas a necesitar:
gh --version       # GitHub CLI (recomendado: 2.40+)
gh auth status     # debes estar logueado
git remote -v      # debe haber un `origin` apuntando a GitHub
```

Si no tienes `gh`, instálalo: macOS → `brew install gh`; Windows → `winget install --id GitHub.cli`; Linux → ver [`cli.github.com`](https://cli.github.com/).

Si no tienes remoto, vuelve a M04 (Git break: conectar el repo a GitHub).

---

### Paso 1 — Dependencias requeridas

**M06 no añade paquetes npm.** Lo que se agrega es **YAML** (workflows) y un reporter adicional (`junit`) que ya viene en `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Las 4 deben aparecer. Si no, ver M01 Paso 1.
```

Herramientas externas que SÍ necesitas:

| Herramienta | Cómo verificar | Cómo instalar si falta |
|---|---|---|
| `gh` (GitHub CLI) | `gh --version` | macOS: `brew install gh` · Windows: `winget install --id GitHub.cli` · Linux: paquete del repo · [cli.github.com](https://cli.github.com/) |
| `git` con remoto | `git remote -v` | M04 Git break — conectar repo a GitHub |
| Cuenta de GitHub con permisos `write` | `gh repo view --json viewerPermission` | Tienes que ser **admin / maintainer** del repo para crear issues automáticos (reto) |

---

### Paso 2 — Crear `.github/workflows/playwright.yml`

Crea la carpeta del workflow (un nivel por línea) y abre el archivo en VS Code — se crea al guardarlo:

```bash
mkdir .github
mkdir .github/workflows
code .github/workflows/playwright.yml
```

📄 `.github/workflows/playwright.yml` — pipeline matrix:

```yaml
# @file .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main, 'feature/**']
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  e2e:
    name: ${{ matrix.project }} / shard ${{ matrix.shard }}
    runs-on: ubuntu-latest
    timeout-minutes: 30
    defaults:
      run:
        working-directory: playwright-course
    strategy:
      fail-fast: false
      matrix:
        project: [ui-chromium, ui-firefox, ui-webkit, api]
        shard: [1, 2]
        exclude:
          # api no se beneficia de browsers ni shardear mucho
          - project: api
            shard: 2

    env:
      BASE_URL: ${{ secrets.BASE_URL }}
      API_URL: ${{ secrets.API_URL }}
      TEST_USER_USERNAME: ${{ secrets.TEST_USER_USERNAME }}
      TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
      DEFAULT_COUNTRY: MX

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run tests
        run: |
          if [ "${{ matrix.project }}" = "api" ]; then
            pnpm exec playwright test --project=api
          else
            pnpm exec playwright test --project=${{ matrix.project }} --shard=${{ matrix.shard }}/2
          fi

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.project }}-shard${{ matrix.shard }}
          path: playwright-course/playwright-report
          retention-days: 7

      - name: Upload traces and videos
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces-${{ matrix.project }}-shard${{ matrix.shard }}
          path: playwright-course/test-results
          retention-days: 7
```

> 🔍 **`defaults.run.working-directory` y los prefijos `playwright-course/` de los `path:`** existen porque en el repo del curso el proyecto vive en un subfolder `playwright-course/` dentro de la raíz del repo. El bloque `defaults.run.working-directory` aplica a **todos** los steps `run` del job (install, browsers y tests) — pero los `path:` de `upload-artifact` no lo respetan, por eso llevan el prefijo explícito. Si en TU repo la raíz ES el proyecto (el `package.json` vive en la raíz), omite ese bloque `defaults` y los prefijos `playwright-course/` de los `path:` (déjalos como `playwright-report` y `test-results`).

**Anatomía del workflow, línea por línea** (las claves que el resto del módulo no explica):

| Línea | Qué hace |
|---|---|
| `name: Playwright Tests` | Nombre del workflow tal como aparece en la pestaña **Actions** y en `gh workflow list` |
| `on:` | Los tres disparadores: `push` a `main` o a ramas `feature/**`, `pull_request` contra `main`, y `workflow_dispatch` (el botón "Run workflow" para correrlo a mano) |
| `jobs.e2e` + `name: ${{ matrix.project }} / shard ${{ matrix.shard }}` | `e2e` es el **id** del job; el `name` interpolado es la etiqueta legible de cada job de la matrix (p.ej. `ui-firefox / shard 2`) |
| `runs-on: ubuntu-latest` | La VM donde corre cada job: un runner Linux efímero que GitHub crea y destruye en cada corrida |
| `timeout-minutes: 30` | Mata el job si se cuelga más de 30 min — sin esto, un test colgado consume el runner indefinidamente |
| `strategy.fail-fast: false` | Sin esta línea, el primer job fallido **cancela a todos sus hermanos** de la matrix — y pierdes los reportes de los demás browsers |
| `matrix` + `exclude` | `project × shard` expande 4×2 = 8 combinaciones; el `exclude` quita `api`+`shard 2` → **7 jobs** |
| `env:` a nivel job | Variables disponibles en **todos** los steps. Las credenciales vienen de `secrets.*` (encriptadas — Paso 5); `DEFAULT_COUNTRY: MX` va en texto plano porque **no es un secreto**: es el mercado por defecto que consumen los tests data-driven (M02) |
| `actions/checkout@v4` | Clona tu repo dentro del runner — sin esto el runner está vacío |
| `actions/setup-node@v4` (`node-version: 24`) | Instala Node 24, la misma major que usas en local |
| `pnpm/action-setup@v4` (`version: 10`) | Instala pnpm **pineado a la versión 10**. Alternativa: `corepack enable` (activa el pnpm que declare `package.json`); aquí se usa la action para dejar la versión fijada y visible en el propio YAML |
| `pnpm install --frozen-lockfile` | Falla si `pnpm-lock.yaml` no cuadra con `package.json` — CI instala **exactamente** lo lockeado: builds reproducibles |
| `playwright install --with-deps` | Descarga los navegadores **y** las librerías del SO que necesitan (el runner es un Linux pelado) |
| El `if/else` del step `Run tests` | `api` corre completo en su único job — si lo shardearas con `--shard=1/2` (y el shard 2 excluido), la mitad de sus tests **jamás se ejecutaría**; los projects `ui-*` sí se reparten con `--shard=N/2` |
| `if: always()` | Sube los artefactos **aunque el job falle** — las trazas de los jobs rojos son justo las que necesitas |
| `retention-days: 7` | GitHub borra los artefactos a los 7 días: suficiente para debuggear el PR sin acumular gigabytes |

> ⚠️ **`if: always()` es crítico:** sin esa línea, los artefactos solo se suben cuando el job pasa — exactamente al revés de lo que necesitas. Las trazas de los jobs FALLIDOS son las que te interesan.

> 🔷 **TypeScript — template literals `${...}` vs interpolación de Actions `${{ ... }}`**
> Cuidado con las **dos** sintaxis de interpolación: en TS un template literal usa **una** llave — `` `shard ${n}` `` — y se evalúa en tu código; en este YAML, `${{ secrets.BASE_URL }}` usa **dobles** llaves y lo evalúa el motor de GitHub Actions, no TypeScript. El único TS de este módulo vive en `playwright.config.ts` (siguiente paso); el workflow es YAML.
> 📚 Lo viste en [TS · M02 — types y template literals](/docs/typescript/m2-strings). Aquí lo aplicas para no confundir el `${...}` de TS con el `${{ ... }}` de Actions.

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado FINAL del curso)

> **📐 Config — cambios vs M05 (estado FINAL del curso)**
> ```diff
>   export default defineConfig({
> +   fullyParallel: true,
> +   forbidOnly: !!process.env.CI,
> +   retries: process.env.CI ? 2 : 0,
> +   workers: process.env.CI ? 2 : undefined,
> -   reporter: [["html", { open: "never" }], ["list"]],
> +   reporter: process.env.CI
> +     ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "results.xml" }]]
> +     : [["html", { open: "never" }], ["list"]],
>     use: {
> +     video: "retain-on-failure",
>     },
>     projects: [
>       // ... setup, ui-chromium/firefox/webkit, api (de M04/M05) ...
> +     { name: "anonymous", use: { ...devices["Desktop Chrome"] }, testMatch: /tests\/.*\.anon\.spec\.ts/ },
>     ]
>   })
> ```
> **Se mantiene:** projects `setup` + 3 browsers + `api`. **Entra:** flags de CI (`fullyParallel`, `forbidOnly`, `retries`, `workers`), reporters condicionales (`github` + `junit` sólo en CI), `video: "retain-on-failure"`, y el 5º project `anonymous` (flujos sin sesión: login negativo, signup).

M06 añade los **flags de comportamiento en CI**: `fullyParallel`, `retries`, `workers`, reporters extra (`github`, `junit`), `forbidOnly` y un quinto project `anonymous` para flujos negativos.

**Estado completo del config en M06 (= estado final del framework):**

```ts
// @file playwright.config.ts
// playwright.config.ts — Estado en M06 (FINAL)
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";

export default defineConfig({
  testDir: ".",
  testMatch: [/tests\/.*\.(spec|setup)\.ts/, /modulo-.*\/.*\.spec\.ts/],

  // 🆕 Paralelismo + reintentos solo en CI
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  timeout: 60_000,
  expect: { timeout: 10_000 },

  // 🆕 Reporters extra cuando estamos en CI
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "results.xml" }]]
    : [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",   // 🆕 video al fallar
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  projects: [
    { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/],
    },
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
    },
    {
      name: "anonymous",   // 🆕 para tests sin sesión (login negativo, etc.)
      use: { ...devices["Desktop Chrome"] },
      testMatch: /tests\/.*\.anon\.spec\.ts/,
    },
  ],
});
```

> 🔷 **TypeScript — config tipado (`PlaywrightTestConfig` / `projects[]`)**
> `defineConfig(...)` no es decorativo: aplica el tipo `PlaywrightTestConfig`, así que el editor te autocompleta `retries`, `workers`, `projects[]` y te marca en rojo si escribes una clave inexistente o un valor del tipo equivocado (p.ej. `trace: "siempre"`). `projects` es un **array tipado** de objetos con forma fija: cada entrada debe tener `name`, y opcionalmente `use`, `dependencies`, `testMatch`/`testIgnore`. Esa forma fija es lo que una `interface` describe.
> 📚 Lo viste en [TS · M06 — interfaces y contratos de objetos](/docs/typescript/m6-api-response). Aquí lo aplicas: cada objeto de `projects[]` cumple el contrato que Playwright espera.

**Diff conceptual vs M05:**

| Cambio | Por qué |
|---|---|
| `fullyParallel: true` | Aprovecha múltiples workers en CI |
| `retries: process.env.CI ? 2 : 0` | 2 reintentos solo en CI; en local, 0 (no escondas flakes) |
| `workers: process.env.CI ? 2 : undefined` | Limita workers en CI (GitHub runners tienen 2 CPUs) |
| `forbidOnly: !!process.env.CI` | Hace fallar el job si dejaste un `test.only(...)` por error |
| `reporter: process.env.CI ? [...] : [...]` | `github` annotations + `junit` para integración externa |
| `video: "retain-on-failure"` | Video disponible en el HTML report cuando algo se cae |
| Project `anonymous` | Tests sin storageState (login negativo, signup flows) |

> 🔍 **Detalle que parece obvio — `retries: process.env.CI ? 2 : 0`**
> **Qué es:** dos reintentos automáticos cuando un test falla en CI; **cero** reintentos cuando corres en local.
> **Por qué así (y no la alternativa obvia):** en CI los runners comparten CPU, la red es más lenta y Render hace cold start — un fallo aislado suele ser ruido, así que 2 reintentos evitan PRs rojos por flakes. En **local** lo quieres al revés: si un test falla, quieres **verlo fallar**, no que un reintento lo esconda y te haga creer que todo está verde.
> **Qué pasa si lo cambias:** si pones `retries > 0` en local, estás ocultando flakes en el peor momento — el desarrollo. Un test inestable pasará "por casualidad" en el segundo intento y nunca lo arreglarás hasta que reviente en CI o en producción.

> 🔍 **Detalle que parece obvio — `fullyParallel: true` (+ `workers`)**
> **Qué es:** paraleliza a nivel de **test individual**, no sólo a nivel de archivo; `workers` limita cuántos corren a la vez.
> **Por qué así (y no la alternativa obvia):** por defecto Playwright paraleliza entre archivos pero corre los tests *dentro* de un archivo en serie. Con `fullyParallel: true` cada test es candidato a su propio worker, exprimiendo los runners. `workers: process.env.CI ? 2 : undefined` topa el paralelismo a 2 en CI (los runners de GitHub tienen 2 CPUs) y deja que en local Playwright elija según tus cores.
> **Qué pasa si lo cambias:** sin `fullyParallel`, un archivo con 30 tests se vuelve un cuello de botella secuencial. Si subes `workers` por encima de los CPUs reales del runner, los tests pelean por recursos, se vuelven lentos y aparecen flakes por timeouts.

> 🔷 **TypeScript — operador ternario `cond ? a : b`**
> `process.env.CI ? 2 : 0` es una **expresión** que devuelve un valor (no un `if` que ejecuta sentencias): se usa donde la propiedad espera un número. El gotcha: como `process.env.CI` es un `string | undefined`, el ternario lee su *truthiness* (la cadena vacía o `undefined` cuentan como falso) — de ahí el `!!` que verás en `forbidOnly` (recuadro siguiente).
> 📚 Lo viste en [TS · M03 — funciones y lógica](/docs/typescript/m3-login). Aquí lo aplicas para que `retries`, `workers` y los reporters cambien según el entorno.

> 🔍 **Detalle que parece obvio — `forbidOnly: !!process.env.CI`**
> **Qué es:** en CI, hace **fallar el build** si quedó un `test.only(...)` o `describe.only(...)` olvidado en el código (el `!!` fuerza `process.env.CI` — un `string | undefined` — a un `boolean` real).
> **Por qué así (y no la alternativa obvia):** un `.only` olvidado es silencioso y catastrófico: hace que Playwright corra **sólo ese test** e ignore todos los demás. El suite sale verde con 1 test ejecutado y 200 saltados — y nadie lo nota. `forbidOnly` convierte ese descuido en un error ruidoso que bloquea el merge.
> **Qué pasa si lo cambias:** si lo pones en `false` (o no lo activas en CI), un `.only` puede pasar la revisión y dejar tu pipeline "verde" mientras en realidad no está testeando casi nada.

> 🔍 **Detalle que parece obvio — `video: "retain-on-failure"` / `screenshot: "only-on-failure"`**
> **Qué es:** video y screenshot se guardan **únicamente cuando el test falla**, mismo principio que el `trace`. En M06 sólo el `video` es nuevo: el `screenshot: "only-on-failure"` ya lo traías de módulos anteriores.
> **Por qué así (y no la alternativa obvia):** capturar video y screenshots de cada test verde es desperdicio puro: nadie revisa el video de un test que pasó. Limitarlos al fallo te da el material de diagnóstico justo cuando lo necesitas, sin inflar los artefactos.
> **Qué pasa si lo cambias:** `video: "on"` multiplica el tamaño de `test-results/` y el tiempo de cada job; desactivarlo del todo te deja sin el clip que muchas veces explica el fallo más rápido que la propia traza.

Añade los scripts de M06 al `package.json`:

```json
"scripts": {
  "m6": "playwright test modulo-06-ci-debugging --project=ui-chromium",
  "test:smoke": "playwright test --grep @smoke",
  "test:regression": "playwright test --grep @regression"
}
```

El patrón `process.env.CI ? X : Y` se apoya en que GitHub Actions (y casi todos los CI) **siempre** expone `CI=true` como variable de entorno en cada job — no la defines tú. Eso permite tener un solo config que se comporta distinto en local vs en pipeline, sin condicionales feas ni flags manuales en cada script.

> 🔍 **Detalle que parece obvio — `process.env.CI`**
> **Qué pasa si lo cambias:** si la seteas a mano en local, tu máquina se comporta como CI (2 retries, `forbidOnly`, reporters extra) y pierdes justo las ventajas de correr en local. Para *simular* CI a propósito, sí la seteas temporalmente: `CI=true pnpm m6` (bash) / `$env:CI="true"; pnpm m6` (PowerShell).

---

### Paso 4 — Lectura guiada de `.github/workflows/playwright.yml`

Abre el workflow y observa:

1. **`on:`** — qué dispara el job (`push`, `pull_request`, `workflow_dispatch` para correr a mano).
2. **`strategy.matrix`** — la combinación `project × shard` que produce los N jobs paralelos.
3. **`steps:`** — `checkout` → `setup-node` → `pnpm install` → `playwright install` → `playwright test --shard ...` → upload artifacts.
4. **`env:`** + **`secrets.*`** — cómo viajan `BASE_URL`, `API_URL`, `TEST_USER_*` sin estar en plaintext.
5. **`if: always()`** en el `upload-artifact` — sube reports incluso cuando el test falla (es cuando más los necesitas).

> 💡 **Pregúntate:** *"¿qué pasa si elimino la línea `if: always()`?"* — respuesta: en jobs fallidos NO se suben los artefactos, así que no puedes investigar. Es el bug más típico de pipelines de testing.

---

### Paso 5 — Configurar los secrets

Antes de pushear, configura los secrets en el repo. **Una sola vez:**

```bash
# Desde la raíz del repo:
gh secret set BASE_URL --body "https://omnipizza-frontend.onrender.com"
gh secret set API_URL --body "https://omnipizza-backend.onrender.com"
gh secret set TEST_USER_USERNAME --body "standard_user"
gh secret set TEST_USER_PASSWORD --body "pizza123"

# Verifica
gh secret list
# Esperado: 4 secrets listados, sin mostrar el valor.
```

**Alternativa por UI:** Settings → Secrets and variables → Actions → New repository secret.

> ⚠️ **Importante (seguridad):** el `.env` local **nunca** se commitea; en CI los valores viven en `secrets`, que GitHub inyecta como variables de entorno durante la corrida y luego desaparecen. Este es el mensaje de seguridad más importante del módulo.

---

## ▶️ Cómo ejecutar este módulo

- **Comando del módulo:** `pnpm m6`
- **UI mode:** `pnpm test:ui`
- **Debug:** `pnpm test:debug`
- **Ver el reporte:** `pnpm report`

**Forzar traza / ver traza** (y comandos `gh` que ya usabas en los pasos):

```bash
# Local — forzar y leer trazas
pnpm exec playwright test --trace=on
pnpm exec playwright show-trace <trace.zip>
pnpm exec playwright show-report
DEMO_FAIL=1 pnpm exec playwright test modulo-06-ci-debugging --project=ui-chromium

# GitHub CLI
gh secret set BASE_URL
gh secret list
gh pr create
gh pr checks --watch
gh run list --workflow=playwright.yml --limit 5
gh run view <run-id> --log
gh run download <run-id>
```

**🪟 Windows / PowerShell:** las variables de entorno se setean con `$env:VAR="x"; pnpm m6` — **no** con `VAR=x pnpm m6` (esa sintaxis es de bash y en PowerShell falla). Ejemplos:

```powershell
# Forzar el fallo del demo en PowerShell
$env:DEMO_FAIL="1"; pnpm exec playwright test modulo-06-ci-debugging --project=ui-chromium

# Simular CI en local (2 retries, forbidOnly, reporters extra)
$env:CI="true"; pnpm m6
```

---

## Outcome esperado

- [ ] Configuraste los 4 secrets con `gh secret set` y los viste listados con `gh secret list`.
- [ ] Sabes generar una traza con `--trace=on` y abrirla con `show-trace`.
- [ ] Forzaste un fallo con `DEMO_FAIL=1` y leíste su traza.
- [ ] El workflow de CI corre verde en tu PR (7 jobs en paralelo).
- [ ] Sabes descargar artefactos de un job fallido con `gh run download`.
- [ ] Explicas por qué `retries: 2` en CI pero `0` en local.
- [ ] Completaste el reto: workflow programado con cron + creación de issue automática.
- [ ] Entiendes que los secrets **nunca** viven en el repo.
