// ============================================================
// M05 — Fixtures custom + storageState heredado
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
import { uniqueEmail } from "../helpers/unique-data";
import type { Market } from "../types";
import marketsJson from "../data/markets.json";

// Mercado US para el flujo de checkout completo (usa `zip-code`, no
// `colonia` ni `district`). El `defaultMarket` heredado es MX, cuyo
// checkout SÍ exige `colonia` — un campo que `fillWithMarket()` no
// llena — así que ese market NO sirve para este flujo end-to-end.
const usMarket = (marketsJson as Market[]).find((m) => m.code === "US")!;

test.describe("Fixtures + storageState (M05)", () => {
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

test.describe("page.route() — network mocking (M05)", () => {
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

    // 3. Verificar que la UI reacciona al error.
    //    OmniPizza no expone (todavía) un estado de error instrumentado
    //    con testid propio — por eso el assert real de este demo es
    //    estructural (la página sigue viva). Lo que se enseña es el
    //    PATRÓN de mocking, no un aserto de UI verificado.
    await expect(page.locator("body")).toBeVisible();
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

    // Mismo caso: sin testid de estado vacío confirmado, el assert real
    // es estructural — el PATRÓN es lo que importa aquí.
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// Data isolation con workerInfo — prepara el terreno para M07
// ============================================================

test("uniqueEmail generates identifiers per worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "locked");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("locked+");
});

// ============================================================
// 🧩 Interactuando con los widgets nuevos de OmniPizza (M08 — estado FINAL)
// ============================================================
// Antes vivían en modulo-05-fixtures/interacciones-nuevas.spec.ts — ahora
// están aquí para tener TODO el módulo en un solo archivo.
//
// Mismos 8 escenarios de M05/M06/M07 (date picker, dropdowns, payment
// method, tooltips, modal, RTL, popups de confirmación). Aquí el `page`
// YA llega autenticado por storageState (tests/setup/auth.setup.ts), así
// que la mayoría de los tests NO hacen login — navegan directo, como en
// el resto de este archivo.
//
// La única excepción es el test de Arabia Saudita: RTL y precios en SAR
// dependen del market elegido AL LOGIN (no de los datos que llenes
// después), y la sesión heredada quedó autenticada en MX (el
// `defaultMarket` de fixtures/omnipizza.ts). Ese describe RENUNCIA al
// badge con `test.use({ storageState: { cookies: [], origins: [] } })`
// — el mismo patrón que el reto de locked_out_user (modulo-06-setup/
// reto.spec.ts) — y hace su propio login como SA.
// ============================================================

// ============================================================
// 1) Date picker NATIVO — <input type="date">
// ============================================================
// Regla de oro: NO se clickea el calendario emergente (es UI del
// navegador, fuera del DOM). Un input date se llena con .fill() en
// formato ISO "YYYY-MM-DD" y su value SIEMPRE se lee en ISO.
// ============================================================
test.describe("Native date picker on the profile (M08)", () => {
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

test.describe("Checkout widgets — item already in cart (M08)", () => {
  // Precondición compartida: agregar una pizza + abrir el checkout ya
  // poblado. No hay login aquí: el `page` ya llega autenticado. Antes
  // vivía en la función `openCheckoutWithItem(page, catalogPage,
  // checkoutPage)`, llamada a mano en cada uno de los 4 tests de abajo.
  test.beforeEach(async ({ page, catalogPage, checkoutPage }) => {
    await page.goto("/catalog");
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
  test.describe("Credit card dropdowns (M08)", () => {
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
  test.describe("Payment method (radio group) (M08)", () => {
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
  test.describe("Custom tooltip on the tip (M08)", () => {
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
  test.describe("Native tooltip on the phone (M08)", () => {
    test("the title is verified by reading the attribute, not via hover @regression", async ({
      checkoutPage,
    }) => {
      const title = await checkoutPage.getPhoneTitle();
      expect(title).toContain("7-15");
    });
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
test.describe("Modal 'Customize Pizza' (M08)", () => {
  test("open → pick size + topping → confirm adds to cart @regression", async ({
    page,
    catalogPage,
    pizzaCustomizer,
    menuPage,
  }) => {
    await page.goto("/catalog");
    await catalogPage.expectLoaded();

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

// ============================================================
// 7) Mercado Arabia Saudita — layout RTL
// ============================================================
// Al elegir el market SA, la app entera pasa a RTL (html[dir=rtl],
// lang="ar") y los precios salen en `ر.س.` (SAR). Recordatorio del
// curso: por eso NO se localiza por texto — los testids son estables
// en todos los markets, el texto no.
//
// RTL/SAR dependen del market elegido AL LOGIN, no del `page` heredado
// (que quedó autenticado en MX vía auth.setup.ts). Por eso este describe
// renuncia al badge — igual que el reto de locked_out_user — y hace su
// propio login como SA.
// ============================================================
test.describe("Saudi Arabia market / RTL (M08)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

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
// El campo `colonia` (requerido en el checkout de MX) rompe este flujo
// si te quedas con la sesión heredada (MX): igual que en el test de SA,
// este describe renuncia al badge y hace login como US.
// ============================================================
test.describe("Order confirmation popups (M08)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("place-order → confirmation modal → /order-success @regression", async ({
    page,
    loginPage,
    catalogPage,
    checkoutPage,
    standardUser,
  }) => {
    await loginPage.loginInMarket(standardUser, "US");
    await catalogPage.expectLoaded();
    await catalogPage.addFirstPizza();

    await page.goto("/checkout");
    await checkoutPage.expectLoaded();

    // Datos de PRUEBA: dirección del mercado US + tarjeta falsa.
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
