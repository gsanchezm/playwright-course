// ============================================================
// 🧩 Interactuando con los widgets NUEVOS de OmniPizza (2/3)
// ============================================================
// Items 2-5 del catálogo completo (ver el header de
// tests/widgets/profile-and-catalog.spec.ts para la lista de los 8 y
// por qué están repartidos en 3 archivos). Comparten precondición
// (login + agregar pizza + abrir el checkout ya poblado — el checkout
// vacío muestra `start-order-btn`, no el form) bajo un solo
// `beforeEach`. Antes vivía en la función `openCheckoutWithItem(page,
// loginPage, catalogPage, checkoutPage, user, market)`, llamada a mano
// reenviando 6 parámetros en cada uno de los 4 tests de abajo.
// ============================================================

import { test, expect } from "../../fixtures/omnipizza";

test.describe("Checkout widgets — item already in cart (M05)", () => {
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
