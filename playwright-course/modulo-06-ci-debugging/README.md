# Módulo 06 — CI/CD + Debugging con Trace Viewer

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

> 💡 **Para el facilitador:** este es el momento para hacer la pregunta de cierre: *"¿cuántas carpetas tiene el framework y cuántas se justificaron por dolor?"*. Respuesta: **cada carpeta** entró cuando un módulo anterior la pidió. Eso es **arquitectura just-in-time**, el principio rector de todo el curso.

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

Si no tienes `gh`, instálalo: macOS → `brew install gh`; Linux → ver [`cli.github.com`](https://cli.github.com/).

Si no tienes remoto, vuelve a M04 (Git break: conectar el repo a GitHub).

> 💡 **Para el facilitador:** este módulo asume que el repo ya tiene `origin` en GitHub. Si alguien todavía no lo tiene, dedícale 5 minutos al setup de SSH antes de continuar — sin remoto no hay CI.

---

### Paso 1 — Dependencias requeridas

**M06 no añade paquetes npm.** Lo que se agrega es **YAML** (workflows) y un reporter adicional (`junit`) que ya viene en `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
# Las 4 deben aparecer. Si no, ver M01 Paso 1.
```

Herramientas externas que SÍ necesitas:

| Herramienta | Cómo verificar | Cómo instalar si falta |
|---|---|---|
| `gh` (GitHub CLI) | `gh --version` | macOS: `brew install gh` · Linux: paquete del repo · [cli.github.com](https://cli.github.com/) |
| `git` con remoto | `git remote -v` | M04 Git break — conectar repo a GitHub |
| Cuenta de GitHub con permisos `write` | `gh repo view --json viewerPermission` | Tienes que ser **admin / maintainer** del repo para crear issues automáticos (reto) |

---

### Paso 2 — Crear `.github/workflows/playwright.yml`

```bash
mkdir -p .github/workflows
touch .github/workflows/playwright.yml
```

📄 `.github/workflows/playwright.yml` — pipeline matrix:

```yaml
name: Playwright

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        project: [ui-chromium, ui-firefox, ui-webkit, api]
        shard: [1, 2]
        exclude:
          - project: api    # api corre 1 sola vez (no se shardea)
            shard: 2
    defaults:
      run:
        working-directory: playwright-course
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: corepack enable
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps

      - name: Run ${{ matrix.project }} (shard ${{ matrix.shard }}/2)
        run: |
          if [ "${{ matrix.project }}" = "api" ]; then
            pnpm exec playwright test --project=api
          else
            pnpm exec playwright test --project=${{ matrix.project }} --shard=${{ matrix.shard }}/2
          fi
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          API_URL:  ${{ secrets.API_URL }}
          TEST_USER_USERNAME: ${{ secrets.TEST_USER_USERNAME }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.project }}-shard${{ matrix.shard }}
          path: playwright-course/playwright-report
          retention-days: 7

      - name: Upload traces / videos
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces-${{ matrix.project }}-shard${{ matrix.shard }}
          path: playwright-course/test-results
          retention-days: 7
```

> ⚠️ **`if: always()` es crítico:** sin esa línea, los artefactos solo se suben cuando el job pasa — exactamente al revés de lo que necesitas. Las trazas de los jobs FALLIDOS son las que te interesan.

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

Añade los scripts de M06 al `package.json`:

```json
"scripts": {
  "m6": "playwright test modulo-06-ci-debugging --project=ui-chromium",
  "test:smoke": "playwright test --grep @smoke",
  "test:regression": "playwright test --grep @regression"
}
```

> 💡 **Para el facilitador:** explica el patrón `process.env.CI ? X : Y` — GitHub Actions **siempre** expone `CI=true` como variable de entorno. Eso permite tener un solo config que se comporta distinto en local vs en pipeline, sin condicionales feas en cada script.

---

### Paso 4 — Lectura guiada de `.github/workflows/playwright.yml`

Abre el workflow con el grupo y señala:

1. **`on:`** — qué dispara el job (`push`, `pull_request`, `workflow_dispatch` para correr a mano).
2. **`strategy.matrix`** — la combinación `project × shard` que produce los N jobs paralelos.
3. **`steps:`** — `checkout` → `setup-node` → `pnpm install` → `playwright install` → `playwright test --shard ...` → upload artifacts.
4. **`env:`** + **`secrets.*`** — cómo viajan `BASE_URL`, `API_URL`, `TEST_USER_*` sin estar en plaintext.
5. **`if: always()`** en el `upload-artifact` — sube reports incluso cuando el test falla (es cuando más los necesitas).

> 💡 **Pregunta al grupo:** *"¿qué pasa si elimino la línea `if: always()`?"* — respuesta: en jobs fallidos NO se suben los artefactos, así que no puedes investigar. Es el bug más típico de pipelines de testing.

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

> ⚠️ **Para el facilitador:** repite tres veces: *"el `.env` local nunca se commitea; en CI los valores viven en `secrets`, que GitHub inyecta como variables de entorno durante la corrida y luego desaparecen"*. Este es el mensaje de seguridad más importante del módulo.

---

### Paso 6 — Forzar una traza local (sin CI todavía)

Antes de confiar en CI, practica leer una traza en local:

```bash
# 1. Forzar traza ON en una corrida normal
pnpm exec playwright test modulo-01-smoke-feo --trace=on --project=ui-chromium

# 2. Listar los resultados generados
ls test-results/
# Verás carpetas tipo `modulo-01-smoke-feo-...-chromium`

# 3. Abrir el trace
pnpm exec playwright show-trace test-results/<carpeta>/trace.zip
```

**Qué explorar en el Trace Viewer:**

- **Timeline** (arriba): cada acción del test como una franja temporal.
- **DOM snapshot**: estado del DOM en cada paso (click derecho → "Show element").
- **Network**: cada request HTTP con headers + response.
- **Console**: lo que la app imprimió en `console.log`.
- **Source**: el código del test sincronizado con el paso.

> 💡 **Para el facilitador:** dedica 5 minutos aquí. **Ningún concepto del módulo importa más que ver una traza**. Si el grupo no asimila el Trace Viewer, todo lo demás suena a "más CI".

---

### Paso 7 — Forzar un fallo intencional y leer su traza

`ejemplo.spec.ts` tiene un test `@debug` que **falla a propósito** si activas la flag `DEMO_FAIL=1`:

```bash
DEMO_FAIL=1 pnpm exec playwright test modulo-06-ci-debugging --project=ui-chromium
# El test va a fallar después de 2s.

# Abre la traza generada:
pnpm exec playwright show-trace test-results/<carpeta-debug>/trace.zip
```

Muestra al grupo cómo en el último paso se ve el screenshot final + el locator que nunca apareció. **Eso es lo que recibes en un PR fallido**.

---

### Paso 8 — Pushear y observar el pipeline

```bash
# 1. Crea una rama (si no estás ya en una)
git switch -c feature/m06-ci

# 2. Commit (si tienes cambios)
git add .
git commit -m "feat(m06): habilita CI workflow"

# 3. Push
git push -u origin feature/m06-ci

# 4. Abre el PR
gh pr create --base main --head feature/m06-ci \
  --title "feat(m06): habilita CI workflow" \
  --body "Pipeline matrix sobre 3 browsers + API"

# 5. Sigue los checks en vivo
gh pr checks --watch
```

**Qué deberías ver:** **7 jobs** corriendo en paralelo (3 browsers × 2 shards + 1 api). Cuando terminen, todos en verde.

---

### Paso 9 — Descargar artefactos de un PR

Si algún job falla:

```bash
# Lista las corridas recientes
gh run list --workflow=playwright.yml --limit 5

# Descarga todos los artefactos de una corrida
gh run download <run-id>

# Lo descarga a carpetas por nombre de artefacto:
ls
# playwright-report-ui-chromium-shard1/
# playwright-traces-ui-chromium-shard1/
# ...

# Abre el trace del job fallido:
pnpm exec playwright show-trace playwright-traces-ui-chromium-shard1/*/trace.zip
```

> 💡 **Para el facilitador:** insiste en que el flujo *"PR rojo → descargo artefactos → leo la traza"* es el día a día de un automatizador. Practicarlo aquí evita pánico en el primer fallo real en su trabajo.

---

### Paso 10 — Resolver el reto

El reto pide crear un **segundo workflow** que corra **diariamente** (cron) un subset de smoke contra el deploy live, y abra un **issue automático** si falla.

Los pasos están documentados con detalle en `reto.md`. Síguelos en orden y entrega:

1. `.github/workflows/smoke-daily.yml` con cron + `workflow_dispatch`.
2. Un issue de ejemplo (puedes forzar fallo con `DEMO_FAIL=1`).
3. El badge del workflow en el `README.md` principal.

---

## 🔍 Detalles que parecen obvios pero no lo son

### `retries: process.env.CI ? 2 : 0`
- **Qué es:** dos reintentos automáticos cuando un test falla en CI; **cero** reintentos cuando corres en local.
- **Por qué así (y no la alternativa obvia):** en CI los runners comparten CPU, la red es más lenta y Render hace cold start — un fallo aislado suele ser ruido, así que 2 reintentos evitan PRs rojos por flakes. En **local** lo quieres al revés: si un test falla, quieres **verlo fallar**, no que un reintento lo esconda y te haga creer que todo está verde.
- **Qué pasa si lo cambias:** si pones `retries > 0` en local, estás ocultando flakes en el peor momento — el desarrollo. Un test inestable pasará "por casualidad" en el segundo intento y nunca lo arreglarás hasta que reviente en CI o en producción.

### `process.env.CI`
- **Qué es:** la variable de entorno que el config usa para decidir si está corriendo en pipeline o en tu máquina.
- **Por qué así (y no la alternativa obvia):** **no la defines tú.** GitHub Actions (y casi todos los CI) la inyecta automáticamente como `CI=true` en cada job. Eso te da un único `playwright.config.ts` que se comporta distinto en los dos mundos, sin scripts duplicados ni flags manuales.
- **Qué pasa si lo cambias:** si intentas setearla a mano en local, harás que tu máquina se comporte como CI (2 retries, `forbidOnly`, reporters extra) y perderás justo las ventajas de correr en local. Para *simular* CI a propósito, sí la seteas temporalmente (ver comandos abajo).

### `forbidOnly: !!process.env.CI`
- **Qué es:** en CI, hace **fallar el build** si quedó un `test.only(...)` o `describe.only(...)` olvidado en el código.
- **Por qué así (y no la alternativa obvia):** un `.only` olvidado es silencioso y catastrófico: hace que Playwright corra **sólo ese test** e ignore todos los demás. El suite sale verde con 1 test ejecutado y 200 saltados — y nadie lo nota. `forbidOnly` convierte ese descuido en un error ruidoso que bloquea el merge.
- **Qué pasa si lo cambias:** si lo pones en `false` (o no lo activas en CI), un `.only` puede pasar la revisión y dejar tu pipeline "verde" mientras en realidad no está testeando casi nada.

### `fullyParallel: true`
- **Qué es:** paraleliza a nivel de **test individual**, no sólo a nivel de archivo; `workers` limita cuántos corren a la vez.
- **Por qué así (y no la alternativa obvia):** por defecto Playwright paraleliza entre archivos pero corre los tests *dentro* de un archivo en serie. Con `fullyParallel: true` cada test es candidato a su propio worker, exprimiendo los runners. `workers: process.env.CI ? 2 : undefined` topa el paralelismo a 2 en CI (los runners de GitHub tienen 2 CPUs) y deja que en local Playwright elija según tus cores.
- **Qué pasa si lo cambias:** sin `fullyParallel`, un archivo con 30 tests se vuelve un cuello de botella secuencial. Si subes `workers` por encima de los CPUs reales del runner, los tests pelean por recursos, se vuelven lentos y aparecen flakes por timeouts.

### `trace: "retain-on-failure"`
- **Qué es:** graba la traza (la "caja negra") **sólo cuando un test falla**, no en cada corrida.
- **Por qué así (y no la alternativa obvia):** `trace: "on"` graba la traza de **todos** los tests, pasen o fallen. Eso es lento y genera artefactos pesados que casi nunca vas a abrir. `retain-on-failure` te da exactamente la traza que necesitas — la del test roto — sin cargar el pipeline con cientos de zips inútiles.
- **Qué pasa si lo cambias:** con `"on"` cada PR sube gigabytes de trazas y los jobs tardan más; con `"off"` te quedas ciego cuando algo falla en CI y no puedes reproducir el bug.

### `video: "retain-on-failure"` / `screenshot: "only-on-failure"`
- **Qué es:** mismo principio que el trace — video y screenshot se guardan **únicamente cuando el test falla**.
- **Por qué así (y no la alternativa obvia):** capturar video y screenshots de cada test verde es desperdicio puro: nadie revisa el video de un test que pasó. Limitarlos al fallo te da el material de diagnóstico justo cuando lo necesitas, sin inflar los artefactos.
- **Qué pasa si lo cambias:** `video: "on"` multiplica el tamaño de `test-results/` y el tiempo de cada job; desactivarlo del todo te deja sin el clip que muchas veces explica el fallo más rápido que la propia traza.

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
