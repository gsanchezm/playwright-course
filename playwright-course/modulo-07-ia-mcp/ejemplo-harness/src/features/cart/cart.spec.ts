// ============================================================
// features/cart/cart.spec.ts — pruebas de la slice del carrito
// ============================================================
// Demuestra la slice UI-only más simple del harness:
//  1) agregar una pizza y verificar que el carrito muestra >=1 item;
//  2) avanzar del carrito al checkout y aterrizar en /checkout.
// Todo con assertions web-first; sin waitForTimeout.
//
// Precondición común: ninguna prueba trae sesión por defecto, así que
// cada test hace login (vía authFlow) para llegar a /catalog antes de
// agregar al carrito.
// ============================================================

import { test, expect } from "../../shared/fixtures";

test.describe("cart", () => {
  test("@smoke agregar una pizza muestra >=1 item en el carrito", async ({
    authFlow,
    cartFlow,
    cartPage,
    standardUser,
    defaultMarket,
  }) => {
    // Precondición: login por UI → aterriza en /catalog.
    await authFlow.loginAs(standardUser, defaultMarket.code);

    // El flow agrega la primera pizza y abre el carrito.
    await cartFlow.addPizzaAndOpenCart();

    // Web-first: el carrito debe mostrar al menos un item.
    await cartPage.expectHasItems();
    expect(await cartPage.getItemCount()).toBeGreaterThanOrEqual(1);
  });

  test("del carrito al checkout aterriza en /checkout", async ({
    page,
    authFlow,
    cartFlow,
    standardUser,
    defaultMarket,
  }) => {
    // Precondición: login + pizza en el carrito.
    await authFlow.loginAs(standardUser, defaultMarket.code);
    await cartFlow.addPizzaAndOpenCart();

    // Avanzamos al checkout desde el carrito.
    await cartFlow.proceedToCheckout();

    // Web-first: debemos aterrizar en la pantalla de checkout.
    await expect(page).toHaveURL(/\/checkout/);
  });
});
