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
import type { CountryCode } from "../../shared/types";
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
  test("arma el payload de MX con country_code MX y colonia seteada", () => {
    const payload = new OrderBuilder()
      .forMarket("MX")
      .addItem("pizza-1", 2)
      .withTip(20)
      .build();

    // País correcto y campo de dirección específico de MX presente.
    const expectedCode: CountryCode = "MX";
    expect(payload.country_code).toBe(expectedCode);
    expect(payload.colonia).toBe("Polanco");
    expect(payload.propina).toBe(20);

    // Campos base poblados desde el perfil del mercado.
    expect(payload.name).toBe("Juan Pérez");
    expect(payload.phone).toBe("+52 55 1234 5678");
    expect(payload.address).toBe("Avenida Reforma 123");

    // Items en la forma del contrato (pizza_id + quantity).
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0]).toEqual({ pizza_id: "pizza-1", quantity: 2 });

    // No se filtran campos de otros mercados.
    expect(payload.zip_code).toBeUndefined();
    expect(payload.plz).toBeUndefined();
    expect(payload.prefectura).toBeUndefined();
  });
});
