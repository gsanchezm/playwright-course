# Módulo 04 — Setup project + Fixtures + Data isolation + `page.route()`

**Duración estimada:** 85-110 min (incluye Git JIT tejido en el flujo — commit, push/PR y deshacer cambios)
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

> **Cómo leer esta sección:** cada paso grande se parte en **micro-pasos `N.M`** con la tripleta **Qué hago / Por qué / Cómo verifico**. Cada micro-paso dice exactamente **qué archivo se crea o edita** y en qué orden. El orden de creación importa: primero los helpers (sin dependencias), luego el setup, luego los fixtures (dependen de `pages/`), luego el config que ata todo, y al final versionas y abres el PR.

### Paso 0 — Pre-requisitos

**0.1 — Verifica que M03 quede verde antes de empezar**
- **Qué hago:** desde `playwright-course/` corro los Page Objects de M03 y el typecheck.
  ```bash
  pnpm m3                    # los Page Objects ya funcionan
  pnpm typecheck             # debe pasar
  ls .auth 2>&1 || echo OK   # .auth/ debería estar vacío o no existir aún
  ```
- **Por qué:** M04 construye **encima** de `pages/` (los fixtures inyectan esos Page Objects). Si M03 está roto, los fixtures arrastran el error y no sabrás si el bug es de M03 o de M04.
- **Cómo verifico:** `pnpm m3` termina en verde y `pnpm typecheck` no imprime errores.

> 💡 **Para el facilitador:** este módulo introduce 3 conceptos pesados (setup project + fixtures + mocking) en una sola sesión. **Da pausas cortas entre cada uno** y no avances al siguiente hasta que el actual esté corriendo verde.

---

### Paso 1 — Dependencias y `.gitignore`

**1.1 — Confirma que no falta ningún paquete**
- **Qué hago:** **M04 no añade paquetes npm nuevos.** Los custom fixtures, `storageState` y `page.route()` viven dentro de `@playwright/test`. Solo confirmo que las 4 dependencias base están instaladas.
  ```bash
  pnpm list @playwright/test dotenv typescript @types/node 2>/dev/null
  # Las 4 deben aparecer. Si no:
  #   pnpm install
  #   o pnpm add -D @playwright/test dotenv typescript @types/node
  ```
- **Por qué:** todo lo nuevo de M04 (`test.extend`, `storageState`, `page.route()`) es API del propio runner. Reinstalar paquetes aquí sería ruido.
- **Cómo verifico:** las 4 dependencias aparecen listadas con su versión.

**1.2 — Asegura que `.auth/` esté en `.gitignore` (edita `.gitignore`)**
- **Qué hago:** añado `.auth/` al `.gitignore` si no está.
  ```bash
  grep -q "^\.auth/" .gitignore || echo ".auth/" >> .gitignore
  ```
- **Por qué:** los `storageState` que vas a generar contienen **tokens válidos** (`access_token` en `localStorage`). Commitearlos es filtrar credenciales en el historial de Git.
- **Cómo verifico:** `git status` **no** muestra `.auth/` como archivo nuevo ni siquiera después de correr el setup.

> ⚠️ Haz esto **antes** del primer `pnpm test:setup`. Una vez que `.auth/user.json` entra al historial, sacarlo requiere reescribir commits.

---

### Paso 2 — Crear los archivos nuevos (helpers → setup → fixtures)

**2.1 — Crea las carpetas y los archivos vacíos**
- **Qué hago:** creo las 3 carpetas nuevas y sus archivos.
  ```bash
  mkdir -p tests/setup fixtures helpers
  touch tests/setup/auth.setup.ts fixtures/omnipizza.ts helpers/unique-data.ts
  ```
- **Por qué:** dejar los archivos vacíos primero me deja anclar las rutas del `tsconfig` y del `playwright.config.ts` sin pelear con errores de "módulo no encontrado" mientras escribo cada uno.
- **Cómo verifico:** `ls tests/setup fixtures helpers` muestra los 3 archivos.

**2.2 — Escribe `helpers/unique-data.ts` (data isolation)**
- **Qué hago:** creo las funciones de datos únicos por worker. Es el archivo **sin dependencias**, por eso va primero.
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
- **Por qué:** con `fullyParallel: true` varios workers corren a la vez. Si todos siembran el mismo email/orden, colisionan. `workerIndex` (0, 1, 2…) garantiza que el dato de cada worker sea **propio**, y `Date.now()` lo hace único entre corridas.
- **Cómo verifico:** `pnpm exec tsc --noEmit` no marca `helpers/unique-data.ts`; el editor autocompleta `info.workerIndex`.

> 🔷 **TypeScript — función tipada + parámetro `TestInfo`**
> `uniqueEmail(info: TestInfo, ...): string` declara el **tipo de cada parámetro** y el **tipo de retorno**. `TestInfo` es el objeto que Playwright inyecta con metadata del test en curso (incluido `workerIndex`). El gotcha: si tipas el retorno como `string`, TS te avisa si por accidente devuelves `undefined` en algún branch.
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas para que cada helper de data isolation reciba el `TestInfo` correcto y devuelva siempre un `string`.

> 🔷 **TypeScript — parámetro por defecto (`prefix = "customer"`)**
> `prefix = "customer"` hace el parámetro **opcional**: si no lo pasas, vale `"customer"`. No necesitas escribir `prefix?: string` ni chequear `if (!prefix)` — el default cubre el caso. El gotcha: un parámetro con default debe ir **después** de los obligatorios.
> 📚 Lo viste en [TS · M03 — Funciones](../../typescript-qa-course/modulo-03-functions/). Aquí lo aplicas para que `uniqueEmail(info)` use `"customer"` y `uniqueEmail(info, "locked")` use otro prefijo, sin sobrecargar la función.

> 🔷 **TypeScript — template literals (`` `${prefix}+w${info.workerIndex}-...` ``)**
> Las comillas invertidas (`` ` ``) permiten **interpolar** variables con `${...}` dentro del string, en vez de concatenar con `+`. El gotcha: dentro de `${}` puedes poner cualquier expresión (`info.workerIndex`, `Date.now()`), no solo variables sueltas.
> 📚 Lo viste en [TS · M02 — Tipos](../../typescript-qa-course/modulo-02-types/). Aquí lo aplicas para componer el email/folio único en una sola línea legible.

**2.3 — Escribe `tests/setup/auth.setup.ts` (login vía API + persistir badge)**
- **Qué hago:** creo el setup que hace login por API y guarda el `storageState`. Tiene **dos tests en modo serial**: un warmup del backend y el login real.
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
- **Por qué:** el login por **API** (`POST /api/auth/login`) es rápido y determinista; el warmup separado evita que el primer test del día falle por el cold start de Render. OmniPizza guarda la sesión en `localStorage` (`access_token` + `username`), por eso sembramos ahí y luego `storageState` lo serializa a `.auth/user.json`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` pasa; el archivo abre un **contexto nuevo** del `browser` (no reusa `page` del test) y lo cierra al final.

> ⚠️ Fíjate en los detalles que el código real exige y son fáciles de equivocar: el endpoint es `POST /api/auth/login` (con `/api`), se siembran **dos** claves (`access_token` **y** `username`), y se usa `browser.newContext()` → `context.storageState(...)` → `context.close()`, **no** `page.context()` del test.

**2.4 — Escribe `fixtures/omnipizza.ts` (inyecta Page Objects con `test.extend`)**
- **Qué hago:** extiendo el `test` base para que inyecte Page Objects, el usuario estándar y el mercado por defecto.
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
- **Por qué:** con `test.extend` el TC **ya no escribe `new LoginPage(page)`** — el fixture se lo entrega listo y ligado a su pestaña. El primer genérico (`PageFixtures`) son fixtures **por test**; el segundo (`WorkerFixtures`) son **por worker** (`defaultMarket` se crea 1 vez por proceso).
- **Cómo verifico:** en un spec, `import { test } from "../fixtures/omnipizza"` y el editor autocompleta `catalogPage`, `standardUser` y `defaultMarket` dentro del callback del test.

> 🔷 **TypeScript — inferencia de tipos en `test.extend<...>()`**
> Al pasar los genéricos `base.extend<PageFixtures, WorkerFixtures>(...)`, TS **infiere** el tipo de cada fixture y lo propaga al callback del test: dentro de `async ({ catalogPage }) => {...}`, `catalogPage` **ya es** `CatalogPage`, sin casts. El gotcha: si declaras un fixture en el objeto pero lo olvidas en el genérico (o al revés), TS marca el desajuste en vez de fallar en runtime.
> 📚 Lo viste en [TS · M05 — Clases](../../typescript-qa-course/modulo-05-classes/) y [TS · M06 — Interfaces](../../typescript-qa-course/modulo-06-interfaces/). Aquí los tipos `PageFixtures`/`WorkerFixtures` son el **contrato** que hace que `{ catalogPage }` venga tipado y autocompletado en cada TC.

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

Este es el módulo donde `playwright.config.ts` **se transforma de verdad**. Hazlo en micro-pasos para no perderte.

**3.1 — Reemplaza `playwright.config.ts` con la versión M04 (edita `playwright.config.ts`)**
- **Qué hago:** sustituyo el config por esta versión, que añade la const `STORAGE_STATE`, amplía `testMatch` y rediseña `projects`.

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

- **Por qué:** el project `setup` corre **primero** y genera el badge; los `ui-*` lo heredan vía `storageState` + `dependencies`. El `storageState` va **por project** (no en el `use:` raíz) para que los flujos negativos/API no lo hereden; el `testIgnore` evita que el setup corra dos veces.
- **Cómo verifico:** `pnpm exec playwright test --list` corre sin error de parseo y **incluye** los projects `setup` + los tres `ui-*` (en el repo completo verás además `api` y `anonymous`, que no heredan `storageState`).

**3.2 — Añade los scripts al `package.json` (edita `package.json`)**
- **Qué hago:** agrego los scripts del módulo y por project.
  ```json
  "scripts": {
    "m4": "playwright test modulo-04-setup-fixtures --project=ui-chromium",
    "test:setup": "playwright test --project=setup",
    "test:chromium": "playwright test --project=ui-chromium",
    "test:firefox": "playwright test --project=ui-firefox",
    "test:webkit": "playwright test --project=ui-webkit"
  }
  ```
- **Por qué:** `test:setup` te deja correr **solo** el setup (para inspeccionar el badge), y los `test:<browser>` aíslan cada navegador ahora que multi-browser nace en este módulo.
- **Cómo verifico:** `pnpm test:setup --list` no falla con "script not found".

**3.3 — Verifica el `include` del `tsconfig.json` (edita `tsconfig.json` si falta algo)**
- **Qué hago:** confirmo que `fixtures/`, `helpers/` y `tests/` estén en el `include`.
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
- **Por qué:** si una carpeta nueva no está en `include`, TS no la typechequea: `pnpm typecheck` quedaría verde por **omisión**, ocultando errores reales en `fixtures/` o `tests/setup/`.
- **Cómo verifico:** `pnpm exec tsc --noEmit` recorre los 3 archivos nuevos (puedes probar metiendo un error a propósito en `helpers/unique-data.ts` y ver que TS lo reporta).

> 💡 **Para el facilitador:** este es **el** punto del curso donde los alumnos suelen perderse. Pídeles que dibujen el flujo en su cuaderno: *"setup project corre 1 vez → escribe `.auth/user.json` → ui-chromium lo lee → todos mis tests arrancan autenticados"*. No avances hasta que cada alumno haya verbalizado el flujo.

---

### Paso 4 — Lectura guiada de `tests/setup/auth.setup.ts`

**4.1 — Lee el setup con el grupo y señala las 4 claves**
- **Qué hago:** abro `tests/setup/auth.setup.ts` y reviso:
  1. **Es un `setup.ts`, no un `spec.ts`** — el `testMatch` de `playwright.config.ts` los distingue.
  2. Hace **login por API** (un `POST /api/auth/login`), no por UI.
  3. Persiste cookies/localStorage en `.auth/user.json` con `context.storageState({ path })`.
  4. **NO aparece en `tests/` regulares** — vive en `tests/setup/` para que el project `api` y los flujos negativos (`anonymous`) **no lo hereden**.
- **Por qué:** entender que el setup es **un test más** (visible en el reporte) y no un hook escondido es lo que hace clic con `dependencies`.
- **Cómo verifico:** localizas en el archivo el endpoint `POST /api/auth/login` y las dos claves de `localStorage` (`access_token`, `username`).

> 💡 **Para el facilitador:** muestra `playwright.config.ts` donde se declara:
> ```ts
> { name: "setup", testMatch: /tests\/setup\/.*\.setup\.ts/ }
> { name: "ui-chromium", dependencies: ["setup"], use: { storageState: ".auth/user.json" } }
> ```
> Eso es lo que ata todo: `dependencies: ['setup']` significa **"Playwright corre setup ANTES de mí; si setup falla, yo ni siquiera arranco"**.

**4.2 — Si `auth.setup.ts` rompió todo: deshacer cambios (Git JIT)**
- **Qué hago:** este archivo es el más frágil del módulo (toca red, `localStorage`, rutas). Si una edición lo deja en un estado peor que antes, **descarto** mis cambios en vez de seguir parchando a ciegas. Según el caso:
  ```bash
  # a) Edité el archivo y quiero volver a la última versión guardada:
  git restore tests/setup/auth.setup.ts

  # b) Ya lo había hecho git add y no quería:
  git restore --staged tests/setup/auth.setup.ts

  # c) El commit que lo rompió YA está pusheado (otros pueden tenerlo):
  git log --oneline           # localiza el hash del commit que rompió
  git revert <hash>           # crea un commit nuevo que lo deshace
  git push
  ```
- **Por qué:** `git restore` te regresa a un estado verde conocido sin perder el resto del trabajo. En commits **ya pusheados** usa `git revert` (crea un commit inverso, no reescribe historial), **nunca** `reset --hard`/`--amend`/`rebase` sobre lo publicado: eso rompe el repo de tus compañeros.
- **Cómo verifico:** `git status` queda limpio (caso a/b) o `git log --oneline -1` muestra el commit `Revert "..."` (caso c), y `pnpm test:setup` vuelve a pasar.

> ⚠️ **Regla de oro:** `git revert` es **siempre seguro** en repos compartidos porque no reescribe el historial. Reserva `reset --soft HEAD~1` (deshacer último commit conservando cambios) y `git reflog` (rescatar un `reset --hard` del que te arrepentiste) para commits **locales** que aún no subiste.

---

### Paso 5 — Correr SÓLO el setup project

```bash
pnpm test:setup
```

**Qué debería pasar:**

1. Verás **dos** tests verdes en el project `setup` (corren en modo serial): `wake up backend (warmup cold start)` y `authenticate as standard_user`.
2. Tras la corrida, el archivo `.auth/user.json` aparece en disco:
   ```bash
   ls -la .auth/
   cat .auth/user.json | head -5
   ```
3. Ese archivo contiene cookies + localStorage. **Está en `.gitignore`** — nunca lo commitees.

> 💡 **Si falla** con `ECONNREFUSED` o `404`: probablemente OmniPizza está dormido. Vuelve a correr una segunda vez (el cold start despierta el backend).

---

### Paso 6 — Lectura guiada de `fixtures/omnipizza.ts`

**6.1 — Distingue test fixture de worker fixture**
- **Qué hago:** abro `fixtures/omnipizza.ts` y señalo:
  - `base.extend<PageFixtures, WorkerFixtures>()` — el **primer** genérico son **test fixtures** (1 por TC), el **segundo** son **worker fixtures** (1 por worker).
  - `loginPage`, `catalogPage`, `checkoutPage`, `standardUser` son **test fixtures**: Playwright los crea por TC y los inyecta al callback.
  - `defaultMarket` es **worker fixture** (`scope: "worker"`): se crea una vez por proceso paralelo.
  - En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo.
- **Por qué:** elegir mal el scope cuesta caro: un worker fixture que muta estado se comparte entre TCs del mismo worker (riesgo de contaminación); un test fixture caro recreado por TC es lento. La regla: **datos inmutables/caros → worker; objetos ligados al `page` → test**.
- **Cómo verifico:** en un spec, al teclear `async ({ ` el editor sugiere `loginPage`, `catalogPage`, `standardUser` (test) y `defaultMarket` (worker), todos ya tipados.

---

### Paso 7 — Correr M04 completo

**7.1 — Corre el módulo (el setup arranca solo por `dependencies`)**
- **Qué hago:**
  ```bash
  # El project ui-chromium declara `dependencies: ['setup']`,
  # así que Playwright correrá setup automáticamente primero.
  pnpm m4
  ```
- **Por qué:** demuestra el grafo en acción — no invocas el setup tú: lo **declaras** y Playwright lo orquesta.
- **Cómo verifico:**
  1. Setup corre primero (genera/refresca `.auth/user.json`).
  2. Los TCs del módulo arrancan **ya autenticados**: en el primer test verás `page.goto("/catalog")` SIN paso de login previo.
  3. El test `uniqueEmail genera identificadores por worker` verifica que `email1 !== email2` y que `email1` contenga `w<workerIndex>`; `email2` usa el prefijo `locked+`.

**7.2 — Versiona tu trabajo (Git JIT — commit)**
- **Qué hago:** ahora que la suite corre verde, aíslo M04 en su rama (si no lo hice ya) y hago commit de todo lo nuevo.
  ```bash
  git switch -c feature/m04-fixtures          # si aún no estás en la rama
  git add tests/setup fixtures helpers playwright.config.ts \
          package.json tsconfig.json modulo-04-setup-fixtures
  git commit -m "feat(m04): setup project + fixtures + data isolation"
  ```
- **Por qué:** M04 toca muchos archivos de infraestructura; un commit atómico con mensaje claro deja un punto de retorno limpio si el PR pide cambios. **`.auth/` NO se incluye** (está en `.gitignore`).
- **Cómo verifico:** `git log --oneline -1` muestra el commit `feat(m04): ...` y `git status` confirma que `.auth/` sigue **sin** trackear.

---

### Paso 8 — Demostración de `page.route()` (mocking)

**8.1 — Lee la sección `page.route()` de `ejemplo.spec.ts`**
- **Qué hago:** abro `page.route() — mocking de red` en `ejemplo.spec.ts` y reviso:
  1. **El mock se registra ANTES de `page.goto()`** — si lo registras después, el primer request ya pasó.
  2. `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body).
  3. `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta).
- **Por qué:** mockear la red da **determinismo absoluto** para casos de error (5xx, 404) o estado vacío, sin depender de qué responda hoy el backend real.
- **Cómo verifico:** el patrón del ejemplo usa `**/api/pizzas*` como URL del route; el `route.fulfill` con `status: 500` produce el caso de error sin tocar OmniPizza.

**Pregunta al grupo:** *"¿qué pasa si registras 2 mocks distintos al mismo URL?"* — respuesta: gana el último registrado.

> 💡 **Para el facilitador:** los locators de error/empty en el ejemplo (`catalog-error`, `catalog-empty`) pueden no existir en OmniPizza tal cual. Es un PATRÓN a aprender, no un test que tenga que pasar perfectamente — está intencional como prototipo.

---

### Paso 9 — Cronometrar el ahorro y abrir el PR

**9.1 — Compara los tiempos M03 vs M04**
- **Qué hago:**
  ```bash
  time pnpm m3   # sin setup project
  time pnpm m4   # con setup project
  ```
- **Por qué:** el delta principal es que **no hay login por UI** en cada TC — un solo POST en el setup reemplaza N navegaciones completas. Es el argumento de venta del patrón.
- **Cómo verifico:** anotas ambos tiempos; `pnpm m4` debería amortizar el login en una sola corrida del setup.

**9.2 — Sube la rama y abre el PR (Git JIT — push + PR)**
- **Qué hago:** comparto el trabajo en GitHub para code review.
  ```bash
  # 1. Primer push de la rama (el -u vincula local↔remota; luego basta `git push`)
  git push -u origin feature/m04-fixtures

  # 2. Abre el PR con la CLI de GitHub
  gh pr create --base main --head feature/m04-fixtures \
      --title "feat(m04): setup project + fixtures" \
      --body "Agrega auth.setup.ts, fixtures de POM y data isolation"

  # 3. Si el review pide cambios: editas, commiteas y vuelves a pushear (ya sin -u)
  git add fixtures/omnipizza.ts
  git commit -m "review: address comments on fixtures"
  git push
  ```
- **Por qué:** hasta ahora los commits viven solo en tu máquina; el PR los hace revisables. **`squash and merge`** es el default seguro: aplana la rama en un commit limpio en `main`.

  | Estrategia de merge | Qué hace | Cuándo usar |
  |---|---|---|
  | **Merge commit** | Preserva todos tus commits + uno de merge | Historial detallado |
  | **Squash and merge** | Aplana la rama en **un** commit | Default seguro |
  | **Rebase and merge** | Aplica tus commits sobre `main` sin merge commit | Equipos que rebasean |
- **Cómo verifico:** `gh pr view --web` abre el PR en el navegador; `git push` posteriores ya no piden `-u`.

> 📌 La **primera vez** que conectas el repo a GitHub: en github.com crea **New repository** (`qa-playwright-curso`, sin README inicial), luego `git remote add origin git@github.com:tu-usuario/qa-playwright-curso.git` y `git push -u origin main`. `git remote -v` confirma que quedó.

---

### Paso 10 — Resolver el reto

**10.1 — Lee `reto.spec.ts` y ataca sus 2 partes**
- **Qué hago:** abro `reto.spec.ts`; tiene **2 partes**, ambas con TODOs detallados (formato **Qué hacer / Pista / Cómo verificar**):
  1. **PARTE A — Login negativo con `locked_out_user`.** OmniPizza **no tiene admin**: todas sus personas son `customer` y se distinguen por *comportamiento de login*, no por privilegios. `locked_out_user` está bloqueado — el login se **rechaza** con el texto exacto `Invalid credentials`. Llenas el formulario con `getByTestId("username-desktop")`/`password-desktop`, haces clic en **Sign In** y asertas el error con `page.getByText("Invalid credentials")`.
  2. **PARTE B — Mock con latencia simulada** usando `page.route()` + `setTimeout` + `route.continue()`, y validar que la UI muestra un skeleton mientras tanto.
- **Por qué:** la PARTE A te enseña dos cosas honestas a la vez. **(a)** Un usuario bloqueado **no autentica**, así que **no** es un setup project con `storageState` (no hay badge que guardar): es un **test de UI de auth fallida**. **(b)** Este spec corre bajo `ui-chromium`, que ya hereda el badge de `standard_user`; para ver el formulario de login tienes que **renunciar** a esa sesión con `test.use({ storageState: undefined })` — exactamente el mecanismo inverso al que aprendiste en `🔍 storageState por project`. La PARTE B te hace sentir la diferencia entre latencia real (no determinista) y latencia mockeada (determinista).
- **Cómo verifico:** sigues los TODOs del archivo — **no** están resueltos aquí a propósito. Para PARTE A: el test pasa con `Invalid credentials` visible y la URL **sigue** en `/login` (no entró a `/catalog`); para PARTE B: el test pasa y su duración total es ≥ 3s.

> 📌 **El patrón de setup project SÍ escala a un 2º rol — pero solo a personas que autentican.** La PARTE A original (eliminada) montaba un `admin.setup.ts` sobre un rol inexistente. Si algún día necesitas un **segundo storageState autenticado**, copia `auth.setup.ts` apuntando a una persona que **sí** entra (`problem_user` o `performance_glitch_user`), guarda en `.auth/<persona>.json` y declara su project con `dependencies: ["setup"]`. `locked_out_user` no sirve para eso justamente porque nunca llega a generar un badge — por eso aquí es un caso de **aserción de error**, no de setup.

---

## 🔍 Detalles que parecen obvios pero no lo son

### `dependencies: ["setup"]`
- **Qué es:** una **precondición declarativa** a nivel de project. Le dices a Playwright "este project no arranca hasta que el project `setup` termine en verde".
- **Por qué así (y no la alternativa obvia):** no es un `import`, ni un `globalSetup`, ni una llamada en un `beforeAll`. No ejecutas el login tú mismo — **declaras** el orden y Playwright construye el grafo de ejecución. Esto lo hace visible en el reporte (setup aparece como un test) y reutilizable por rol.
- **Qué pasa si lo cambias:** si borras `dependencies`, los projects `ui-*` ya **no esperan** al setup. Pueden arrancar antes de que `.auth/user.json` exista (o con uno viejo) → tests que fallan con "sesión no encontrada" de forma intermitente, según quién gane la carrera.

### `storageState: STORAGE_STATE` (en cada project `ui-*`, NO en el `use:` raíz)
- **Qué es:** el `storageState` se asigna **por project** (`ui-chromium`, `ui-firefox`, `ui-webkit`), no en el bloque `use:` global de `defineConfig`.
- **Por qué así (y no la alternativa obvia):** la alternativa "obvia" es ponerlo una sola vez arriba en `use:` para no repetirlo. Pero eso autenticaría **TODO**: también los projects `api` y `anonymous`, que deben correr **sin** sesión.
- **Qué pasa si lo cambias:** si lo subes al `use:` raíz, los flujos negativos (login inválido, acceso anónimo) arrancan **ya logueados** y dejan de probar lo que dicen probar; y los tests de API heredan cookies de UI que no les corresponden. Los falsos verdes más peligrosos del módulo nacen aquí.

### `testIgnore: [/tests\/setup\/.*/, /tests\/api\/.*/, /modulo-05-api-layer\/.*/]`
- **Qué es:** lista de rutas que cada project `ui-*` **ignora**. La pieza clave para este punto es `/tests\/setup\/.*/`.
- **Por qué así (y no la alternativa obvia):** sin ese ignore, el `testMatch` global (`/tests\/.*\.(spec|setup)\.ts/`) haría que `auth.setup.ts` también cayera dentro de los projects `ui-*`. Como esos projects dependen de `setup`, el login terminaría ejecutándose **dos veces**: una en el project `setup` y otra dentro de cada `ui-*`. (Los otros dos patrones del array — `tests/api` y `modulo-05` — son para que la suite de API de M05 no se cuele en los projects de UI.)
- **Qué pasa si lo cambias:** si quitas `/tests\/setup\/.*/`, verás `auth.setup.ts` duplicado en el reporte y un POST de login extra por browser; con multi-browser eso es login ×3 innecesario y más lento.

### `auth.setup.ts` (extensión `.setup.ts`, no `.spec.ts`)
- **Qué es:** un test normal de Playwright, pero con extensión `.setup.ts`. El project `setup` lo matchea con su propio `testMatch: /tests\/setup\/.*\.setup\.ts/`.
- **Por qué así (y no la alternativa obvia):** la extensión es la convención que permite que **una sola** regla de `testMatch` lo capture sin atrapar tus `*.spec.ts`. El project `setup` usa una regex distinta a la global precisamente para aislar el archivo de setup del resto de la suite.
- **Qué pasa si lo cambias:** si lo renombras a `auth.spec.ts`, el project `setup` deja de matchearlo (su regex pide `.setup.ts`) → el badge nunca se genera y todos los `ui-*` arrancan sin sesión. Y al revés: cualquier `*.setup.ts` que dejes suelto en `tests/` lo recogerá el setup project aunque no quieras.

### `await request.post(`${API_URL}/api/auth/login`, { data: { username, password } })`
- **Qué es:** el login se hace con un **POST a la API** usando el fixture `request` (`APIRequestContext`), no llenando el formulario en la UI.
- **Por qué así (y no la alternativa obvia):** llenar el formulario en UI es lento (navegación + render + clicks) y frágil (depende del DOM, de animaciones, de selectores). Un solo POST es **rápido y determinista**: prueba el contrato de la API y devuelve el `access_token` directo.
- **Qué pasa si lo cambias:** si haces login por UI en el setup, recuperas toda la fragilidad que querías evitar — y la pagas **una vez por corrida del setup**, multiplicado si tienes varios roles. El UI login se prueba aparte (en su propio spec), no como precondición de toda la suite.

### `await context.storageState({ path: USER_FILE })`
- **Qué es:** serializa el estado del `BrowserContext` (creado con `browser.newContext()`) a `.auth/user.json` — el "badge" que luego heredan los projects `ui-*`.
- **Por qué así (y no la alternativa obvia):** `storageState` siempre guarda **cookies + localStorage** juntos, así que el badge es portable a cualquier mecanismo de sesión. Nota: en este flujo se usa `context.storageState(...)` desde un contexto nuevo del `browser`, no `page.context().storageState(...)` — el setup abre su propio contexto, siembra el token y lo persiste.
- **Qué pasa si lo cambias:** en **este** proyecto OmniPizza guarda la sesión en `localStorage` (`access_token`, `username`) y **no** usa cookies de sesión, así que el array `cookies` del JSON queda vacío y todo el peso del badge está en `origins[].localStorage`. Si OmniPizza migrara a cookies httpOnly, el mismo `storageState` seguiría funcionando sin tocar el setup — por eso no escribimos el JSON a mano.

## ▶️ Cómo ejecutar este módulo

- **Correr SOLO el setup project (genera el badge):** `pnpm test:setup`
- **Comando del módulo (completo):** `pnpm m4`
- **UI mode:** `pnpm test:ui`
- **Headed / debug:** `pnpm test:headed` · `pnpm test:debug`
- **Filtrar:** por tag (`--grep @smoke`) o por archivo
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

## Git en M04 — dónde quedó cada acción (mapa rápido)

En este módulo Git va **tejido en el flujo**, no en un bloque aparte. Para referencia, esto es lo que tocaste y en qué micro-paso:

| Acción Git | Micro-paso | Para qué |
|---|---|---|
| `.gitignore` con `.auth/` | **1.2** | No filtrar tokens del `storageState` |
| Deshacer cambios (`git restore` / `git revert`) | **4.2** | Recuperarte cuando `auth.setup.ts` rompe todo |
| Rama + `git commit -m "feat(m04): ..."` | **7.2** | Punto de retorno limpio con la suite verde |
| `git push -u` + `gh pr create` (+ tabla de merge) | **9.2** | Compartir el trabajo y abrir code review |

> ⚠️ **Regla de oro (de 4.2):** `git revert` es siempre seguro en repos compartidos porque no reescribe el historial. **Nunca** uses `--amend`, `reset --hard` ni `rebase` sobre commits que **ya pusheaste** — eso rompe el repo de tus compañeros.

---

> 📚 **Profundización opcional:** [Cuenta de GitHub + SSH](../../git-github-course/modulo-06-github/01-configuracion-cuenta.md) · [Crear y subir un repo](../../git-github-course/modulo-06-github/02-crear-subir-repo.md) · [PRs detallados (fork, plantilla, review)](../../git-github-course/modulo-06-github/03-pull-requests.md) · [Manual completo de undo](../../git-github-course/modulo-03-undo-remotos-tags/01-deshacer-cambios.md) · [Trabajar con remotos](../../git-github-course/modulo-03-undo-remotos-tags/02-remotos.md)
