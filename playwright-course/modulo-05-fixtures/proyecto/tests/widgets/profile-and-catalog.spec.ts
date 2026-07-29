// ============================================================
// 🧩 Interactuando con los widgets NUEVOS de OmniPizza (1/3)
// ============================================================
// Antes vivían todos juntos en tests/ejemplo.spec.ts (y, más atrás, en
// tests/interacciones-nuevas.spec.ts) — ahora están repartidos en 3
// archivos bajo tests/widgets/, uno por funcionalidad, para no mezclar
// los 8 escenarios con lo propio de M05 (fixtures/mocking) en un solo
// archivo.
//
// La plataforma sumó controles que valen oro para enseñar, porque cada
// uno se automatiza con una técnica DISTINTA de Playwright:
//
//   1. Date picker nativo (perfil)      → fill("YYYY-MM-DD")            [aquí]
//   2. Dropdown de tarjeta (checkout)   → selectOption(value)            → checkout-controls.spec.ts
//   3. Método de pago (radio group)     → click + estado                 → checkout-controls.spec.ts
//   4. Tooltip CUSTOM (propina)         → hover + toBeVisible            → checkout-controls.spec.ts
//   5. Tooltip NATIVO (teléfono)        → getAttribute("title")          → checkout-controls.spec.ts
//   6. Modal / popup (Customize Pizza)  → abrir → interactuar → confirmar [aquí]
//   7. Mercado Arabia Saudita (RTL)     → locators multi-idioma / dir=rtl → market-and-order-flow.spec.ts
//   8. Confirmación de orden            → 2 popups encadenados → /order-success → market-and-order-flow.spec.ts
//
// Nota de orden: el ítem 6 (Modal) vive junto al 1 en ESTE archivo, no en
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

import { test, expect } from "../../fixtures/omnipizza";

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
