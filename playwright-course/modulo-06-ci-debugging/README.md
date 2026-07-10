# Módulo 06 — CI/CD + Debugging con Trace Viewer

**Duración estimada:** 40-50 min
**Pieza que suma al framework:** `.github/workflows/playwright.yml` con **matrix real por browser** + reports + traces como artefactos descargables.

---

> 🎁 **Proyecto de referencia — [`proyecto/`](proyecto/).** Este módulo trae una carpeta `proyecto/`: un proyecto Playwright **autocontenido y ejecutable** con el **framework completo** (los 6 módulos + CI) ya armado (su propio `package.json` · `playwright.config.ts` · `tsconfig.json` · `.env.example`, independiente del monorepo del curso). Es la **solución de referencia** para comparar: ábrela aparte y corre `pnpm install` → `cp .env.example .env` → `pnpm test`. Los pasos de este README siguen construyendo **tu** proyecto incremental; `proyecto/` es el "ya resuelto". Detalles en [`proyecto/README.md`](proyecto/README.md).

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
├── playwright.config.ts            ← (proyectos: ui-anon, setup, ui-{chromium,firefox,webkit}, api)
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

> **Cómo leer esta sección.** Cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. El micro-paso te dice exactamente **qué archivo creas o editas** y en qué orden, para que el árbol de `🏗️ Arquitectura` se construya solo. Las acciones de Git/GitHub Actions no van en un bloque aparte: aparecen **inline**, en el micro-paso donde el flujo las pide.

### Paso 0 — Pre-requisitos

Antes de tocar CI, asegúrate de que el framework de M05 corre verde **en local** y de que tienes las herramientas de GitHub listas.

**0.1 — Verifica que M05 está verde**
- **Qué hago:** desde `playwright-course/`, corro la suite anterior y el typecheck.
  ```bash
  pnpm m5            # API layer corre en verde
  pnpm typecheck     # sin errores
  ```
- **Por qué:** CI sólo amplifica lo que ya tienes. Si M05 falla en tu laptop, va a fallar en 7 jobs paralelos a la vez — y vas a debuggear en el peor sitio (un runner remoto) en vez de en tu máquina.
- **Cómo verifico:** ambos comandos terminan en verde; `pnpm typecheck` no imprime errores.

**0.2 — Verifica las herramientas de GitHub**
- **Qué hago:** confirmo que `gh` está instalado, que estoy logueado y que hay un remoto `origin`.
  ```bash
  gh --version       # GitHub CLI (recomendado: 2.40+)
  gh auth status     # debes estar logueado
  git remote -v      # debe haber un `origin` apuntando a GitHub
  ```
- **Por qué:** todo el módulo (secrets, push, PR, descargar artefactos) se apoya en `gh` y en un repo remoto. Sin `origin` en GitHub, **no hay CI** que observar.
- **Cómo verifico:** `gh auth status` dice *"Logged in"*; `git remote -v` lista un `origin` apuntando a `github.com`. Si falta `gh`: macOS → `brew install gh`; Windows → `winget install --id GitHub.cli`; Linux → [`cli.github.com`](https://cli.github.com/). Si falta el remoto, vuelve a M03 (Paso 0.3: crear el repo en GitHub y conectarlo).

> 💡 **Para el facilitador:** este módulo asume que el repo ya tiene `origin` en GitHub. Si alguien todavía no lo tiene, dedícale 5 minutos al setup del remoto (HTTPS o SSH; ver M03 Paso 0.3) antes de continuar — sin remoto no hay CI.

---

### Paso 1 — Dependencias requeridas

**M06 no añade paquetes npm.** Lo que se agrega es **YAML** (workflows) y un reporter adicional (`junit`) que ya viene en `@playwright/test`.

**1.1 — Confirma las dependencias de Playwright**
- **Qué hago:** listo los 4 paquetes que ya instalaste en M01.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node
  ```
- **Por qué:** M06 no instala nada nuevo de npm; sólo necesita que la base de M01 siga ahí. El reporter `junit` y el `github` no son paquetes: vienen dentro de `@playwright/test`.
- **Cómo verifico:** las 4 dependencias aparecen listadas. Si falta alguna, vuelve a M01 Paso 1.

**1.2 — Confirma las herramientas externas (no son npm)**
- **Qué hago:** reviso que tengo `gh`, un remoto y permisos de escritura sobre el repo.

  | Herramienta | Cómo verificar | Cómo instalar si falta |
  |---|---|---|
  | `gh` (GitHub CLI) | `gh --version` | macOS: `brew install gh` · Windows: `winget install --id GitHub.cli` · Linux: paquete del repo · [cli.github.com](https://cli.github.com/) |
  | `git` con remoto | `git remote -v` | M03 Paso 0.3 — conectar repo a GitHub |
  | Cuenta de GitHub con permisos `write` | `gh repo view --json viewerPermission` | Tienes que ser **admin / maintainer** del repo para crear issues automáticos (reto) |
- **Por qué:** estas tres viven fuera de `package.json`. Si te falta el permiso `write`, el push y los secrets funcionan, pero el reto (crear issues automáticos) fallará con `403`.
- **Cómo verifico:** los tres comandos responden sin error; `gh repo view --json viewerPermission` devuelve `ADMIN` o `WRITE`.

---

### Paso 2 — Crear `.github/workflows/playwright.yml` (Git JIT — el robot)

Aquí entra la **carpeta `.github/workflows/`**, el último directorio del framework. Es una acción de **GitHub Actions tejida en el flujo**, no un bloque de Git aparte: el workflow es el archivo que convierte tu suite local en un pipeline.

**2.1 — Crear el archivo del workflow**
- **Qué hago:** creo la carpeta del workflow (un nivel por línea) y abro el archivo en VS Code — se crea al guardarlo.
  ```bash
  mkdir .github
  mkdir .github/workflows
  code .github/workflows/playwright.yml
  ```
- **Por qué:** GitHub busca workflows **únicamente** en `.github/workflows/*.yml`. La ruta es una convención dura: un archivo fuera de ahí no se ejecuta nunca. Este es el archivo que faltaba en el árbol de `🏗️ Arquitectura`.
- **Cómo verifico:** `ls .github/workflows/` muestra `playwright.yml`.

**2.2 — Escribir el pipeline matrix**
- **Qué hago:** pego el contenido del workflow en `.github/workflows/playwright.yml`.

```yaml
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

- **Por qué:** la `matrix` (`project × shard`) es lo que multiplica un solo job en **7 jobs paralelos**. El `exclude` saca `api` del shard 2 (la API no se reparte). Las claves `env:` mapean cada credencial a un `secrets.*` que configurarás en el Paso 5 — el workflow **referencia** los secrets, pero no los contiene.
- **Cómo verifico:** `gh workflow list` muestra `Playwright Tests` (puede tardar un minuto en indexar tras el primer push). En local, un linter de YAML no marca errores de indentación.

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
> 📚 Lo viste en [TS · M02 — types y template literals](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas para no confundir el `${...}` de TS con el `${{ ... }}` de Actions.

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
>       // sin cambios: ui-anon (M01-M03), setup, ui-chromium/firefox/webkit, api
>     ]
>   })
> ```
> **Se mantiene:** TODOS los projects (`ui-anon`, `setup`, los 3 browsers, `api`) — **M06 ya no añade projects**. **Entra:** flags de CI (`fullyParallel`, `forbidOnly`, `retries`, `workers`), reporters condicionales (`github` + `junit` sólo en CI) y `video: "retain-on-failure"`.

M06 añade los **flags de comportamiento en CI**: `fullyParallel`, `retries`, `workers`, reporters extra (`github`, `junit`), `forbidOnly` y `video` al fallar. Editas **un solo archivo** (`playwright.config.ts`) en dos micro-pasos. (El project anónimo `ui-anon` para flujos negativos **ya existe desde M01** — corre M01-M03 y cualquier `*.anon.spec.ts`.)

**3.1 — Añadir los flags de comportamiento en CI**
- **Qué hago:** agrego `fullyParallel`, `forbidOnly`, `retries` y `workers` al objeto que pasa `defineConfig({ ... })`.
  ```ts
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  ```
- **Por qué:** estos cuatro flags hacen que el **mismo** config se comporte distinto en local y en pipeline sin scripts duplicados ni flags manuales. `process.env.CI` no lo defines tú: GitHub Actions (y casi todos los CI) la inyecta automáticamente como `CI=true` en cada job — es la señal con la que el config decide en cuál de los dos mundos está corriendo.
- **Cómo verifico:** `pnpm exec tsc --noEmit` sigue verde; en local `pnpm m6` corre con 0 retries (no ves reintentos en la salida).

> 🔍 **Detalle que parece obvio — `process.env.CI`**
> **Qué pasa si lo cambias:** si la seteas a mano en local, tu máquina se comporta como CI (2 retries, `forbidOnly`, reporters extra) y pierdes justo las ventajas de correr en local. Para *simular* CI a propósito, sí la seteas temporalmente: `CI=true pnpm m6` (bash) / `$env:CI="true"; pnpm m6` (PowerShell).

> 🔍 **Detalle que parece obvio — `retries: process.env.CI ? 2 : 0`**
> **Qué es:** dos reintentos automáticos cuando un test falla en CI; **cero** reintentos cuando corres en local.
> **Por qué así (y no la alternativa obvia):** en CI los runners comparten CPU, la red es más lenta y Render hace cold start — un fallo aislado suele ser ruido, así que 2 reintentos evitan PRs rojos por flakes. En **local** lo quieres al revés: si un test falla, quieres **verlo fallar**, no que un reintento lo esconda y te haga creer que todo está verde.
> **Qué pasa si lo cambias:** si pones `retries > 0` en local, estás ocultando flakes en el peor momento — el desarrollo. Un test inestable pasará "por casualidad" en el segundo intento y nunca lo arreglarás hasta que reviente en CI o en producción.

> 🔍 **Detalle que parece obvio — `fullyParallel: true` (+ `workers`)**
> **Qué es:** paraleliza a nivel de **test individual**, no sólo a nivel de archivo; `workers` limita cuántos corren a la vez.
> **Por qué así (y no la alternativa obvia):** por defecto Playwright paraleliza entre archivos pero corre los tests *dentro* de un archivo en serie. Con `fullyParallel: true` cada test es candidato a su propio worker, exprimiendo los runners. `workers: process.env.CI ? 2 : undefined` topa el paralelismo a 2 en CI (los runners de GitHub tienen 2 CPUs) y deja que en local Playwright elija según tus cores.
> **Qué pasa si lo cambias:** sin `fullyParallel`, un archivo con 30 tests se vuelve un cuello de botella secuencial. Si subes `workers` por encima de los CPUs reales del runner, los tests pelean por recursos, se vuelven lentos y aparecen flakes por timeouts.

> 🔷 **TypeScript — operador ternario `cond ? a : b`**
> `process.env.CI ? 2 : 0` es una **expresión** que devuelve un valor (no un `if` que ejecuta sentencias): se usa donde la propiedad espera un número. El gotcha: `process.env.CI` es un `string | undefined`, así que el ternario lee su *truthiness* (la cadena vacía o `undefined` cuentan como falso). Por eso `forbidOnly` usa `!!process.env.CI` para forzarlo a un `boolean` real.
> 📚 Lo viste en [TS · M03 — funciones y lógica](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas para que `retries`, `workers` y los reporters cambien según el entorno.

> 🔍 **Detalle que parece obvio — `forbidOnly: !!process.env.CI`**
> **Qué es:** en CI, hace **fallar el build** si quedó un `test.only(...)` o `describe.only(...)` olvidado en el código (el `!!` es el del recuadro de arriba: fuerza la variable a un `boolean` real).
> **Por qué así (y no la alternativa obvia):** un `.only` olvidado es silencioso y catastrófico: hace que Playwright corra **sólo ese test** e ignore todos los demás. El suite sale verde con 1 test ejecutado y 200 saltados — y nadie lo nota. `forbidOnly` convierte ese descuido en un error ruidoso que bloquea el merge.
> **Qué pasa si lo cambias:** si lo pones en `false` (o no lo activas en CI), un `.only` puede pasar la revisión y dejar tu pipeline "verde" mientras en realidad no está testeando casi nada.

**3.2 — Añadir reporters condicionales y `video` al fallar**
- **Qué hago:** condiciono el `reporter` y agrego `video: "retain-on-failure"` dentro de `use`.
  ```ts
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }], ["junit", { outputFile: "results.xml" }]]
    : [["html", { open: "never" }], ["list"]],
  // ...dentro de use:
  video: "retain-on-failure",
  ```
- **Por qué:** en CI quieres `github` (anota el PR con los fallos) y `junit` (para integraciones externas); en local quieres `list` (salida legible en la terminal). El `video` sólo se graba cuando un test falla, igual que el `trace`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` verde; al simular CI (`CI=true pnpm m6` en bash · 🪟 `$env:CI="true"; pnpm m6` en PowerShell) ves anotaciones estilo GitHub en la salida.

> 🔍 **Detalle que parece obvio — `video: "retain-on-failure"` / `screenshot: "only-on-failure"`**
> **Qué es:** video y screenshot se guardan **únicamente cuando el test falla**, mismo principio que el `trace`. En M06 sólo el `video` es nuevo: el `screenshot: "only-on-failure"` ya lo traías de módulos anteriores.
> **Por qué así (y no la alternativa obvia):** capturar video y screenshots de cada test verde es desperdicio puro: nadie revisa el video de un test que pasó. Limitarlos al fallo te da el material de diagnóstico justo cuando lo necesitas, sin inflar los artefactos.
> **Qué pasa si lo cambias:** `video: "on"` multiplica el tamaño de `test-results/` y el tiempo de cada job; desactivarlo del todo te deja sin el clip que muchas veces explica el fallo más rápido que la propia traza.

> 💡 **Ya no se agrega un project aquí.** Los tests negativos (login fallido, signup) necesitan empezar **sin sesión** — para eso está el project **`ui-anon`**, que **ya existe desde M01** (corre M01-M03 y cualquier `*.anon.spec.ts`, sin `storageState`). M06 **no añade projects**: solo los flags de CI de 3.1-3.2. Si heredaran el `storageState` del `setup`, los flujos negativos llegarían ya logueados y no tendrían sentido — por eso viven en `ui-anon`, no en los `ui-*` autenticados.

> 🔷 **TypeScript — config tipado (`PlaywrightTestConfig` / `projects[]`)**
> `defineConfig(...)` no es decorativo: aplica el tipo `PlaywrightTestConfig`, así que el editor te autocompleta `retries`, `workers`, `projects[]` y te marca en rojo si escribes una clave inexistente o un valor del tipo equivocado (p.ej. `trace: "siempre"`). `projects` es un **array tipado** de objetos con forma fija: cada entrada debe tener `name`, y opcionalmente `use`, `dependencies`, `testMatch`/`testIgnore`. Esa forma fija es lo que una `interface` describe.
> 📚 Lo viste en [TS · M06 — interfaces y contratos de objetos](../../typescript-qa-course/modulo-06-interfaces/). Aquí lo aplicas: cada objeto de `projects[]` cumple el contrato que Playwright espera.

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
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/, /modulo-0[123]-.*/],
    },
    {
      name: "api",
      use: { baseURL: process.env.API_URL ?? "https://omnipizza-backend.onrender.com" },
      testMatch: [/tests\/api\/.*\.spec\.ts/, /modulo-05-api-layer\/.*\.spec\.ts/],
    },
    {
      // ui-anon: existe desde M01 (M01-M03 anónimos) + flujos negativos *.anon.spec.ts
      name: "ui-anon",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [/modulo-0[123]-.*\/.*\.spec\.ts/, /tests\/.*\.anon\.spec\.ts/],
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

**3.3 — Añadir los scripts de M06 al `package.json`**
- **Qué hago:** agrego tres scripts al bloque `"scripts"` de `package.json`.
  ```json
  "scripts": {
    "m6": "playwright test modulo-06-ci-debugging --project=ui-chromium",
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression"
  }
  ```
- **Por qué:** `pnpm m6` es el atajo del módulo; `test:smoke` / `test:regression` filtran por las etiquetas `@smoke` / `@regression` que `ejemplo.spec.ts` ya usa en sus `describe`. Las mismas etiquetas las consume el reto (canary diario con `--grep @smoke`).
- **Cómo verifico:** `pnpm test:smoke` corre **solo** el `describe("M06 — smoke canary @smoke")`; `pnpm m6` corre el módulo en `ui-chromium`.

> 💡 **Para el facilitador:** explica el patrón `process.env.CI ? X : Y` — GitHub Actions **siempre** expone `CI=true` como variable de entorno. Eso permite tener un solo config que se comporta distinto en local vs en pipeline, sin condicionales feas en cada script.

---

### Paso 4 — Lectura guiada de `.github/workflows/playwright.yml`

**4.1 — Recorrer las 5 piezas clave del workflow**
- **Qué hago:** abro `.github/workflows/playwright.yml` y localizo, en orden, las cinco anclas que hacen funcionar el pipeline.
  1. **`on:`** — qué dispara el job (`push`, `pull_request`, `workflow_dispatch` para correr a mano).
  2. **`strategy.matrix`** — la combinación `project × shard` que produce los N jobs paralelos.
  3. **`steps:`** — `checkout` → `setup-node` → `pnpm install` → `playwright install` → `playwright test --shard ...` → upload artifacts.
  4. **`env:`** + **`secrets.*`** — cómo viajan `BASE_URL`, `API_URL`, `TEST_USER_*` sin estar en plaintext.
  5. **`if: always()`** en el `upload-artifact` — sube reports incluso cuando el test falla (es cuando más los necesitas).
- **Por qué:** antes de pushear necesitas un modelo mental del archivo. Si no entiendes qué dispara los jobs ni de dónde salen las credenciales, un fallo de pipeline será un misterio en vez de un bug localizable.
- **Cómo verifico:** puedes señalar cada una de las 5 piezas en tu archivo y explicar en una frase qué hace. Pregunta de control: *"¿qué pasa si elimino la línea `if: always()`?"* → en jobs fallidos NO se suben los artefactos, así que no puedes investigar. Es el bug más típico de pipelines de testing.

---

### Paso 5 — Configurar los secrets (Git JIT — la caja fuerte)

El workflow **referencia** `secrets.*`, pero esos valores aún no existen en GitHub. Aquí los cargas con `gh secret set` — una acción de GitHub tejida en el flujo, justo antes del primer push.

**5.1 — Cargar los 4 secrets con `gh secret set`**
- **Qué hago:** desde la raíz del repo, registro las 4 credenciales en GitHub (una sola vez).
  ```bash
  gh secret set BASE_URL --body "https://omnipizza-frontend.onrender.com"
  gh secret set API_URL --body "https://omnipizza-backend.onrender.com"
  gh secret set TEST_USER_USERNAME --body "standard_user"
  gh secret set TEST_USER_PASSWORD --body "pizza123"
  ```
- **Por qué:** el `.env` local está en `.gitignore` y **nunca** se commitea, así que CI no tiene esas variables. Los secrets son la versión encriptada que GitHub inyecta como `env:` durante el job y borra al terminar. Sin ellos, el login del `setup` falla en CI y todos los `ui-*` se caen.
- **Cómo verifico:**
  ```bash
  gh secret list
  # Esperado: 4 secrets listados, SIN mostrar el valor.
  ```
  Alternativa por UI: Settings → Secrets and variables → Actions → New repository secret.

> ⚠️ **Para el facilitador:** repite tres veces: *"el `.env` local nunca se commitea; en CI los valores viven en `secrets`, que GitHub inyecta como variables de entorno durante la corrida y luego desaparecen"*. Este es el mensaje de seguridad más importante del módulo.

---

### Paso 6 — Forzar una traza local y leerla en Trace Viewer (protagonista)

Antes de confiar en CI, practica leer una traza en local. **Ningún concepto del módulo importa más que esto.**

**6.1 — Generar una traza con `--trace=on`**
- **Qué hago:** corro un módulo cualquiera forzando la grabación de la traza.
  ```bash
  pnpm exec playwright test modulo-01-smoke-feo --trace=on --project=ui-chromium
  ```
- **Por qué:** por defecto el config usa `trace: "retain-on-failure"` (sólo graba al fallar). `--trace=on` fuerza la grabación aunque el test pase, para que tengas material que abrir sin tener que romper nada primero.
- **Cómo verifico:**
  ```bash
  ls test-results/
  # Verás carpetas tipo `modulo-01-smoke-feo-...-chromium` con un trace.zip dentro.
  ```

> 🔍 **Detalle que parece obvio — `trace: "retain-on-failure"`**
> **Qué es:** graba la traza (la "caja negra") **sólo cuando un test falla**, no en cada corrida.
> **Por qué así (y no la alternativa obvia):** `trace: "on"` graba la traza de **todos** los tests, pasen o fallen. Eso es lento y genera artefactos pesados que casi nunca vas a abrir. `retain-on-failure` te da exactamente la traza que necesitas — la del test roto — sin cargar el pipeline con cientos de zips inútiles.
> **Qué pasa si lo cambias:** con `"on"` cada PR sube gigabytes de trazas y los jobs tardan más; con `"off"` te quedas ciego cuando algo falla en CI y no puedes reproducir el bug.

**6.2 — Abrir la traza en Trace Viewer**
- **Qué hago:** abro el `trace.zip` generado.
  ```bash
  pnpm exec playwright show-trace test-results/<carpeta>/trace.zip
  ```
- **Por qué:** Trace Viewer es la **caja negra del avión**: reconstruye el test paso a paso sin tener que reproducirlo a mano. Es la herramienta que convierte "el test falló en CI" en "veo exactamente qué pasó".
- **Cómo verifico:** se abre una ventana del navegador. Explora las 5 zonas:
  - **Timeline** (arriba): cada acción del test como una franja temporal.
  - **DOM snapshot:** estado del DOM en cada paso (click derecho → "Show element").
  - **Network:** cada request HTTP con headers + response.
  - **Console:** lo que la app imprimió en `console.log`.
  - **Source:** el código del test sincronizado con el paso.

> 💡 **Para el facilitador:** dedica 5 minutos aquí. **Ningún concepto del módulo importa más que ver una traza**. Si el grupo no asimila el Trace Viewer, todo lo demás suena a "más CI".

---

### Paso 7 — Forzar un fallo intencional y leer su traza

`ejemplo.spec.ts` tiene un test `@debug` que **falla a propósito** si activas la flag `DEMO_FAIL=1` (el `test.skip(!process.env.DEMO_FAIL, ...)` lo salta mientras la flag esté apagada).

**7.1 — Disparar el fallo controlado**
- **Qué hago:** corro el módulo con la flag de demo encendida.
  ```bash
  DEMO_FAIL=1 pnpm exec playwright test modulo-06-ci-debugging --project=ui-chromium
  ```
  (🪟 En PowerShell: `$env:DEMO_FAIL="1"; pnpm exec playwright test modulo-06-ci-debugging --project=ui-chromium`.)
- **Por qué:** quieres ver cómo se ve un fallo **antes** de que ocurra de verdad en un PR. El test busca `#this-does-not-exist`, un locator que nunca aparece, así que falla tras 2s y graba su traza.
- **Cómo verifico:** la corrida termina en rojo con 1 test fallido; en `test-results/` aparece una carpeta nueva con el `trace.zip` del fallo.

**7.2 — Leer la traza del fallo**
- **Qué hago:** abro la traza generada por el test roto.
  ```bash
  pnpm exec playwright show-trace test-results/<carpeta-debug>/trace.zip
  ```
- **Por qué:** **esto es exactamente lo que recibes en un PR fallido.** Practicarlo en local quita el pánico del primer fallo real en CI.
- **Cómo verifico:** en el último paso del Timeline ves el **screenshot final** + el **locator que nunca apareció** resaltado. Eso, y no el log de texto, es lo que te dice dónde se rompió.

---

### Paso 8 — Versionar, pushear y observar el pipeline (Git JIT)

Aquí se juntan las acciones de Git: aíslas el trabajo en una rama, lo commiteas, lo subes y abres el PR que **dispara el workflow** que escribiste.

**8.1 — Aislar el trabajo en una rama**
- **Qué hago:** creo una rama para el módulo (si no estás ya en una).
  ```bash
  git switch -c feature/m06-ci
  ```
- **Por qué:** el primer push de un workflow nuevo a veces falla por un secret olvidado o un typo en el YAML. Trabajar en una rama mantiene `main` verde mientras iteras el pipeline en el PR.
- **Cómo verifico:** `git branch --show-current` imprime `feature/m06-ci`.

**8.2 — Versionar tu trabajo (commit)**
- **Qué hago:** agrego los archivos del módulo y los de infraestructura, y commiteo.
  ```bash
  git add .github/workflows/playwright.yml playwright.config.ts package.json modulo-06-ci-debugging
  git commit -m "feat(m06): habilita CI workflow + flags de CI en config"
  ```
- **Por qué:** el workflow sólo corre si el archivo `.github/workflows/playwright.yml` está **commiteado y en GitHub**; un archivo sin trackear no dispara nada. Commitea también `playwright.config.ts` y `package.json` (los flags de CI y los scripts nuevos).
- **Cómo verifico:** `git log --oneline -1` muestra tu commit `feat(m06): ...`.

**8.3 — Pushear la rama**
- **Qué hago:** subo la rama a `origin`.
  ```bash
  git push -u origin feature/m06-ci
  ```
- **Por qué:** el push lleva el workflow a GitHub, donde el motor de Actions lo descubre. El `-u` deja la rama rastreando su remoto para futuros `git push` sin argumentos.
- **Cómo verifico:** `git status` dice *"Your branch is up to date with 'origin/feature/m06-ci'"*.

**8.4 — Abrir el PR y observar los 7 jobs**
- **Qué hago:** abro el PR contra `main` y sigo los checks en vivo.
  ```bash
  gh pr create --base main --head feature/m06-ci --title "feat(m06): habilita CI workflow" --body "Pipeline matrix sobre 3 browsers + API"

  gh pr checks --watch
  ```
- **Por qué:** el PR es el disparador `pull_request` del workflow. `gh pr checks --watch` te muestra el pipeline en tiempo real sin abrir el navegador.
- **Cómo verifico:** ves **7 jobs** corriendo en paralelo (3 browsers × 2 shards + 1 api). Cuando terminen, todos en verde.

---

### Paso 9 — Descargar artefactos de un job fallido (Git JIT)

**9.1 — Localizar la corrida y descargar sus artefactos**
- **Qué hago:** listo las corridas recientes del workflow y descargo los artefactos de la que me interesa.
  ```bash
  gh run list --workflow=playwright.yml --limit 5
  gh run download <run-id>
  ```
- **Por qué:** cuando un job falla en CI no tienes la traza en tu disco — vive como artefacto en GitHub. `gh run download` la trae a tu máquina, en carpetas nombradas por artefacto (`playwright-traces-ui-chromium-shard1/`, etc.). El `if: always()` del Paso 2 es lo que garantiza que esos artefactos existan aunque el job haya fallado.
- **Cómo verifico:** `ls` muestra las carpetas `playwright-report-...` y `playwright-traces-...` descargadas.

**9.2 — Abrir la traza del job fallido**
- **Qué hago:** abro el `trace.zip` descargado, igual que en local.
  ```bash
  pnpm exec playwright show-trace playwright-traces-ui-chromium-shard1/*/trace.zip
  ```
  (🪟 En PowerShell el `*` no se expande para ejecutables: usa la ruta explícita de la carpeta que descargó `gh run download` — `pnpm exec playwright show-trace playwright-traces-ui-chromium-shard1/<carpeta>/trace.zip`.)
- **Por qué:** cierra el ciclo *"PR rojo → descargo artefactos → leo la traza"*. La traza de CI se lee idéntica a la local (Paso 6) — el Trace Viewer no distingue de dónde viene.
- **Cómo verifico:** se abre Trace Viewer con el Timeline del fallo remoto; identificas el paso roto sin haber reproducido nada a mano.

> 💡 **Para el facilitador:** insiste en que el flujo *"PR rojo → descargo artefactos → leo la traza"* es el día a día de un automatizador. Practicarlo aquí evita pánico en el primer fallo real en su trabajo.

---

### Paso 10 — Resolver el reto (TODOs en `reto.md`)

El reto pide crear un **segundo workflow** que corra **diariamente** (cron) un subset de smoke contra el deploy live, y abra un **issue automático** si falla. Este es el patrón *canary in the coal mine*.

**10.1 — Seguir los TODOs de `reto.md`**
- **Qué hago:** abro `reto.md` y completo sus pasos en orden (el esqueleto del YAML viene como **pista**, no resuelto; tú lo terminas).
  1. `.github/workflows/smoke-daily.yml` con `schedule` (cron `'0 14 * * *'`) + `workflow_dispatch`.
  2. Un step `if: failure()` con `actions/github-script@v7` que abre un issue automático (necesita `permissions: issues: write`).
  3. El badge del workflow en el `README.md` principal.
- **Por qué:** el reto es práctica deliberada: el README **no** te entrega la solución completa para que sientas el flujo de programar un workflow y depurar permisos. El esqueleto de `reto.md` es punto de partida, no copia-pega final.
- **Cómo verifico (lo dice `reto.md`):**
  ```bash
  gh workflow run smoke-daily.yml     # dispararlo a mano
  gh run list --workflow=smoke-daily.yml --limit 1
  gh issue list --label canary        # tras forzar un fallo, debe haber 1 issue nuevo
  ```
  El badge debe renderizar su estado en el README abierto en GitHub.

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
