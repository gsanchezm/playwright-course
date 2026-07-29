// ============================================================
// 🧩 Interactuando con los widgets NUEVOS de OmniPizza (3/3)
// ============================================================
// Items 7-8 del catálogo completo (ver el header de
// tests/widgets/profile-and-catalog.spec.ts para la lista de los 8 y
// por qué están repartidos en 3 archivos). Ninguno de los dos usa un
// `beforeEach`: cada uno necesita un market elegido AL LOGIN (SA / US)
// distinto de `defaultMarket` (MX), así que no comparten precondición
// entre sí ni con los otros grupos de este módulo.
// ============================================================

import { test, expect } from "../../fixtures/omnipizza";
import type { Market } from "../../types";
import marketsJson from "../../data/markets.json";

// Mercado US para el flujo de checkout (usa `zip-code`, no `district`).
const usMarket = (marketsJson as Market[]).find((m) => m.code === "US")!;

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
