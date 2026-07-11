// ============================================================
// M06 — Arranca YA autenticado gracias al setup project
// ============================================================
// Este spec corre en el project `chromium`, que declara
// `dependencies: ['setup']` + `storageState: '.auth/user.json'`.
// Antes de ejecutarlo, Playwright corre `tests/setup/auth.setup.ts`
// (login por UI → guarda el badge) y este test HEREDA la sesión.
//
// Fíjate en lo que NO hay: ni goto('/'), ni selección de mercado,
// ni fill de credenciales, ni click en "Sign In". El badge ya trajo
// todo eso. Vamos DIRECTO al catálogo.
// ============================================================

import { test, expect } from "@playwright/test";

test.describe("Setup & auth — sesión heredada (M06)", () => {
  test("aterriza en /catalog sin hacer login @smoke", async ({ page }) => {
    // ⚠️ No hay paso de login. El storageState ya trajo la sesión.
    await page.goto("/catalog");

    // Señal de sesión abierta: seguimos en /catalog (no nos rebotó a "/")
    // y el catálogo muestra al menos una pizza.
    await expect(page).toHaveURL(/\/catalog/);
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  });
});
