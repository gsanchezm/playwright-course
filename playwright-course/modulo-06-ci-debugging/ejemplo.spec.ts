// ============================================================
// M06 — Tests de demostración para el pipeline de CI
// ============================================================
// Estos tests existen para que el pipeline tenga material real
// con el que demostrar traces, reports y shards.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("M06 — smoke canary @smoke", () => {
  test("home → catalog se mantiene operativo", async ({ page, catalogPage }) => {
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });
});

test.describe("M06 — regression multi-categoría @regression", () => {
  const categories = ["popular", "veggie", "meat"] as const;

  for (const category of categories) {
    test(`categoría ${category} carga y muestra pizzas`, async ({ page, catalogPage }) => {
      await page.goto("/catalog");
      await catalogPage.waitForCatalog();
      await catalogPage.selectCategory(category);
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("M06 — trace on failure demo", () => {
  test("este test falla intencionalmente para demostrar trace @debug", async ({ page }) => {
    test.skip(!process.env.DEMO_FAIL, "Habilita con DEMO_FAIL=1 para ver el trace");
    await page.goto("/");
    // Falla intencional — la traza tendrá el screenshot exacto.
    await expect(page.locator("#this-does-not-exist")).toBeVisible({ timeout: 2_000 });
  });
});
