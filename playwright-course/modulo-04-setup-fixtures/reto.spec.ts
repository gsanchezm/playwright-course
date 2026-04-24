// ============================================================
// M04 — Reto: crear un admin.setup.ts + project ui-admin
// ============================================================
// Objetivo:
//   1. Crear `tests/setup/admin.setup.ts` que haga login con
//      admin_user y persista en .auth/admin.json.
//   2. En playwright.config.ts añadir un project `ui-admin-chromium`
//      con:
//        - dependencies: ['setup']
//        - use: { storageState: '.auth/admin.json' }
//   3. Validar que el admin ve funcionalidades extra.
//
// (Esto prepara el terreno para fixtures diferenciadas por rol.)
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("Reto M04 — admin setup", () => {
  test.skip("TODO — implementar admin.setup.ts y correr con project ui-admin-chromium", async () => {
    // TODO — seguir las instrucciones en el header del archivo.
    expect(true).toBe(true);
  });

  test("mock: respuesta lenta del backend no rompe el test @regression", async ({ page }) => {
    // Reto práctico: usando page.route(), simula una respuesta
    // que tarda 3 segundos en responder, y valida que el skeleton
    // loader aparece durante ese tiempo.
    await page.route("**/api/pizzas*", async (route) => {
      await new Promise((r) => setTimeout(r, 3_000));
      await route.continue();
    });

    await page.goto("/catalog");
    // TODO — validar que el skeleton aparece mientras carga
    await expect(page.locator("body")).toBeVisible();
  });
});
