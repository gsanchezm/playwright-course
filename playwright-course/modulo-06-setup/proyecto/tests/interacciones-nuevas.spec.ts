// ============================================================
// M06 — Interactuando con los widgets nuevos de OmniPizza (heredado de M05)
// ============================================================
// Mismos 8 escenarios de M05 (date picker, dropdowns, payment method,
// tooltips, modal, RTL, popups de confirmación). La diferencia: aquí el
// `page` YA llega autenticado por storageState (auth.setup.ts), así que
// la mayoría de los tests NO hacen login — navegan directo, como en
// ejemplo.spec.ts.
//
// La única excepción es el test de Arabia Saudita: RTL y precios en SAR
// dependen del market elegido AL LOGIN (no de los datos que llenes
// después), y la sesión heredada quedó autenticada en MX (el
// `defaultMarket` de auth.setup.ts). Ese describe RENUNCIA al badge con
// `test.use({ storageState: { cookies: [], origins: [] } })` — el mismo
// patrón que ya usaste en el reto de locked_out_user — y hace su propio
// login como SA.
//
// ▶ Correr sólo este spec:
//   pnpm exec playwright test tests/interacciones-nuevas.spec.ts --headed --project=chromium
// ============================================================

import { test, expect } from "../fixtures/omnipizza";
import type { CatalogPage, CheckoutPage } from "../pages";
import type { Market } from "../types";
import type { Page } from "@playwright/test";
import marketsJson from "../data/markets.json";

// Mercado US para el flujo de checkout completo (usa `zip-code`, no
// `colonia` ni `district`). El `defaultMarket` heredado es MX, cuyo
// checkout SÍ exige `colonia` — un campo que `fillWithMarket()` no
// llena — así que ese market NO sirve para este flujo end-to-end.
const usMarket = (marketsJson as Market[]).find((m) => m.code === "US")!;

// Helper de setup: agrega una pizza + abre el checkout ya poblado (el
// checkout vacío muestra `start-order-btn`, no el form). A diferencia de
// M05, no hay paso de login aquí: el `page` ya llega autenticado.
async function openCheckoutWithItem(
  page: Page,
  catalogPage: CatalogPage,
  checkoutPage: CheckoutPage,
): Promise<void> {
  await page.goto("/catalog");
  await catalogPage.expectLoaded();
  await catalogPage.addFirstPizza();
  await page.goto("/checkout");
  await checkoutPage.expectLoaded();
}

// ============================================================
// 1) Date picker NATIVO — <input type="date">
// ============================================================
// Regla de oro: NO se clickea el calendario emergente (es UI del
// navegador, fuera del DOM). Un input date se llena con .fill() en
// formato ISO "YYYY-MM-DD" y su value SIEMPRE se lee en ISO.
// ============================================================
test.describe("Date picker nativo del perfil (M06)", () => {
  test("fill('YYYY-MM-DD') fija el cumpleaños sin tocar el calendario @regression", async ({
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
// 2) Dropdown NATIVO de la tarjeta — <select> → selectOption
// ============================================================
// La expiración son DOS <select> nativos (mes/año). No se escriben
// ni se clickea la lista: se accionan con .selectOption(value).
// ============================================================
test.describe("Dropdowns de la tarjeta de crédito (M06)", () => {
  test("selectOption elige mes/año de expiración en los <select> nativos @regression", async ({
    page,
    catalogPage,
    checkoutPage,
  }) => {
    await openCheckoutWithItem(page, catalogPage, checkoutPage);

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
test.describe("Método de pago (radio group) (M06)", () => {
  test("cambiar de método muestra/oculta los campos de tarjeta @regression", async ({
    page,
    catalogPage,
    checkoutPage,
  }) => {
    await openCheckoutWithItem(page, catalogPage, checkoutPage);

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
test.describe("Tooltip custom de la propina (M06)", () => {
  test("hover sobre ℹ️ hace visible el tooltip @regression", async ({
    page,
    catalogPage,
    checkoutPage,
  }) => {
    await openCheckoutWithItem(page, catalogPage, checkoutPage);

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
test.describe("Tooltip nativo del teléfono (M06)", () => {
  test("el title se verifica leyendo el atributo, no por hover @regression", async ({
    page,
    catalogPage,
    checkoutPage,
  }) => {
    await openCheckoutWithItem(page, catalogPage, checkoutPage);

    const title = await checkoutPage.getPhoneTitle();
    expect(title).toContain("7-15");
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
test.describe("Modal 'Customize Pizza' (M06)", () => {
  test("abrir → elegir size + topping → confirmar suma al carrito @regression", async ({
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
test.describe("Mercado Arabia Saudita / RTL (M06)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("SA renderiza la app en RTL y precios en SAR @regression", async ({
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
test.describe("Popups de confirmación de orden (M06)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("place-order → modal de confirmación → /order-success @regression", async ({
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
