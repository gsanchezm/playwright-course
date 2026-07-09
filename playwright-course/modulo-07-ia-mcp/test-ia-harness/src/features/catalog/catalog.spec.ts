// ============================================================
// features/catalog/catalog.spec.ts — tests de UI del catálogo
// ============================================================
// Analogía QA: el "guion de pruebas" del catálogo. Usa las fixtures
// inyectadas (DI) — nunca hace `new` de Pages ni Flows. Antes de ver
// el catálogo hay que estar autenticado, así que cada test siembra la
// sesión con authFlow y luego ejerce el catálogo.
//
// Locators web-first, sin sleeps: las esperas viven en el Page Object.
// ============================================================

import { test, expect } from "../../shared/fixtures";

test.describe("Catálogo de pizzas", () => {
  // Antes de cada test: login en el mercado por defecto para aterrizar
  // en /catalog con una sesión válida.
  test.beforeEach(async ({ authFlow, standardUser, defaultMarket }) => {
    await authFlow.loginAs(standardUser, defaultMarket.code);
  });

  test(
    "abre el catálogo y muestra pizzas @smoke",
    async ({ catalogPage }) => {
      await catalogPage.goto();
      await catalogPage.waitForCatalog();

      await catalogPage.expectLoaded();
      await catalogPage.expectHasPizzas();
    },
  );

  test(
    "filtra por categoría y sigue mostrando pizzas",
    async ({ catalogPage }) => {
      await catalogPage.goto();
      await catalogPage.waitForCatalog();

      // Filtra por una categoría concreta del catálogo.
      await catalogPage.selectCategory("veggie");

      // Tras filtrar, debe quedar al menos una pizza visible.
      const count = await catalogPage.getPizzaCount();
      expect(count).toBeGreaterThan(0);
    },
  );
});
