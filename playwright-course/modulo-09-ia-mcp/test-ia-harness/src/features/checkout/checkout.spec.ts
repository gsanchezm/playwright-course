// ============================================================
// features/checkout/checkout.spec.ts — pruebas de la slice de checkout
// ============================================================
// Demuestra dos niveles:
//   1) UI @regression — el checkout carga y es accionable para el
//      mercado por defecto (web-first, sin sleeps).
//   2) Unit-style del OrderBuilder — verifica la FORMA del payload
//      (no toca red ni browser): country_code MX y campo colonia seteado.
// ============================================================

import { test, expect } from "../../shared/fixtures";
import { OrderBuilder } from "./checkout.builder";

test.describe("checkout (UI)", () => {
  test(
    "el checkout carga y el botón de enviar pedido es accionable @regression",
    async ({ authFlow, cartFlow, checkoutPage, standardUser, defaultMarket }) => {
      // Precondición: sesión iniciada en el mercado por defecto (aterriza en /catalog).
      await authFlow.loginAs(standardUser, defaultMarket.code);

      // Precondición: carrito con un item, luego avanzar al checkout.
      await cartFlow.addPizzaAndOpenCart();
      await cartFlow.proceedToCheckout();

      // Acción: llenar los datos de envío del mercado.
      await checkoutPage.fillWithMarket(defaultMarket);

      // Verificación web-first: el botón de enviar pedido es accionable.
      await checkoutPage.expectLoaded();
    },
  );
});

test.describe("OrderBuilder (unit)", () => {
  test("arma el payload de MX con la forma exacta del contrato", () => {
    const payload = new OrderBuilder()
      .forMarket("MX")
      .addItem("pizza-1", 2)
      .withTip(20)
      .build();

    // Una sola aserción de objeto (regla del harness: 1 assertion por test).
    // toEqual verifica de un golpe la forma COMPLETA del payload MX —datos base
    // del mercado, colonia y propina— y, al exigir igualdad exacta, garantiza
    // que NO se filtran campos de otros mercados (zip_code/plz/prefectura): un
    // campo de sobra haria fallar la prueba.
    expect(payload).toEqual({
      country_code: "MX",
      items: [{ pizza_id: "pizza-1", quantity: 2 }],
      name: "Juan Pérez",
      address: "Avenida Reforma 123",
      phone: "+52 55 1234 5678",
      colonia: "Polanco",
      propina: 20,
    });
  });
});
