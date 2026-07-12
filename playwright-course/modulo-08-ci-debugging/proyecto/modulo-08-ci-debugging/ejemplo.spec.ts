// ============================================================
// M08 — Tests de demostración para el pipeline de CI
// ============================================================
// Estos tests existen para que el pipeline tenga material real
// con el que demostrar traces, reports y shards.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("M08 — smoke canary @smoke", () => {
  test("home → catalog stays operational", async ({ page, catalogPage }) => {
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });
});

test.describe("M08 — regression multi-category @regression", () => {
  const categories = ["popular", "veggie", "meat"] as const;

  for (const category of categories) {
    test(`category ${category} loads and shows pizzas`, async ({ page, catalogPage }) => {
      await page.goto("/catalog");
      await catalogPage.waitForCatalog();
      await catalogPage.selectCategory(category);
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("M08 — trace on failure demo", () => {
  test("this test fails intentionally to demonstrate trace @debug", async ({ page }) => {
    test.skip(!process.env.DEMO_FAIL, "Enable with DEMO_FAIL=1 to see the trace");
    await page.goto("/");
    // Falla intencional — la traza tendrá el screenshot exacto.
    await expect(page.locator("#this-does-not-exist")).toBeVisible({ timeout: 2_000 });
  });
});
