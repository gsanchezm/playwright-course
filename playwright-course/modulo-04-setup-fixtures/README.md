# Módulo 04 — Setup project + Fixtures + Data isolation + `page.route()`

**Duración estimada:** 85-110 min (incluye dos *Git breaks* — push/PR y deshacer cambios)
**Piezas que suma al framework:**
- `tests/setup/auth.setup.ts` — login vía API, persiste `storageState`.
- `fixtures/omnipizza.ts` — fixtures de Page Objects + market/user inyectado.
- `helpers/unique-data.ts` — identificadores únicos para paralelismo seguro.
- `playwright.config.ts` con `projects` que declaran `dependencies: ['setup']`.
- Demostración de `page.route()` para mocking de red.

---

## 🏗️ Arquitectura al terminar este módulo

El módulo más denso del curso: aparecen **4 carpetas nuevas** (`tests/setup/`, `fixtures/`, `helpers/`, `.auth/`) y `playwright.config.ts` se rediseña con projects que se depende uno de otro.

```
playwright-course/
├── .auth/                         ← 🆕 (gitignored) badge persistido
│   └── user.json                  ← 🆕 storageState generado por auth.setup.ts
├── data/                          ← (M02)
├── fixtures/                      ← 🆕 custom fixtures
│   └── omnipizza.ts               ← 🆕 test.extend → loginPage, catalogPage, defaultMarket
├── helpers/                       ← 🆕
│   └── unique-data.ts             ← 🆕 uniqueEmail, uniqueOrderId (data isolation)
├── pages/                         ← (M03)
├── tests/
│   └── setup/                     ← 🆕 setup project
│       └── auth.setup.ts          ← 🆕 login vía API → guarda .auth/user.json
├── types/                         ← (M02)
├── modulo-04-setup-fixtures/      ← 🆕 ESTE MÓDULO
│   ├── README.md
│   ├── ejemplo.spec.ts            ← 🆕 fixtures + page.route() (mocking)
│   └── reto.spec.ts               ← 🆕 admin.setup.ts + project paralelo
└── playwright.config.ts           ← ✏️ projects con dependencies: ['setup']
```

**Project graph** (cómo Playwright orquesta la ejecución):

```
┌─────────────┐
│   setup     │  ── ejecuta tests/setup/*.setup.ts
│ (project)   │     genera .auth/user.json
└──────┬──────┘
       │ dependencies: ["setup"]
       ▼
┌─────────────────────────────────────────────────────┐
│  ui-chromium │ ui-firefox │ ui-webkit (heredan      │
│              │            │   storageState)         │
└─────────────────────────────────────────────────────┘

┌─────────────┐         ┌────────────────┐
│   api       │         │  anonymous     │
│ (sin setup) │         │ (sin setup)    │
└─────────────┘         └────────────────┘
   ↑                       ↑
   ↑ NO heredan cookies de UI — flujos negativos y API limpios
```

**Flujo del dato dentro de un test** (cómo el fixture inyecta el POM):

```
fixtures/omnipizza.ts ──► test.extend<{loginPage, catalogPage, ...}>()
                                          │
                                          ▼
test("...", async ({ catalogPage }) => {  ◄── ya viene listo, sin "new"
  await catalogPage.expectLoaded()
})
```

**Qué NO existe todavía:**

| Carpeta | Llega en | Para qué |
|---|---|---|
| `services/`, `tests/api/` | M05 | Suite de API pura (BaseService abstracta) |
| `.github/workflows/` | M06 | CI/CD con matrix por browser |

> 💡 **Para el facilitador:** dibuja el diagrama de "project graph" en el pizarrón antes de abrir el código. Los alumnos suelen confundir **setup project** con **globalSetup** — el diagrama hace ver que setup es un test más, no un hook escondido.

---

## Analogía de apertura

El tester manual, antes de empezar una sesión, **se registra en recepción** (login vía API), recibe un **badge** (`storageState`) y con él entra a todos los módulos sin volver a autenticarse. Además, si varios testers trabajan en paralelo, **cada uno usa datos propios** (órdenes con su nombre, emails únicos) para que no se pisen.

---

## ¿Qué aprenderás?

1. **`auth.setup.ts` como project con `dependencies`** — el patrón 2026.
2. **Login vía API** (no UI) para sembrar sesión rápida y determinista.
3. **`storageState` por project**, NO global — flujos negativos y API no lo heredan.
4. **Custom fixtures** con `test.extend` para inyectar Page Objects.
5. **Worker vs test fixtures** — cuándo usar cada uno.
6. **Data isolation:** `uniqueEmail(workerInfo)` para `fullyParallel: true`.
7. **`page.route()`** — mocking de red para casos de error deterministas.

---

## Conceptos JIT

| Concepto | Analogía |
|---|---|
| `auth.setup.ts` project | Registro en recepción: se hace 1 vez, el badge vale todo el día |
| `storageState` por project | Badge compartido entre TCs del mismo project |
| `dependencies: ['setup']` | "No ejecutes hasta que setup haya terminado" — precondición declarativa |
| `test.extend` | Adaptador custom del test runner |
| Worker fixture | 1 instancia por worker (ej. `defaultMarket`) |
| Test fixture | 1 instancia por TC (ej. `loginPage`) |
| `workerInfo.workerIndex` | El número del tester paralelo (0, 1, 2…) |
| `uniqueEmail()` | Cada worker genera sus propios folios de orden |
| `page.route('**/api/pizzas', ...)` | Stub en Postman Mock Server: tú decides la respuesta |

---

## Por qué este patrón (y no `globalSetup`)

La v3 **no usa `globalSetup` con login por UI** porque:

| Aspecto | `globalSetup` + UI login | `auth.setup.ts` project + API login |
|---|---|---|
| Velocidad | Lento (navegación completa) | Rápido (1 POST) |
| Determinismo | Flaky (depende del DOM) | Determinista (contrato API) |
| Reutilización | Difícil para múltiples roles | Trivial (un `setup.ts` por rol) |
| Visibilidad en reportes | No aparece como test | Aparece como test en el report |
| Paralelismo | Punto único | Por project con `dependencies` |

---

## Paso a paso

### Paso 0 — Pre-requisitos

```bash
# Estando en playwright-course/
pnpm m3                    # los Page Objects ya funcionan
pnpm typecheck             # debe pasar
ls .auth 2>&1 || echo OK   # .auth/ debería estar vacío o no existir aún
```

> 💡 **Para el facilitador:** este módulo introduce 3 conceptos pesados (setup project + fixtures + mocking) en una sola sesión. **Da pausas cortas entre cada uno** y no avances al siguiente hasta que el actual esté corriendo verde.

---

### Paso 1 — Dependencias requeridas

**M04 no añade paquetes npm nuevos.** Los custom fixtures, `storageState` y `page.route()` viven dentro de `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
# Las 4 deben aparecer. Si no:
#   pnpm install
#   o pnpm add -D @playwright/test dotenv typescript @types/node
```

> ⚠️ **Asegúrate de que `.auth/` esté en `.gitignore`** — los storageStates contienen tokens válidos. Si tu `.gitignore` no lo tiene, añádelo ahora:
> ```bash
> grep -q "^\.auth/" .gitignore || echo ".auth/" >> .gitignore
> ```

---

### Paso 2 — Crear `tests/setup/`, `fixtures/`, `helpers/`

```bash
mkdir -p tests/setup fixtures helpers
touch tests/setup/auth.setup.ts fixtures/omnipizza.ts helpers/unique-data.ts
```

**Esqueletos mínimos:**

📄 `tests/setup/auth.setup.ts` — login vía API y persistir storageState:

```ts
import { test as setup, expect } from "@playwright/test";
import usersJson from "../../data/users.json";
import type { User } from "../../types";

const STORAGE = ".auth/user.json";
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";
const standard = (usersJson as User[]).find((u) => u.username === "standard_user")!;

setup("authenticate via API and persist storageState", async ({ page, request }) => {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { username: standard.username, password: standard.password },
  });
  expect(res.ok()).toBeTruthy();
  const { access_token } = await res.json();

  await page.goto("/");
  await page.evaluate((token) => localStorage.setItem("token", token), access_token);
  await page.context().storageState({ path: STORAGE });
});
```

📄 `fixtures/omnipizza.ts` — custom fixtures con `test.extend`:

```ts
import { test as base, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import marketsJson from "../data/markets.json";
import type { Market } from "../types";

type OmniFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
};
type OmniWorkerFixtures = { defaultMarket: Market };

export const test = base.extend<OmniFixtures, OmniWorkerFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  defaultMarket: [
    async ({}, use) => {
      const m = (marketsJson as Market[]).find((x) => x.code === "MX")!;
      await use(m);
    },
    { scope: "worker" },
  ],
});
export { expect };
```

📄 `helpers/unique-data.ts` — data isolation para paralelismo:

```ts
import type { TestInfo } from "@playwright/test";

export function uniqueEmail(info: TestInfo, prefix = "qa"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@example.test`;
}

export function uniqueOrderId(info: TestInfo): string {
  return `ORD-w${info.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
```

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M04 — **CAMBIA MUCHO**)

Este es el módulo donde `playwright.config.ts` **se transforma de verdad**. Reemplaza tu config con esta versión:

```ts
// playwright.config.ts — Estado en M04
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const STORAGE_STATE = ".auth/user.json";   // ← 🆕 ruta del badge

export default defineConfig({
  testDir: ".",
  // ✏️ ampliado: ahora también buscamos los .setup.ts dentro de tests/
  testMatch: [/tests\/.*\.(spec|setup)\.ts/, /modulo-.*\/.*\.spec\.ts/],

  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },

  // 🆕 projects: setup (corre primero) → ui-* (heredan storageState)
  projects: [
    {
      name: "setup",
      testMatch: /tests\/setup\/.*\.setup\.ts/,
    },
    {
      name: "ui-chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
    {
      name: "ui-firefox",
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
    {
      name: "ui-webkit",
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: [/tests\/setup\/.*/],
    },
  ],
});
```

**Diff conceptual vs M03:**

| Cambio | Por qué |
|---|---|
| `testMatch` añade `tests/.*\.setup\.ts` | Para que el runner detecte `auth.setup.ts` |
| Nueva constante `STORAGE_STATE` | Centraliza la ruta `.auth/user.json` |
| Project `setup` (sin storageState) | Genera el badge — corre antes que todos |
| Projects `ui-*` con `dependencies: ["setup"]` + `storageState` | Heredan el badge, arrancan autenticados |
| `testIgnore` en cada `ui-*` | Evita que el `auth.setup.ts` corra dos veces |

Añade los scripts nuevos al `package.json`:

```json
"scripts": {
  "m4": "playwright test modulo-04-setup-fixtures --project=ui-chromium",
  "test:setup": "playwright test --project=setup",
  "test:chromium": "playwright test --project=ui-chromium",
  "test:firefox": "playwright test --project=ui-firefox",
  "test:webkit": "playwright test --project=ui-webkit"
}
```

Y verifica que `tsconfig.json` incluya las carpetas nuevas:

```json
{
  "include": [
    "playwright.config.ts",
    "types/**/*.ts",
    "types/**/*.d.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "helpers/**/*.ts",
    "tests/**/*.ts",
    "modulo-*/**/*.ts"
  ]
}
```

> 💡 **Para el facilitador:** este es **el** punto del curso donde los alumnos suelen perderse. Pídeles que dibujen el flujo en su cuaderno: *"setup project corre 1 vez → escribe `.auth/user.json` → ui-chromium lo lee → todos mis tests arrancan autenticados"*. No avances hasta que cada alumno haya verbalizado el flujo.

---

### Paso 4 — Lectura guiada de `tests/setup/auth.setup.ts`

Abre el archivo con el grupo y señala:

1. **Es un `setup.ts`, no un `spec.ts`** — el `testMatch` de `playwright.config.ts` los distingue.
2. Hace **login por API** (un `POST /auth/login`), no por UI.
3. Persiste cookies/localStorage en `.auth/user.json` con `storageState`.
4. **NO aparece en `tests/` regulares** — vive en `tests/setup/` para que el project `api` y los flujos negativos (`anonymous`) **no lo hereden**.

> 💡 **Para el facilitador:** muestra `playwright.config.ts` donde se declara:
> ```ts
> { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ }
> { name: "ui-chromium", dependencies: ["setup"], use: { storageState: ".auth/user.json" } }
> ```
> Eso es lo que ata todo: `dependencies: ['setup']` significa **"Playwright corre setup ANTES de mí; si setup falla, yo ni siquiera arranco"**.

---

### Paso 5 — Correr SÓLO el setup project

```bash
pnpm test:setup
```

**Qué debería pasar:**

1. Verás un único test verde: `tests/setup/auth.setup.ts`.
2. Tras la corrida, el archivo `.auth/user.json` aparece en disco:
   ```bash
   ls -la .auth/
   cat .auth/user.json | head -5
   ```
3. Ese archivo contiene cookies + localStorage. **Está en `.gitignore`** — nunca lo commitees.

> 💡 **Si falla** con `ECONNREFUSED` o `404`: probablemente OmniPizza está dormido. Vuelve a correr una segunda vez (el cold start despierta el backend).

---

### Paso 6 — Lectura guiada de `fixtures/omnipizza.ts`

Cosas que señalar:

- `test.extend<{...}, {...}>()` — el primer genérico son **test fixtures** (1 por TC), el segundo son **worker fixtures** (1 por worker).
- `loginPage`, `catalogPage`, `checkoutPage` son **test fixtures**: Playwright los crea por TC y los inyecta al callback.
- `defaultMarket` es **worker fixture** (scope `"worker"`): se crea una vez por proceso paralelo.
- En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo.

---

### Paso 7 — Correr M04 completo

```bash
# El project ui-chromium declara `dependencies: ['setup']`,
# así que Playwright correrá setup automáticamente primero.
pnpm m4
```

**Qué debería pasar:**

1. Setup corre primero (genera/refresca `.auth/user.json`).
2. Los TCs del módulo arrancan **ya autenticados**: en el primer test verás `page.goto("/catalog")` SIN paso de login previo.
3. El test `uniqueEmail genera identificadores por worker` debe verificar que `email1 !== email2` y que ambos contengan `w<workerIndex>`.

---

### Paso 8 — Demostración de `page.route()` (mocking)

Abre la sección `page.route() — mocking de red` en `ejemplo.spec.ts` con el grupo. Pasos clave:

1. **El mock se registra ANTES de `page.goto()`** — si lo registras después, el primer request ya pasó.
2. `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body).
3. `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta).

**Pregunta al grupo:** *"¿qué pasa si registras 2 mocks distintos al mismo URL?"* — respuesta: gana el último registrado.

> 💡 **Para el facilitador:** los locators de error/empty en el ejemplo (`catalog-error`, `catalog-empty`) pueden no existir en OmniPizza tal cual. Es un PATRÓN a aprender, no un test que tenga que pasar perfectamente — está intencional como prototipo.

---

### Paso 9 — Cronometrar el ahorro

Ejercicio rápido:

```bash
# Sin setup project (M03)
time pnpm m3

# Con setup project (M04)
time pnpm m4
```

El delta principal está en que **no hay login por UI** en cada TC. Anota en el pizarrón el tiempo de cada uno — convénceles con datos.

---

### Paso 10 — Resolver el reto

El reto tiene **2 partes**, ambas con TODOs detallados:

1. **Crear `admin.setup.ts`** + un project `ui-admin-chromium` con un `storageState` distinto (`.auth/admin.json`). Esto demuestra que el patrón **escala a múltiples roles**.
2. **Mock con latencia simulada** usando `page.route()` + `setTimeout` + `route.continue()`, y validar que la UI muestra un skeleton mientras tanto.

Cada TODO sigue **Qué hacer / Pista / Cómo verificar**.

---

## Comandos útiles

```bash
pnpm test:setup                                  # sólo el setup project
pnpm m4                                          # el módulo (corre setup automáticamente)
pnpm exec playwright test --list                 # lista tests sin ejecutar
pnpm exec playwright test --workers=1 --debug    # 1 worker + inspector
ls .auth/                                        # verifica que el storageState existe
rm -rf .auth/ && pnpm test:setup                 # regenerar storageState desde cero
```

---

## Outcome esperado

- [ ] `.auth/user.json` se crea al correr setup.
- [ ] Los TCs del project `ui-chromium` arrancan **ya autenticados** (no hay login por UI en los specs).
- [ ] El project `api` **NO hereda** cookies de UI.
- [ ] Puedes explicar worker fixture vs test fixture con un ejemplo concreto.
- [ ] Sabes generar data única por worker con `uniqueEmail(info)`.
- [ ] Puedes mockear una respuesta con `page.route()` registrándolo **antes** del navigate.
- [ ] Completaste `admin.setup.ts` y un project paralelo `ui-admin-chromium`.

---

## ☁️ Git break — Sube tu trabajo a GitHub y abre un PR

Hasta ahora todos tus commits viven sólo en tu máquina. Para que un compañero los revise, los necesitas en **GitHub**.

### Por primera vez: conectar tu repo a GitHub

1. En github.com, click **New repository** → nombre (`qa-playwright-curso`), **Private** o **Public**, **sin** README inicial (ya tienes uno).
2. GitHub te muestra los comandos. Los importantes son:

```bash
$ git remote add origin git@github.com:tu-usuario/qa-playwright-curso.git
$ git remote -v                                  # verifica que quedó
origin  git@github.com:tu-usuario/qa-playwright-curso.git (fetch)
origin  git@github.com:tu-usuario/qa-playwright-curso.git (push)
$ git push -u origin main                        # primer push de main
```

El flag `-u` vincula tu rama local con la remota; las próximas veces basta con `git push`.

### El flujo diario: rama → push → PR → review → merge

Asumiendo que ya estás en la rama `feature/m04-fixtures`:

```bash
# 1. Sube tu rama por primera vez
$ git push -u origin feature/m04-fixtures

# 2. Abre el PR (vía web o con gh CLI)
$ gh pr create --base main --head feature/m04-fixtures \
    --title "feat(m04): setup project + fixtures" \
    --body "Agrega auth.setup.ts, fixtures de POM y data isolation"

# 3. Si te piden cambios en el review, los aplicas y vuelves a pushear
$ # (editas)
$ git add fixtures/omnipizza.ts
$ git commit -m "review: address comments on fixtures"
$ git push                                       # ya no necesita -u

# 4. Cuando tenga aprobaciones suficientes, mergeas desde la web (o con gh)
$ gh pr merge --squash --delete-branch
```

### Estrategias de merge en GitHub

| Opción | Qué hace | Cuándo usar |
|---|---|---|
| **Merge commit** | Preserva todos tus commits + uno extra de merge | Equipos que valoran el historial detallado |
| **Squash and merge** | Aplana toda la rama en **un solo commit** | Default seguro: historial limpio sin esfuerzo |
| **Rebase and merge** | Aplica tus commits sobre `main` sin merge commit | Equipos que rebasean estrictamente |

Para empezar, **squash and merge** es la opción más fácil. Tu PR queda como un único commit en `main`, con título y descripción del PR.

---

## 🔙 Git break — Cuando algo se rompe

Los fixtures con `.auth/`, `page.route()` y `storageState` son frágiles. Vas a romper cosas. Esta es la tabla decisión:

| Situación | Comando |
|---|---|
| Modifiqué un archivo y quiero descartar los cambios | `git restore <archivo>` |
| Agregué algo al staging y no quería | `git restore --staged <archivo>` |
| Olvidé un archivo en el último commit local | `git add <archivo>` + `git commit --amend --no-edit` |
| Quiero deshacer el último commit local conservando los cambios | `git reset --soft HEAD~1` |
| El commit ya está pusheado y quiero deshacerlo | `git revert <hash>` |
| Hice `reset --hard` y me arrepentí | `git reflog` + `git reset --hard <hash-original>` |

### Caso típico: el `auth.setup.ts` que rompió todo

```bash
$ git log --oneline
a1b2c3d (HEAD -> feature/m04-fixtures) test: try mock for failed login
7f8e9d0 feat(m04): add auth.setup.ts                ← este rompió todo
3e4f5a6 chore: initial m04
```

Si el commit `7f8e9d0` aún **no está pusheado**:

```bash
$ git reset --soft HEAD~2     # deshace los dos últimos, deja los cambios en staging
```

Si **ya está pusheado** (otros pueden haberlo descargado):

```bash
$ git revert 7f8e9d0          # crea un nuevo commit que deshace 7f8e9d0
$ git push
```

`revert` es **siempre seguro** en repos compartidos porque no reescribe el historial.

> ⚠️ **Regla de oro:** **nunca** uses `--amend`, `reset --hard` o `rebase` en commits que **ya pusheaste**. Reescribir historial publicado rompe el repo de tus compañeros.

---

> 📚 **Profundización opcional:** [Cuenta de GitHub + SSH](../../git-github-course/modulo-06-github/01-configuracion-cuenta.md) · [Crear y subir un repo](../../git-github-course/modulo-06-github/02-crear-subir-repo.md) · [PRs detallados (fork, plantilla, review)](../../git-github-course/modulo-06-github/03-pull-requests.md) · [Manual completo de undo](../../git-github-course/modulo-03-undo-remotos-tags/01-deshacer-cambios.md) · [Trabajar con remotos](../../git-github-course/modulo-03-undo-remotos-tags/02-remotos.md)
