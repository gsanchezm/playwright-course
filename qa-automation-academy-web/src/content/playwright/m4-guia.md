# M04 · Guía del módulo: Setup project + Fixtures

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
│   └── reto.spec.ts               ← 🆕 login negativo (locked_out_user) + mock con latencia
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
pnpm m3          # los Page Objects ya funcionan
pnpm typecheck   # debe pasar
ls .auth         # si da error, perfecto: aún no existe (se crea en este módulo)
```

---

### Paso 1 — Dependencias requeridas

**M04 no añade paquetes npm nuevos.** Los custom fixtures, `storageState` y `page.route()` viven dentro de `@playwright/test`.

```bash
pnpm list @playwright/test dotenv typescript @types/node
# Las 4 deben aparecer. Si no:
#   pnpm install
#   o pnpm add -D @playwright/test dotenv typescript @types/node
```

> ⚠️ **Asegúrate de que `.auth/` esté en `.gitignore`** — los storageStates contienen tokens válidos. Si tu `.gitignore` no lo tiene, ábrelo en VS Code (`code .gitignore`) y añade la línea `.auth/` al final. Verifica con `git check-ignore .auth/`: imprime `.auth/` si la ruta quedó cubierta.

---

### Paso 2 — Crear `tests/setup/`, `fixtures/`, `helpers/`

```bash
mkdir tests
mkdir tests/setup
mkdir fixtures
mkdir helpers
code tests/setup/auth.setup.ts
code fixtures/omnipizza.ts
code helpers/unique-data.ts
```

VS Code abre cada archivo nuevo: pega en cada uno el contenido que sigue y guárdalo.

**El contenido de los tres archivos** (es el mismo código que vive en el repo, con comentarios abreviados):

📄 `tests/setup/auth.setup.ts` — login vía API y persistir el `storageState`. Tiene **dos tests en modo serial**: un warmup que despierta el backend (Render free tier lo duerme tras 15 min) y el login real:

```ts
import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = ".auth";
const USER_FILE = path.join(AUTH_DIR, "user.json");

const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";
const BASE_URL = process.env.BASE_URL ?? "https://omnipizza-frontend.onrender.com";
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

setup.describe.configure({ mode: "serial" });

setup.beforeAll(() => {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
});

// 1) Despierta el backend (Render free tier duerme tras 15 min de inactividad).
setup("wake up backend (warmup cold start)", async ({ request }) => {
  setup.setTimeout(90_000);
  const res = await request.get(`${API_URL}/health`, { timeout: 80_000 });
  expect(res.ok(), "backend /health debe responder 200").toBeTruthy();
});

// 2) Login por API → siembra el token en localStorage → persiste el badge.
setup("authenticate as standard_user", async ({ browser, request }) => {
  const apiRes = await request.post(`${API_URL}/api/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(apiRes.ok(), `login API debe ser 200. Status: ${apiRes.status()}`).toBeTruthy();
  const { access_token } = (await apiRes.json()) as { access_token: string };
  expect(access_token, "debe venir access_token en la respuesta").toBeTruthy();

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.evaluate(([token, username]) => {
    window.localStorage.setItem("access_token", token);
    window.localStorage.setItem("username", username);
  }, [access_token, USERNAME]);

  await context.storageState({ path: USER_FILE });   // ← el "badge"
  await context.close();
});
```

> ⚠️ Fíjate en los detalles que el código exige y son fáciles de equivocar: el endpoint es `POST /api/auth/login` (con `/api`), se siembran **dos** claves de `localStorage` (`access_token` **y** `username`), y se usa `browser.newContext()` → `context.storageState({ path: USER_FILE })` → `context.close()`, **no** `page.context()` del test.

> 🔍 **Detalle que parece obvio — ``await request.post(`${API_URL}/api/auth/login`, { data: { username, password } })``**
> **Qué es:** el login se hace con un **POST a la API** usando el fixture `request` (`APIRequestContext`), no llenando el formulario en la UI.
> **Por qué así (y no la alternativa obvia):** es la tabla "Por qué este patrón (y no `globalSetup`)" en acción: llenar el formulario en UI suma navegación + render + clicks y depende del DOM, de animaciones y de selectores; un solo POST es **rápido y determinista** — prueba el contrato de la API y devuelve el `access_token` directo.
> **Qué pasa si lo cambias:** si haces login por UI en el setup, recuperas toda la fragilidad que querías evitar — y la pagas **una vez por corrida del setup**, multiplicado si tienes varios roles. El UI login se prueba aparte (en su propio spec), no como precondición de toda la suite.

📄 `fixtures/omnipizza.ts` — custom fixtures con `test.extend`: inyecta los Page Objects, el usuario estándar (`standardUser`) y el mercado por defecto (`defaultMarket`, worker-scoped):

```ts
import { test as base, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];

type PageFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  standardUser: User;
};
type WorkerFixtures = {
  defaultMarket: Market;   // worker-scoped: 1 vez por worker
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // --- Worker fixture ---
  // eslint-disable-next-line no-empty-pattern
  defaultMarket: [async ({}, use) => {
    const mx = markets.find((m) => m.code === "MX");
    if (!mx) throw new Error("Mercado MX no encontrado en data/markets.json");
    await use(mx);
  }, { scope: "worker" }],

  // --- Test fixtures ---
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  catalogPage: async ({ page }, use) => { await use(new CatalogPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const u = users.find((u) => u.username === "standard_user");
    if (!u) throw new Error("standard_user no encontrado en data/users.json");
    await use(u);
  },
});

export { expect };
export type { Market, User };
```

> 🔷 **TypeScript — inferencia de tipos en `test.extend<...>()`**
> Al pasar los genéricos `base.extend<PageFixtures, WorkerFixtures>(...)`, TS **infiere** el tipo de cada fixture y lo propaga al callback del test: dentro de `async ({ catalogPage }) => {...}`, `catalogPage` **ya es** `CatalogPage`, sin casts. El gotcha: si declaras un fixture en el objeto pero lo olvidas en el genérico (o al revés), TS marca el desajuste en vez de fallar en runtime.
> 📚 Lo viste en [TS · M05 — Clases](/docs/typescript/m5-base-page) y [TS · M06 — Interfaces](/docs/typescript/m6-api-response). Aquí los tipos `PageFixtures`/`WorkerFixtures` son el **contrato** que hace que `{ catalogPage }` venga tipado y autocompletado en cada TC.

📄 `helpers/unique-data.ts` — data isolation para paralelismo (email, folio de orden y prefijo únicos por worker):

```ts
import type { TestInfo } from "@playwright/test";

// Email único por worker + timestamp. Ej: customer+w0-1714000000000@omnipizza.test
export function uniqueEmail(info: TestInfo, prefix = "customer"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@omnipizza.test`;
}

// Identificador único de orden. Ej: ORD-w0-1714000000000-4821
export function uniqueOrderId(info: TestInfo): string {
  const random = Math.floor(Math.random() * 10_000);
  return `ORD-w${info.workerIndex}-${Date.now()}-${random}`;
}

// Prefijo determinista por worker (sin timestamp), útil para seeds reproducibles.
export function workerPrefix(info: TestInfo): string {
  return `w${info.workerIndex}`;
}
```

> 🔷 **TypeScript — función tipada + parámetro `TestInfo`**
> `uniqueEmail(info: TestInfo, ...): string` declara el **tipo de cada parámetro** y el **tipo de retorno**. `TestInfo` es el objeto que Playwright inyecta con metadata del test en curso (incluido `workerIndex`). El gotcha: si tipas el retorno como `string`, TS te avisa si por accidente devuelves `undefined` en algún branch.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-login). Aquí lo aplicas para que cada helper de data isolation reciba el `TestInfo` correcto y devuelva siempre un `string`.

> 🔷 **TypeScript — parámetro por defecto (`prefix = "customer"`)**
> `prefix = "customer"` hace el parámetro **opcional**: si no lo pasas, vale `"customer"`. No necesitas escribir `prefix?: string` ni chequear `if (!prefix)` — el default cubre el caso. El gotcha: un parámetro con default debe ir **después** de los obligatorios.
> 📚 Lo viste en [TS · M03 — Funciones](/docs/typescript/m3-navigate). Aquí lo aplicas para que `uniqueEmail(info)` use `"customer"` y `uniqueEmail(info, "locked")` use otro prefijo, sin sobrecargar la función.

> 🔷 **TypeScript — template literals (`` `${prefix}+w${info.workerIndex}-...` ``)**
> Las comillas invertidas (`` ` ``) permiten **interpolar** variables con `${...}` dentro del string, en vez de concatenar con `+`. El gotcha: dentro de `${}` puedes poner cualquier expresión (`info.workerIndex`, `Date.now()`), no solo variables sueltas.
> 📚 Lo viste en [TS · M02 — Tipos](/docs/typescript/m2-strings). Aquí lo aplicas para componer el email/folio único en una sola línea legible.

---

### Paso 3 — Ajustes a `playwright.config.ts` (estado al terminar M04 — **CAMBIA MUCHO**)

> **📐 Config — cambios vs M03 (aquí el config CAMBIA MUCHO)**
> ```diff
>   import { defineConfig, devices } from "@playwright/test";
>   import "dotenv/config";
> + const STORAGE_STATE = ".auth/user.json";
>
> - testMatch: [/modulo-.*\/.*\.spec\.ts/],
> + testMatch: [/tests\/.*\.(spec|setup)\.ts/, /modulo-.*\/.*\.spec\.ts/],
>
>   projects: [
> -   { name: "ui-chromium", use: { ...devices["Desktop Chrome"] } },
> +   { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ },
> +   { name: "ui-chromium", use: { ...devices["Desktop Chrome"],  storageState: STORAGE_STATE }, dependencies: ["setup"], testIgnore: [/tests\/setup\/.*/] },
> +   { name: "ui-firefox",  use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE }, dependencies: ["setup"], testIgnore: [/tests\/setup\/.*/] },
> +   { name: "ui-webkit",   use: { ...devices["Desktop Safari"],  storageState: STORAGE_STATE }, dependencies: ["setup"], testIgnore: [/tests\/setup\/.*/] },
>   ]
> ```
> **Se mantiene:** baseURL, timeouts, reporter, `trace`. **Entra:** const `STORAGE_STATE`; project `setup` (corre primero, hace login vía API); **firefox y webkit** (multi-browser nace aquí, no en M06); `storageState` + `dependencies: ["setup"]` + `testIgnore` por project; y `testMatch` ampliado para detectar los `*.setup.ts`.

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

> 🔍 **Detalle que parece obvio — `dependencies: ["setup"]`**
> **Qué es:** la **precondición declarativa** de la tabla de Conceptos JIT, a nivel de project: "este project no arranca hasta que el project `setup` termine **en verde**".
> **Por qué así (y no la alternativa obvia):** no es un `import`, ni un `globalSetup`, ni una llamada en un `beforeAll`. No ejecutas el login tú mismo — **declaras** el orden y Playwright construye el grafo de ejecución (por eso el setup aparece como un test en el reporte y se reutiliza por rol).
> **Qué pasa si lo cambias:** si borras `dependencies`, los projects `ui-*` ya **no esperan** al setup. Pueden arrancar antes de que `.auth/user.json` exista (o con uno viejo) → tests que fallan con "sesión no encontrada" de forma intermitente, según quién gane la carrera.

> 🔍 **Detalle que parece obvio — `storageState: STORAGE_STATE` (en cada project `ui-*`, NO en el `use:` raíz)**
> **Qué es:** la asignación del badge **por project** que acabas de escribir (`ui-chromium`, `ui-firefox`, `ui-webkit`) — no va en el bloque `use:` global de `defineConfig`.
> **Por qué así (y no la alternativa obvia):** la alternativa "obvia" es ponerlo una sola vez arriba en `use:` para no repetirlo. Pero eso autenticaría **TODO**: también los projects `api` y `anonymous` (llegan en M05/M06), que deben correr **sin** sesión.
> **Qué pasa si lo cambias:** si lo subes al `use:` raíz, los flujos negativos (login inválido, acceso anónimo) arrancan **ya logueados** y dejan de probar lo que dicen probar; y los tests de API heredan cookies de UI que no les corresponden. Los falsos verdes más peligrosos del módulo nacen aquí.

> 🔍 **Detalle que parece obvio — `testIgnore: [/tests\/setup\/.*/]`**
> **Qué es:** la ruta que cada project `ui-*` **ignora**. (En el repo final el array crece a tres patrones: `/tests\/api\/.*/` y `/modulo-05-api-layer\/.*/` se añaden en M05 para que la suite de API no se cuele en los projects de UI.)
> **Por qué así (y no la alternativa obvia):** sin ese ignore, el `testMatch` global (`/tests\/.*\.(spec|setup)\.ts/`) haría que `auth.setup.ts` también cayera dentro de los projects `ui-*`. Como esos projects dependen de `setup`, el login terminaría ejecutándose **dos veces**: una en el project `setup` y otra dentro de cada `ui-*`.
> **Qué pasa si lo cambias:** si quitas `/tests\/setup\/.*/`, verás `auth.setup.ts` duplicado en el reporte y un POST de login extra por browser; con multi-browser eso es login ×3 innecesario y más lento.

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

---

## ▶️ Cómo ejecutar este módulo

- **Correr SOLO el setup project (genera el badge):** `pnpm test:setup`
- **Comando del módulo (completo):** `pnpm m4`
- **UI mode:** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`--grep "@smoke"`) o por archivo
- **Ver el reporte:** `pnpm report`
- **🪟 Windows / PowerShell:** variables de entorno con `$env:VAR="x"; pnpm m4` (no `VAR=x pnpm m4`)

---

## Outcome esperado

- [ ] `.auth/user.json` se crea al correr setup.
- [ ] Los TCs del project `ui-chromium` arrancan **ya autenticados** (no hay login por UI en los specs).
- [ ] El project `api` **NO hereda** cookies de UI.
- [ ] Puedes explicar worker fixture vs test fixture con un ejemplo concreto.
- [ ] Sabes generar data única por worker con `uniqueEmail(info)`.
- [ ] Puedes mockear una respuesta con `page.route()` registrándolo **antes** del navigate.
- [ ] Resolviste el login negativo con `locked_out_user` (error exacto `Invalid credentials`) renunciando al badge heredado con `test.use({ storageState: undefined })`.

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
$ gh pr create --base main --head feature/m04-fixtures --title "feat(m04): setup project + fixtures" --body "Agrega auth.setup.ts, fixtures de POM y data isolation"

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
