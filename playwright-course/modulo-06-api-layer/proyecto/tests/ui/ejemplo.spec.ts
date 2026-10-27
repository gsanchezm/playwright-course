// ============================================================
// M06 — Flujo de UI: login → pizzas → crear orden (sin badge)
// ============================================================
// En M06 NO hay `tests/setup/`, ni `.auth/`, ni `storageState`: el test
// inicia sesión POR UI usando la fixture `loginPage` (el mismo mecanismo
// de M05). El `page` llega vacío y el test hace su propio login.
//
// 🔀 Comparativa lado a lado con la capa de API
// (`tests/ejemplo.spec.ts`, project `api`): los MISMOS tres pasos,
// por dos caminos distintos.
//
//   Paso          UI (este archivo)                API (tests/ejemplo.spec.ts)
//   1. Login      loginPage.loginInMarket(...)     AuthService.login(user)
//   2. Pizzas     catalogPage.expectHasPizzas()    PizzaService.list()
//   3. Orden      checkoutPage → confirmOrder()    OrderService.createOrder(...)
//
// Misma intención, distinta capa: la UI recorre el navegador; la API
// habla directo con el backend (más rápida, sin selectores).
// ============================================================

import { test } from "../../fixtures/omnipizza";
import type { Market } from "../../types";
import marketsJson from "../../data/markets.json";

// Mercado US: su formulario usa `zip-code` (mismo mercado que usa la API).
const usMarket = (marketsJson as Market[]).find((m) => m.code === "US")!;

test.describe("Flujo UI — login → pizzas → orden (M06)", () => {
  test("logs in by fixture, sees pizzas and places an order @smoke", async ({
    page,
    loginPage,
    catalogPage,
    checkoutPage,
    standardUser,
  }) => {
    // Paso 1 — Login por UI (sin badge): el fixture entrega el LoginPage.
    await loginPage.loginInMarket(standardUser, usMarket.code);

    // Paso 2 — Pizzas: el catálogo cargó y hay al menos una.
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();

    // Paso 3 — Orden: agregar la 1ª pizza y completar el checkout.
    await catalogPage.addFirstPizza();
    await page.goto("/checkout");
    await checkoutPage.expectLoaded();
    await checkoutPage.fillWithMarket(usMarket);
    await checkoutPage.selectPaymentMethod("card");
    await checkoutPage.fillCard({
      holder: "TEST USER",
      number: "4111 1111 1111 1111",
      expMonth: "05",
      expYear: "28",
      cvv: "123",
    });
    await checkoutPage.placeOrder();
    await checkoutPage.expectConfirmOrderModal();
    await checkoutPage.confirmOrder();
    await checkoutPage.expectOrderSuccess();
  });
});
