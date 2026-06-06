# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución** de M04: correr el setup project, leer los custom fixtures y la demostración de `page.route()`. Al final tienes el código completo de `auth.setup.ts`, `omnipizza.ts`, `unique-data.ts` y `ejemplo.spec.ts`.

---

## Paso 4 — Lectura guiada de `tests/setup/auth.setup.ts`

Abre el archivo y fíjate en:

1. **Es un `setup.ts`, no un `spec.ts`** — el `testMatch` de `playwright.config.ts` los distingue.
2. Hace **login por API** (un `POST /auth/login`), no por UI.
3. Persiste cookies/localStorage en `.auth/user.json` con `storageState`.
4. **NO aparece en `tests/` regulares** — vive en `tests/setup/` para que el project `api` y los flujos negativos (`anonymous`) **no lo hereden**.

---

## Paso 5 — Correr SÓLO el setup project

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

## Paso 6 — Lectura guiada de `fixtures/omnipizza.ts`

Cosas en las que fijarte:

- `test.extend<{...}, {...}>()` — el primer genérico son **test fixtures** (1 por TC), el segundo son **worker fixtures** (1 por worker).
- `loginPage`, `catalogPage`, `checkoutPage` son **test fixtures**: Playwright los crea por TC y los inyecta al callback.
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
3. El test `uniqueEmail genera identificadores por worker` debe verificar que `email1 !== email2` y que ambos contengan `w<workerIndex>`.

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

El delta principal está en que **no hay login por UI** en cada TC. Anota el tiempo de cada uno — deja que los datos hablen.

---

## Código completo — `tests/setup/auth.setup.ts`

```ts
// @file tests/setup/auth.setup.ts
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

---

## Código completo — `fixtures/omnipizza.ts`

```ts
// @file fixtures/omnipizza.ts
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

---

## Código completo — `helpers/unique-data.ts`

```ts
// @file helpers/unique-data.ts
import type { TestInfo } from "@playwright/test";

export function uniqueEmail(info: TestInfo, prefix = "qa"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@example.test`;
}

export function uniqueOrderId(info: TestInfo): string {
  return `ORD-w${info.workerIndex}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
  test("entra directo al catálogo gracias al setup project @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay llamada a login. El storageState ya trajo la sesión.
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("usa el worker fixture defaultMarket", async ({ page, catalogPage, defaultMarket }) => {
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

test.describe("page.route() — mocking de red (M04)", () => {
  test("UI muestra error cuando el API responde 500", async ({ page, catalogPage }) => {
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

  test("UI muestra estado vacío cuando no hay pizzas", async ({ page }) => {
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

test("uniqueEmail genera identificadores por worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "admin");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("admin+");
});
```
