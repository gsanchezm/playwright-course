// ============================================================
// Checkout end-to-end
// ============================================================
// Solo corre con `pnpm test:seeded` (el project `chromium` lo ignora).
// Flujo: agregar una pizza, llenar el checkout y confirmar la orden.
// ============================================================

import { test, expect } from "../../fixtures/omnipizza";

test.describe("Checkout end-to-end", () => {
  test("places an order from the checkout form @regression", async ({
    page,
    catalogPage,
    checkoutPage,
    defaultMarket,
  }) => {
    // Sesión heredada del setup: vamos directo al catálogo.
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.addFirstPizza();

    // Checkout con los datos del mercado por defecto.
    await page.goto("/checkout");
    await checkoutPage.expectLoaded();
    await checkoutPage.fillWithMarket(defaultMarket);
    // El mercado MX exige colonia además de la dirección.
    await checkoutPage.fillColonia(defaultMarket.colonia ?? "Polanco");

    // Pago con tarjeta de PRUEBA (nunca datos reales).
    await checkoutPage.selectPaymentMethod("card");
    await checkoutPage.fillCard({
      holder: "TEST USER",
      number: "4111 1111 1111 1111",
      expMonth: "05",
      expYear: "28",
      cvv: "123",
    });

    // Enviar la orden.
    await page.getByRole("button", { name: "Place Order" }).click();

    // Confirmar en el diálogo y verificar la pantalla de éxito.
    await checkoutPage.expectConfirmOrderModal();
    await checkoutPage.confirmOrder();
    await checkoutPage.expectOrderSuccess();
  });
});
