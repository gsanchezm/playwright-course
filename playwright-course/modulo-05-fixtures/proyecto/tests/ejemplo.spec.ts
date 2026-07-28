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
// Nota de orden: el ítem 6 (Modal) aparece pegado al 1 en este archivo, no en
// su posición numérica — ambos comparten precondición (login+catálogo) bajo
// un solo `beforeEach`. M06/M07/M08 mantienen el orden estricto 1→8.
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
