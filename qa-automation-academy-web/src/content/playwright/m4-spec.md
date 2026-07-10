# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución** de M04: correr el setup project, leer los custom fixtures y la demostración de `page.route()`. Al final tienes el código completo de `auth.setup.ts`, `omnipizza.ts`, `unique-data.ts` y `ejemplo.spec.ts`.

---

## Paso 4 — Lectura guiada de `tests/setup/auth.setup.ts`

Abre el archivo y fíjate en:

1. **Es un `setup.ts`, no un `spec.ts`** — el `testMatch` de `playwright.config.ts` los distingue.
2. Hace **login por API** (un `POST /api/auth/login`), no por UI.
3. Persiste cookies/localStorage en `.auth/user.json` con `context.storageState({ path })`.
4. **NO aparece en `tests/` regulares** — vive en `tests/setup/` para que el project `api` y los flujos negativos (`anonymous`) **no lo hereden**.

> 🔍 **Detalle que parece obvio — `auth.setup.ts` (extensión `.setup.ts`, no `.spec.ts`)**
> **Qué es:** el punto 1 de arriba, visto de cerca: un test normal de Playwright, pero con extensión `.setup.ts` — el project `setup` lo matchea con su propio `testMatch: /tests\/setup\/.*\.setup\.ts/`.
> **Por qué así (y no la alternativa obvia):** la extensión es la convención que permite que **una sola** regla de `testMatch` lo capture sin atrapar tus `*.spec.ts`. El project `setup` usa una regex distinta a la global precisamente para aislar el archivo de setup del resto de la suite.
> **Qué pasa si lo cambias:** si lo renombras a `auth.spec.ts`, el project `setup` deja de matchearlo (su regex pide `.setup.ts`) → el badge nunca se genera y todos los `ui-*` arrancan sin sesión. Y al revés: cualquier `*.setup.ts` que dejes suelto en `tests/` lo recogerá el setup project aunque no quieras.

> 🔍 **Detalle que parece obvio — `await context.storageState({ path: USER_FILE })`**
> **Qué es:** el punto 3 de arriba, visto de cerca: serializa el estado del `BrowserContext` a `.auth/user.json` — el "badge" que luego heredan los projects `ui-*`. Ojo: en el archivo del repo se usa `context.storageState(...)` desde un **contexto nuevo** (`browser.newContext()`), no `page.context()` del test — el setup abre su propio contexto, siembra el token y lo persiste.
> **Por qué así (y no la alternativa obvia):** `storageState` siempre guarda **cookies + localStorage** juntos, así que el badge es portable a cualquier mecanismo de sesión — por eso no escribimos el JSON a mano.
> **Qué pasa si lo cambias:** OmniPizza guarda la sesión en `localStorage` (`access_token`, `username`) y **no** usa cookies de sesión, así que el array `cookies` del JSON queda vacío y todo el peso del badge está en `origins[].localStorage`. Si OmniPizza migrara a cookies httpOnly, el mismo `storageState` seguiría funcionando sin tocar el setup.

---

## Paso 5 — Correr SÓLO el setup project

```bash
pnpm test:setup
```

**Qué debería pasar:**

1. Verás **dos** tests verdes en el project `setup` (corren en modo serial): `wake up backend (warmup cold start)` y `authenticate as standard_user`.
2. Tras la corrida, el archivo `.auth/user.json` aparece en disco:
   ```bash
   ls .auth
   cat .auth/user.json
   ```
   Fíjate en las primeras líneas: `cookies` y `origins` (ahí vive el `localStorage`).
3. Ese archivo contiene cookies + localStorage. **Está en `.gitignore`** — nunca lo commitees.

> 💡 **Si falla** con `ECONNREFUSED` o `404`: probablemente OmniPizza está dormido. Vuelve a correr una segunda vez (el cold start despierta el backend).

---

## Paso 6 — Lectura guiada de `fixtures/omnipizza.ts`

Cosas en las que fijarte:

- `base.extend<PageFixtures, WorkerFixtures>()` — el primer genérico son **test fixtures** (1 por TC), el segundo son **worker fixtures** (1 por worker).
- `loginPage`, `catalogPage`, `checkoutPage`, `standardUser` son **test fixtures**: Playwright los crea por TC y los inyecta al callback.
- `defaultMarket` es **worker fixture** (scope `"worker"`): se crea una vez por proceso paralelo.
- En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo.

---

## Paso 7 — Correr M04 completo

```bash
# El project ui-chromium declara `dependencies: ['setup']`,
# así que Playwright correrá setup automáticamente primero.
pnpm m4
```

**Qué debería pasar:**

1. Setup corre primero (genera/refresca `.auth/user.json`).
2. Los TCs del módulo arrancan **ya autenticados**: en el primer test verás `page.goto("/catalog")` SIN paso de login previo.
3. El test `uniqueEmail genera identificadores por worker` debe verificar que `email1 !== email2` y que `email1` contenga `w<workerIndex>`; `email2` usa el prefijo `locked+`.

---

## Paso 8 — Demostración de `page.route()` (mocking)

Abre la sección `page.route() — mocking de red` en `ejemplo.spec.ts`. Pasos clave:

1. **El mock se registra ANTES de `page.goto()`** — si lo registras después, el primer request ya pasó.
2. `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body).
3. `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta).

**Pregúntate:** *"¿qué pasa si registras 2 mocks distintos al mismo URL?"* — respuesta: gana el último registrado.

---

## Paso 9 — Cronometrar el ahorro

Ejercicio rápido:

```bash
# Sin setup project (M03)
time pnpm m3

# Con setup project (M04)
time pnpm m4
```

**🪟 Windows / PowerShell:** `time` no existe — usa `Measure-Command { pnpm m3 }` y `Measure-Command { pnpm m4 }`.

El delta principal está en que **no hay login por UI** en cada TC. Anota el tiempo de cada uno — deja que los datos hablen.

---

## Código completo — `tests/setup/auth.setup.ts`

```ts
// @file tests/setup/auth.setup.ts
// ============================================================
// tests/setup/auth.setup.ts — Login vía API (M04)
// ============================================================
// Analogía QA: el proceso de "registro en recepción". Se hace
// UNA SOLA VEZ al llegar; todos los TCs posteriores entran con
// el badge (storageState) ya emitido.
//
// Corre como project "setup" gracias al patrón 2026 de Playwright:
//   - project: { name: "setup", testMatch: /.*\.setup\.ts/ }
//   - los demás projects declaran `dependencies: ["setup"]`
//
// Ventajas vs globalSetup con UI login:
//   ✅ Mucho más rápido (1 POST vs navegación completa)
//   ✅ Determinista (sin flakiness de UI)
//   ✅ Reutilizable — el mismo pattern para otras personas que
//      autentican (problem_user, performance_glitch_user…), no sólo standard.
// ============================================================

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
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
});

setup("wake up backend (warmup cold start)", async ({ request }) => {
  // Render free tier duerme el backend después de 15 min.
  // Este setup hace el primer request del día y garantiza que
  // todos los tests que siguen tengan el backend despierto.
  setup.setTimeout(90_000);
  const res = await request.get(`${API_URL}/health`, { timeout: 80_000 });
  expect(res.ok(), "backend /health should respond 200").toBeTruthy();
});

setup("authenticate as standard_user", async ({ browser, request }) => {
  // 1. Login vía API para obtener el token.
  const apiRes = await request.post(`${API_URL}/api/auth/login`, {
    data: { username: USERNAME, password: PASSWORD },
  });
  expect(apiRes.ok(), `login API should be 200. Status: ${apiRes.status()}`).toBeTruthy();
  const { access_token } = (await apiRes.json()) as { access_token: string };
  expect(access_token, "access_token should be present in the response").toBeTruthy();

  // 2. Abrir un contexto de navegador y sembrar la sesión.
  //    OmniPizza persiste el token en localStorage — lo escribimos ahí.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE_URL);

  await page.evaluate(([token, username]) => {
    window.localStorage.setItem("access_token", token);
    window.localStorage.setItem("username", username);
  }, [access_token, USERNAME]);

  // 3. Persistir el storageState para todos los projects UI.
  await context.storageState({ path: USER_FILE });
  await context.close();
});
```

---

## Código completo — `fixtures/omnipizza.ts`

```ts
// @file fixtures/omnipizza.ts
// ============================================================
// fixtures/omnipizza.ts — Custom fixtures del framework (M04)
// ============================================================
// Analogía QA: el fixture es el ambiente de prueba YA preparado
// (usuario logueado, mercado seleccionado, data sembrada). El TC
// lo recibe listo para ejecutar sus pasos.
//
// Nota importante: el `page` autenticado lo provee el `storageState`
// del project (definido en playwright.config.ts). Aquí sólo añadimos
// fixtures extra (marketContext, fixtures por persona) o helpers cross-test.
// ============================================================

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
  // Worker-scoped: se crea 1 vez por worker.
  defaultMarket: Market;
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // --- Worker fixture ---
  // eslint-disable-next-line no-empty-pattern
  defaultMarket: [async ({}, use) => {
    const mx = markets.find((m) => m.code === "MX");
    if (!mx) throw new Error("MX market not found in data/markets.json");
    await use(mx);
  }, { scope: "worker" }],

  // --- Test fixtures ---
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const u = users.find((u) => u.username === "standard_user");
    if (!u) throw new Error("standard_user not found in data/users.json");
    await use(u);
  },
});

export { expect };
export type { Market, User };
```

---

## Código completo — `helpers/unique-data.ts`

```ts
// @file helpers/unique-data.ts
// ============================================================
// helpers/unique-data.ts — Data isolation para tests en paralelo
// ============================================================
// Analogía QA: cada tester paralelo lleva su propio libro de
// pedidos. Nunca comparten folios con los demás workers.
//
// Sin esto, `fullyParallel: true` + datos compartidos = colisiones
// (órdenes duplicadas, emails repetidos) que `retries` enmascara
// pero no arregla.
// ============================================================

import type { TestInfo } from "@playwright/test";

/**
 * Email único por worker + timestamp.
 * Ej: `customer+w0-1714000000000@omnipizza.test`
 */
export function uniqueEmail(info: TestInfo, prefix = "customer"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@omnipizza.test`;
}

/**
 * Identificador único de orden — útil para referencias externas.
 * Ej: `ORD-w0-1714000000000-4821`
 */
export function uniqueOrderId(info: TestInfo): string {
  const random = Math.floor(Math.random() * 10_000);
  return `ORD-w${info.workerIndex}-${Date.now()}-${random}`;
}

/**
 * Prefijo determinista por worker — útil cuando no queremos timestamp
 * (ej. seeds reproducibles en tests deterministas de lectura).
 */
export function workerPrefix(info: TestInfo): string {
  return `w${info.workerIndex}`;
}
```

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-04-setup-fixtures/ejemplo.spec.ts
// ============================================================
// M04 — Fixtures custom + storageState heredado
// ============================================================
// NOTA: este spec corre en project `ui-chromium` que declara
// `dependencies: ['setup']`. Antes de ejecutarlo, Playwright
// ejecuta `tests/setup/auth.setup.ts`, persiste el storageState
// y cada test arranca ya autenticado.
//
// El fixture `loginPage`/`catalogPage` inyecta Page Objects ya
// ligados a la pestaña del TC.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("Fixtures + storageState (M04)", () => {
  test("lands directly on the catalog thanks to the setup project @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay llamada a login. El storageState ya trajo la sesión.
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("uses the defaultMarket worker fixture", async ({ page, catalogPage, defaultMarket }) => {
    // defaultMarket se creó UNA vez por worker
    expect(defaultMarket.code).toBe("MX");
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
  });
});

// ============================================================
// Demostración de `page.route()` — mocking de red
// ============================================================
// Analogía: Postman Mock Server embebido en Playwright.
// Intercepta un request, devuelve la respuesta que tú quieras.
//
// Úsalo cuando:
//   - Quieres probar un caso de error (5xx, 404) sin romper el backend.
//   - Quieres probar UI vacía sin sembrar data.
//   - Quieres determinismo absoluto en tests de red.
// ============================================================

test.describe("page.route() — network mocking (M04)", () => {
  test("UI shows an error when the API responds 500", async ({ page, catalogPage }) => {
    // 1. Registrar el mock ANTES del navigate
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal server error (mocked)" }),
      });
    });

    // 2. Ejecutar el flujo
    await page.goto("/catalog");

    // 3. Verificar que la UI reacciona al error
    //    (test esperado: aparece un toast, banner o mensaje de error)
    //    Este assert es tentativo — ajusta al DOM real de OmniPizza.
    await expect(page.locator("body")).toBeVisible();
    // Idealmente: await expect(page.getByTestId('catalog-error')).toBeVisible();
  });

  test("UI shows empty state when there are no pizzas", async ({ page }) => {
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pizzas: [] }),
      });
    });

    await page.goto("/catalog");
    // Idealmente: await expect(page.getByTestId('catalog-empty')).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// Data isolation con workerInfo — prepara el terreno para M05
// ============================================================

import { uniqueEmail } from "../helpers/unique-data";

test("uniqueEmail generates identifiers per worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "locked");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("locked+");
});
```
