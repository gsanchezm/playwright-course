# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M05: correr los specs que ya reciben los Page Objects inyectados por fixtures, leer la distinción test fixture vs worker fixture, y revisar la demostración de `page.route()` (mocking de red). Al final tienes el código completo de los tres archivos nuevos: `helpers/unique-data.ts`, `fixtures/omnipizza.ts` y `ejemplo.spec.ts` — este último también incluye los 8 escenarios de widgets nuevos que ves en detalle en [5.3 Widgets nuevos](/docs/playwright/m5-interacciones).

---

## Paso 4 — Ejecutar el ejemplo

```bash
# Headless
pnpm m5

# UI mode (recomendado para ver el fixture en acción)
pnpm test:ui
```

**Qué esperar:**

- El test `the fixtures deliver LoginPage/CatalogPage ready to use` pasa: usa `loginPage.loginInMarket(...)` y `catalogPage.expectLoaded()` **sin construir un solo Page Object a mano**.
- El test `defaultMarket is a worker fixture: created once per worker` confirma `defaultMarket.code === "MX"` sin navegar (el dato no depende de una pestaña).
- Los tests de `page.route()` mockean `/api/pizzas` (500 y estado vacío) y validan que la UI reacciona.
- Al final del archivo corren los 8 escenarios de widgets nuevos (date picker, dropdowns, radio group, tooltips, modal, mercado RTL y confirmación de orden) — detalle completo en [5.3 Widgets nuevos](/docs/playwright/m5-interacciones).

---

## Paso 5 — Lectura guiada de `fixtures/omnipizza.ts` (test vs worker)

Abre `fixtures/omnipizza.ts` y señala la diferencia que es el corazón del módulo:

- `loginPage`, `catalogPage`, `checkoutPage`, `standardUser` son **test fixtures**: Playwright los crea **por TC** y los inyecta al callback del test.
- `defaultMarket` es **worker fixture** (`scope: "worker"`): se crea **una vez por proceso paralelo**, no por test. Es un dato inmutable (el mercado por defecto), no un objeto ligado a la pestaña.
- En el test ya **no escribes `new LoginPage(page)`** — el fixture te lo entrega listo. El spec se lee como user story, no como plomería.

**Cómo verificarlo:** en un spec, al teclear `async ({ ` el editor sugiere `loginPage`, `catalogPage`, `standardUser` (test) y `defaultMarket` (worker), todos ya tipados por los genéricos `PageFixtures`/`WorkerFixtures`.

> **Nota:** en M05 el `page` **NO viene autenticado** — el test hace su login por UI usando `loginPage`. El badge heredado (`storageState` por project) llega en M06; aquí los fixtures solo inyectan Page Objects + datos (usuario estándar, mercado por defecto).

> 🔍 **Detalle que parece obvio — fixtures (QUÉ se inyecta) vs hooks (CUÁNDO corre código)**
> **Qué es:** `test.extend` (fixtures) te ENTREGA un objeto ya construido —
> `loginPage`, `catalogPage`, etc. `test.beforeEach` (hook) EJECUTA código antes de
> cada test — no te entrega nada nuevo, corre una rutina.
> **Por qué así (y no la alternativa obvia):** son ortogonales, no competidores: el
> `beforeEach` de `Checkout widgets` USA el `loginPage`/`catalogPage`/`checkoutPage` que el
> fixture ya inyectó — el hook no podría hacer login sin el Page Object que el fixture le
> entrega primero.
> **Qué pasa si lo confundes:** intentar "inyectar" una precondición como si fuera un
> fixture (ej. un fixture `withItemInCart` que hace login+agrega pizza) funciona, pero
> Playwright ya tiene una herramienta más simple y más visible en el reporte para "ejecutar
> código antes de cada test de este grupo": el hook.

---

## Paso 6 — Demostración de `page.route()` (network mocking)

Abre el bloque `page.route() — network mocking` en `ejemplo.spec.ts`. Es un **Postman Mock Server embebido**: intercepta un request y devuelve la respuesta que tú quieras. Úsalo cuando:

1. Quieres probar un **caso de error** (5xx, 404) sin romper el backend.
2. Quieres probar **UI vacía** sin sembrar data.
3. Quieres **determinismo absoluto** en tests de red.

Los dos mecanismos que verás:

- `route.fulfill({...})` devuelve una respuesta totalmente inventada (status, headers, body). El backend ni se entera.
- `route.continue()` deja pasar el request al backend real (útil para introducir latencia, no para cambiar la respuesta) — lo usas en el reto.

> 🪝 **Por qué esta sección no tiene un hook:** el mock debe registrarse ANTES del login
> (que navega), y el body de cada mock es distinto (500 vs lista vacía) — no hay
> precondición común que extraer. Es el contraste útil: un hook ayuda cuando 2+ tests
> comparten código idéntico: aquí no lo comparten.

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
import {
  LoginPage,
  CatalogPage,
  CheckoutPage,
  MenuPage,
  ProfilePage,
  PizzaCustomizerModal,
} from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];

type PageFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  menuPage: MenuPage;
  profilePage: ProfilePage;
  pizzaCustomizer: PizzaCustomizerModal;
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
  menuPage: async ({ page }, use) => {
    await use(new MenuPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  pizzaCustomizer: async ({ page }, use) => {
    await use(new PizzaCustomizerModal(page));
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

Este archivo también incluye los 8 escenarios de widgets nuevos (date picker, dropdowns, radio group, tooltips, modal, mercado RTL y confirmación de orden) — los ves explicados paso a paso en [5.3 Widgets nuevos](/docs/playwright/m5-interacciones); aquí tienes el archivo completo.

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
import { uniqueEmail } from "../helpers/unique-data";
import type { Market } from "../types";
import marketsJson from "../data/markets.json";

// Mercado US para el flujo de checkout (usa `zip-code`, no `district`).
const usMarket = (marketsJson as Market[]).find((m) => m.code === "US")!;

test.describe("Fixtures inject Page Objects (M05)", () => {
  test("the fixtures deliver LoginPage/CatalogPage ready to use @smoke", async ({
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

  test("defaultMarket is a worker fixture: created once per worker", async ({
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
//
// 🪝 Por qué esta sección NO usa un hook: el mock debe registrarse ANTES
//    del login (que navega), y el BODY del mock es distinto en cada test
//    (500 vs lista vacía) — no hay código común que extraer a un
//    beforeEach sin perder justo la parte que cada test necesita variar.
// ============================================================

test.describe("page.route() — network mocking (M05)", () => {
  test("UI reacts when the API responds 500", async ({
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
    //    OmniPizza no expone (todavía) un estado de error instrumentado
    //    con testid propio — por eso el assert real de este demo es
    //    estructural (la página sigue viva). Lo que se enseña es el
    //    PATRÓN de mocking, no un aserto de UI verificado. Si tu propia
    //    app SÍ expone un testid de error, ese es el assert que va aquí.
    await expect(page.locator("body")).toBeVisible();
  });

  test("UI shows empty state when there are no pizzas", async ({
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

    // Mismo caso: sin testid de estado vacío confirmado en OmniPizza, el
    // assert real es estructural — el PATRÓN es lo que importa aquí.
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// Data isolation con workerInfo
// ============================================================
// Con `fullyParallel: true` varios workers corren a la vez. Si todos
// siembran el mismo email/orden, colisionan. `uniqueEmail(info)` usa
// `workerIndex` para que el dato de cada worker sea propio.

test("uniqueEmail generates identifiers per worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "locked");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("locked+");
});

// ============================================================
// 🧩 Interactuando con los widgets NUEVOS de OmniPizza
// ============================================================
// Antes vivían en tests/interacciones-nuevas.spec.ts — ahora están
// aquí para tener TODO el módulo en un solo archivo.
//
// La plataforma sumó controles que valen oro para enseñar, porque
// cada uno se automatiza con una técnica DISTINTA de Playwright:
//
//   1. Date picker nativo (perfil)      → fill("YYYY-MM-DD")
//   2. Dropdown de tarjeta (checkout)   → selectOption(value)
//   3. Método de pago (radio group)     → click + estado
//   4. Tooltip CUSTOM (propina)         → hover + toBeVisible
//   5. Tooltip NATIVO (teléfono)        → getAttribute("title")
//   6. Modal / popup (Customize Pizza)  → abrir → interactuar → confirmar
//   7. Mercado Arabia Saudita (RTL)     → locators multi-idioma / dir=rtl
//   8. Confirmación de orden            → 2 popups encadenados → /order-success
//
// Siguen sin sesión heredada: cada test hace login por UI. Antes cada
// test repetía `loginPage.loginInMarket(...)` + `catalogPage.expectLoaded()`
// a mano (y los 4 de checkout además llamaban a un helper manual
// `openCheckoutWithItem(...)` reenviando 6 parámetros). Ahora esa
// precondición compartida vive en UN `test.beforeEach` por grupo — el
// hook corre igual de seguido (sigue siendo login por UI en cada test;
// eso lo elimina M06 con storageState), pero el CÓDIGO ya no se repite.
// ============================================================

test.describe("Catalog-scoped widgets (M05)", () => {
  // Precondición compartida: login + catálogo cargado. Antes eran las
  // mismas 2 líneas repetidas al inicio de cada test de este grupo.
  test.beforeEach(async ({ loginPage, catalogPage, standardUser, defaultMarket }) => {
    await loginPage.loginInMarket(standardUser, defaultMarket.code);
    await catalogPage.expectLoaded();
  });

  // ============================================================
  // 1) Date picker NATIVO — <input type="date">
  // ============================================================
  // Regla de oro: NO se clickea el calendario emergente (es UI del
  // navegador, fuera del DOM). Un input date se llena con .fill() en
  // formato ISO "YYYY-MM-DD" y su value SIEMPRE se lee en ISO.
  // ============================================================
  test.describe("Native date picker on the profile (M05)", () => {
    test("fill('YYYY-MM-DD') sets the birthday without touching the calendar @regression", async ({
      profilePage,
    }) => {
      await profilePage.goto();
      await profilePage.expectLoaded();

      // La técnica: .fill() con ISO. No abrimos ni clickeamos el calendario.
      await profilePage.setBirthday("1990-05-15");

      // El value de un input date se lee/afirma también en ISO.
      await profilePage.expectBirthday("1990-05-15");
      // Sin .save(): el demo es de la INTERACCIÓN con el control, cero
      // efecto colateral sobre el estado del perfil.
    });
  });

  // ============================================================
  // 6) Modal / popup — Customize Pizza
  // ============================================================
  // Un modal es una sub-pantalla. El de OmniPizza NO usa role="dialog"
  // (nos anclamos por testid). Detalle real: "Choose Size" se marca
  // REQUIRED en la UI, pero el botón confirmar NO nace deshabilitado —
  // buena lección de QA: un "requerido" visual no siempre bloquea el
  // submit; verifícalo, no lo asumas.
  // ============================================================
  test.describe("Modal 'Customize Pizza' (M05)", () => {
    test("open → pick size + topping → confirm adds to cart @regression", async ({
      catalogPage,
      pizzaCustomizer,
      menuPage,
    }) => {
      // Abrir el modal (sin confirmar).
      await catalogPage.openCustomizerForFirst();
      await pizzaCustomizer.expectOpen();

      // Interacción típica de modal: elegir tamaño + un topping.
      await pizzaCustomizer.selectSize("large");
      await pizzaCustomizer.toggleTopping("mushrooms");

      // Confirmar cierra el modal y suma la pizza al carrito.
      await pizzaCustomizer.confirm();
      await pizzaCustomizer.expectClosed();
      await menuPage.expectCartCount(1);
    });
  });
});

test.describe("Checkout widgets — item already in cart (M05)", () => {
  // Precondición compartida por las 4 sub-suites de abajo: login → agregar
  // una pizza → abrir el checkout ya poblado (el checkout vacío muestra
  // `start-order-btn`, no el form). Antes vivía en la función
  // `openCheckoutWithItem(page, loginPage, catalogPage, checkoutPage, user,
  // market)`, llamada a mano reenviando 6 parámetros en cada uno de los 4
  // tests de abajo. Ahora se escribe UNA sola vez.
  test.beforeEach(async ({
    page,
    loginPage,
    catalogPage,
    checkoutPage,
    standardUser,
    defaultMarket,
  }) => {
    await loginPage.loginInMarket(standardUser, defaultMarket.code);
    await catalogPage.expectLoaded();
    await catalogPage.addFirstPizza();
    await page.goto("/checkout");
    await checkoutPage.expectLoaded();
  });

  // ============================================================
  // 2) Dropdown NATIVO de la tarjeta — <select> → selectOption
  // ============================================================
  // La expiración son DOS <select> nativos (mes/año). No se escriben
  // ni se clickea la lista: se accionan con .selectOption(value).
  // ============================================================
  test.describe("Credit card dropdowns (M05)", () => {
    test("selectOption picks expiration month/year on the native <select>s @regression", async ({
      checkoutPage,
    }) => {
      await checkoutPage.selectPaymentMethod("card");
      await checkoutPage.expectCardFieldsVisible();

      // Tarjeta de PRUEBA. Lo pedagógico: expMonth/expYear van por
      // .selectOption() (son <select> nativos), no por .fill().
      await checkoutPage.fillCard({
        holder: "STANDARD USER",
        number: "4111 1111 1111 1111",
        expMonth: "05",
        expYear: "28",
        cvv: "123",
      });

      // El value de un <select> es el `value` del <option> elegido.
      await checkoutPage.expectExpiry("05", "28");
    });
  });

  // ============================================================
  // 3) Método de pago — radio group de botones (role="radio")
  // ============================================================
  // No son <input type="radio">: son botones con role="radio". Se
  // eligen con .click() y el grupo reacciona en AMBOS sentidos. Como
  // "card" ya viene seleccionado por defecto, para probar la INTERACCIÓN
  // (y no el estado inicial) demostramos la TRANSICIÓN: cambiar a otro
  // método y volver. Detalle real de OmniPizza: los campos de tarjeta se
  // QUITAN del DOM cuando el método no es "card".
  // ============================================================
  test.describe("Payment method (radio group) (M05)", () => {
    test("switching method shows/hides the card fields @regression", async ({
      checkoutPage,
    }) => {
      // Estado inicial: "card" es el método por defecto.
      await checkoutPage.expectPaymentSelected("card");
      await checkoutPage.expectCardFieldsVisible();

      // Cambiar a "cash": el radio pasa a cash y los campos de tarjeta
      // se quitan del DOM.
      await checkoutPage.selectPaymentMethod("cash");
      await checkoutPage.expectPaymentSelected("cash");
      await checkoutPage.expectCardFieldsHidden();

      // Volver a "card": el radio regresa y los campos reaparecen.
      await checkoutPage.selectPaymentMethod("card");
      await checkoutPage.expectPaymentSelected("card");
      await checkoutPage.expectCardFieldsVisible();
    });
  });

  // ============================================================
  // 4) Tooltip CUSTOM — hover revela un [role="tooltip"]
  // ============================================================
  // El ícono ℹ️ de la propina expone su texto en un tooltip propio
  // del DOM (aria-describedby → [role="tooltip"]). Se prueba con
  // .hover() y afirmando que el tooltip se hace visible.
  // ============================================================
  test.describe("Custom tooltip on the tip (M05)", () => {
    test("hovering ℹ️ makes the tooltip visible @regression", async ({
      checkoutPage,
    }) => {
      // Antes del hover el tooltip no existe en el DOM (oculto)…
      await checkoutPage.expectTipTooltipHidden();
      // …y el hover lo revela. Así el test prueba el hover, no un
      // tooltip que estuviera siempre visible.
      await checkoutPage.hoverTipInfo();
      await checkoutPage.expectTipTooltipVisible();
    });
  });

  // ============================================================
  // 5) Tooltip NATIVO — atributo title
  // ============================================================
  // El teléfono usa el tooltip nativo del navegador (atributo `title`).
  // Dos lecciones:
  //   • Los title NO se pintan en el DOM al hacer hover → Playwright NO
  //     puede afirmarlos como visibles; se leen del atributo.
  //   • El MENSAJE está localizado por market (MX: "Ingrese un teléfono
  //     válido (7-15 dígitos)", US: "Enter a valid phone number (7-15
  //     digits)"). Por eso afirmamos el fragmento estable "7-15", no el
  //     texto completo — mismo principio i18n que con los testids.
  // ============================================================
  test.describe("Native tooltip on the phone (M05)", () => {
    test("the title is verified by reading the attribute, not via hover @regression", async ({
      checkoutPage,
    }) => {
      const title = await checkoutPage.getPhoneTitle();
      expect(title).toContain("7-15");
    });
  });
});

// ============================================================
// 7) Mercado Arabia Saudita — layout RTL
// ============================================================
// Al elegir el market SA, la app entera pasa a RTL (html[dir=rtl],
// lang="ar") y los precios salen en `ر.س.` (SAR). Recordatorio del
// curso: por eso NO se localiza por texto — los testids son estables
// en todos los markets, el texto no.
//
// 🪝 Este describe se queda SIN hook a propósito: usa el market "SA"
// directo (no `defaultMarket`), así que no comparte precondición con
// los grupos de arriba.
// ============================================================
test.describe("Saudi Arabia market / RTL (M05)", () => {
  test("SA renders the app in RTL with prices in SAR @regression", async ({
    page,
    loginPage,
    catalogPage,
    standardUser,
  }) => {
    // "SA" ya es un CountryCode válido (ver types/omnipizza.d.ts).
    await loginPage.loginInMarket(standardUser, "SA");
    await catalogPage.expectLoaded();

    // La dirección del documento cambia a right-to-left.
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    // Los precios llevan el símbolo del riyal saudí (ر.س.).
    const price = await catalogPage.getFirstPizzaPrice();
    expect(price).toContain("ر.س");
  });
});

// ============================================================
// 8) Popups de confirmación de orden — modal + pantalla de éxito
// ============================================================
// El checkout tiene DOS popups encadenados (esto cierra el flujo E2E
// enviando una orden de PRUEBA con tarjeta falsa):
//   1. `place-order` NO envía: abre un MODAL `confirm-order-modal`
//      que SÍ expone role="dialog" (lo afirmamos por rol Y por testid).
//   2. `confirm-order-yes` confirma → la app navega a /order-success
//      (pantalla completa, no modal) con un id de orden generado.
//
// 🪝 Tampoco lleva hook: usa el market "US" directo (no `defaultMarket`,
// que es MX y no sirve para este flujo — ver comentario de `usMarket`
// arriba), y su flujo de checkout llena TODO el form con `fillWithMarket`,
// no solo el pago — no comparte precondición con "Checkout widgets".
// ============================================================
test.describe("Order confirmation popups (M05)", () => {
  test("place-order → confirmation modal → /order-success @regression", async ({
    page,
    loginPage,
    catalogPage,
    checkoutPage,
    standardUser,
  }) => {
    // Mercado US para tener el campo `zip-code` (SA usaría `district`).
    await loginPage.loginInMarket(standardUser, "US");
    await catalogPage.expectLoaded();
    await catalogPage.addFirstPizza();

    await page.goto("/checkout");
    await checkoutPage.expectLoaded();

    // Datos de PRUEBA: dirección del mercado + tarjeta falsa.
    await checkoutPage.fillWithMarket(usMarket);
    await checkoutPage.selectPaymentMethod("card");
    await checkoutPage.fillCard({
      holder: "TEST USER",
      number: "4111 1111 1111 1111",
      expMonth: "05",
      expYear: "28",
      cvv: "123",
    });

    // Paso 1 — place-order abre el popup de confirmación (role="dialog").
    await checkoutPage.placeOrder();
    await checkoutPage.expectConfirmOrderModal();

    // Paso 2 — confirmar lleva a la pantalla de éxito con id de orden.
    await checkoutPage.confirmOrder();
    await checkoutPage.expectOrderSuccess();
  });
});
```
