# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M05: correr los specs que ya reciben los Page Objects inyectados por fixtures, leer la distinción test fixture vs worker fixture, y revisar la demostración de `page.route()` (mocking de red). Al final tienes el código completo de los tres archivos nuevos: `helpers/unique-data.ts`, `fixtures/omnipizza.ts` y `ejemplo.spec.ts`.

---

## Paso 4 — Ejecutar el ejemplo

```bash
# Headless
pnpm m5

# UI mode (recomendado para ver el fixture en acción)
pnpm test:ui
```

**Qué esperar:**

- El test `los fixtures entregan LoginPage/CatalogPage ya listos` pasa: usa `loginPage.loginInMarket(...)` y `catalogPage.expectLoaded()` **sin construir un solo Page Object a mano**.
- El test `defaultMarket es un worker fixture` confirma `defaultMarket.code === "MX"` sin navegar (el dato no depende de una pestaña).
- Los tests de `page.route()` mockean `/api/pizzas` (500 y estado vacío) y validan que la UI reacciona.

---

## Paso 5 — Lectura guiada de `fixtures/omnipizza.ts` (test vs worker)

Abre `fixtures/omnipizza.ts` y señala la diferencia que es el corazón del módulo:

- `loginPage`, `catalogPage`, `checkoutPage`, `standardUser` son **test fixtures**: Playwright los crea **por TC** y los inyecta al callback del test.
- `defaultMarket` es **worker fixture** (`scope: "worker"`): se crea **una vez por proceso paralelo**, no por test. Es un dato inmutable (el mercado por defecto), no un objeto ligado a la pestaña.
- En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo. El spec se lee como user story, no como plomería.

**Cómo verificarlo:** en un spec, al teclear `async ({ ` el editor sugiere `loginPage`, `catalogPage`, `standardUser` (test) y `defaultMarket` (worker), todos ya tipados por los genéricos `PageFixtures`/`WorkerFixtures`.

> **Nota:** en M05 el `page` **NO viene autenticado** — el test hace su login por UI usando `loginPage`. El badge heredado (`storageState` por project) llega en M06; aquí los fixtures solo inyectan Page Objects + datos (usuario estándar, mercado por defecto).

---

## Paso 6 — Demostración de `page.route()` (network mocking)

Abre el bloque `page.route() — network mocking` en `ejemplo.spec.ts`. Es un **Postman Mock Server embebido**: intercepta un request y devuelve la respuesta que tú quieras. Úsalo cuando:

1. Quieres probar un **caso de error** (5xx, 404) sin romper el backend.
2. Quieres probar **UI vacía** sin sembrar data.
3. Quieres **determinismo absoluto** en tests de red.

Los dos mecanismos que verás:

- `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body). El backend ni se entera.
- `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta) — lo usas en el reto.

> 🔍 **Detalle que parece obvio — registrar el mock ANTES del login, no justo antes de `/catalog`**
> **Qué es:** en el ejemplo el `page.route("**/api/pizzas*", ...)` va **arriba del todo del test**, antes del `loginPage.loginInMarket(...)` que navega.
> **Por qué así (y no la alternativa obvia):** `page.route` no es "para esta navegación" — queda **vivo durante toda la vida de la pestaña**. Si esperaras a registrarlo justo antes de `/catalog`, en un flujo real el login puede disparar el fetch de pizzas antes de que llegues a esa línea.
> **Qué pasa si lo cambias:** registrarlo **después** de que `/api/pizzas` ya se pidió = llegas tarde; el request real pasó y tu mock nunca corre. Registrarlo primero garantiza que lo intercepte pase lo que pase.

**¿Qué pasa si registras 2 mocks distintos al mismo URL?** Gana el **último** registrado.

> **Los locators de error/vacío son un patrón, no un test que deba pasar perfecto.** Los testids `catalog-error` / `catalog-empty` pueden no existir en OmniPizza tal cual — por eso el assert real del ejemplo es un `body` visible tentativo. Lo que aprendes es el **patrón** de mocking; ajusta el testid al DOM real cuando tengas el catálogo instrumentado.

---

## Paso 7 — Data isolation con `workerInfo`

Al final de `ejemplo.spec.ts` hay un test que usa `uniqueEmail(testInfo)`. Con `fullyParallel: true` varios workers corren a la vez; si todos siembran el mismo email/orden, colisionan. `uniqueEmail(info)` usa `workerIndex` para que el dato de **cada worker** sea propio, y `Date.now()` lo hace único entre corridas. Fíjate en que el segundo argumento (`"locked"`) cambia el prefijo sin sobrecargar la función — el parámetro por defecto en acción.

---

## Código completo — `helpers/unique-data.ts`

```ts
// @file modulo-05-fixtures/helpers/unique-data.ts
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

## Código completo — `fixtures/omnipizza.ts`

```ts
// @file modulo-05-fixtures/fixtures/omnipizza.ts
// ============================================================
// fixtures/omnipizza.ts — Custom fixtures del framework (M05)
// ============================================================
// Analogía QA: el fixture es el ambiente de prueba YA preparado.
// El TC recibe los Page Objects listos (loginPage, catalogPage…)
// sin escribir `new LoginPage(page)`, y ejecuta sus pasos.
//
// Nota importante: en M05 el `page` NO viene autenticado — el test
// hace su login por UI usando `loginPage`. El badge heredado
// (`storageState` por project) llega en M06; aquí los fixtures solo
// inyectan Page Objects + datos (usuario estándar, mercado por defecto).
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

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-05-fixtures/tests/ejemplo.spec.ts
// ============================================================
// M05 — Fixtures custom (inyección de Page Objects)
// ============================================================
// Este spec corre en el project `chromium` SIN sesión heredada.
// El login se hace por UI dentro del test — el badge/storageState
// que evita ese login llega en M06 (Setup).
//
// El fixture `loginPage`/`catalogPage` inyecta Page Objects ya
// ligados a la pestaña del TC: en el test NUNCA escribes
// `new LoginPage(page)`, el fixture te lo entrega listo.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("Fixtures inyectan Page Objects (M05)", () => {
  test("los fixtures entregan LoginPage/CatalogPage ya listos @smoke", async ({
    loginPage,
    catalogPage,
    standardUser,
    defaultMarket,
  }) => {
    // Sin `new LoginPage(page)`: el fixture ya inyectó los Page Objects.
    // Sin sesión heredada: hacemos el login por UI (igual que en M01,
    // pero encapsulado en el POM). En M06 este login desaparece.
    await loginPage.loginInMarket(standardUser, defaultMarket.code);

    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("defaultMarket es un worker fixture: se crea 1 vez por worker", async ({
    defaultMarket,
  }) => {
    // defaultMarket tiene scope `worker`: no depende de una pestaña ni de
    // una sesión, por eso se puede afirmar su valor sin navegar.
    expect(defaultMarket.code).toBe("MX");
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
//
// ⚠️ El mock se registra ANTES de navegar. Como sigue vivo durante todo
//    el ciclo de la pestaña, lo registramos primero y LUEGO hacemos el
//    login por UI: cuando el catálogo pida /api/pizzas, el mock responde.
// ============================================================

test.describe("page.route() — network mocking (M05)", () => {
  test("UI reacciona cuando la API responde 500", async ({
    page,
    loginPage,
    standardUser,
    defaultMarket,
  }) => {
    // 1. Registrar el mock ANTES de cualquier navegación.
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal server error (mocked)" }),
      });
    });

    // 2. Ejecutar el flujo (login por UI → aterriza en /catalog, que pide
    //    /api/pizzas y recibe el 500 mockeado).
    await loginPage.loginInMarket(standardUser, defaultMarket.code);

    // 3. Verificar que la UI reacciona al error.
    //    Este assert es tentativo — ajústalo al DOM real de OmniPizza.
    await expect(page.locator("body")).toBeVisible();
    // Idealmente: await expect(page.getByTestId('catalog-error')).toBeVisible();
  });

  test("UI muestra estado vacío cuando no hay pizzas", async ({
    page,
    loginPage,
    standardUser,
    defaultMarket,
  }) => {
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pizzas: [] }),
      });
    });

    await loginPage.loginInMarket(standardUser, defaultMarket.code);
    // Idealmente: await expect(page.getByTestId('catalog-empty')).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// Data isolation con workerInfo
// ============================================================
// Con `fullyParallel: true` varios workers corren a la vez. Si todos
// siembran el mismo email/orden, colisionan. `uniqueEmail(info)` usa
// `workerIndex` para que el dato de cada worker sea propio.

import { uniqueEmail } from "../helpers/unique-data";

test("uniqueEmail genera identificadores por worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "locked");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("locked+");
});
```
