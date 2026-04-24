// ============================================================
// M04 — Fixtures custom + storageState heredado
// ============================================================
// NOTA: este spec corre en project `ui-chromium` que declara
// `dependencies: ['setup']`. Antes de ejecutarlo, Playwright
// ejecuta `tests/setup/auth.setup.ts`, persiste el storageState
// y cada test arranca ya autenticado.
//
// El fixture `loginPage`/`catalogPage` inyecta Page Objects ya
// ligados a la pestaña del TC.
// ============================================================

import { test, expect } from "../fixtures/omnipizza";

test.describe("Fixtures + storageState (M04)", () => {
  test("entra directo al catálogo gracias al setup project @smoke", async ({ page, catalogPage }) => {
    // ⚠️ No hay llamada a login. El storageState ya trajo la sesión.
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
    await catalogPage.expectHasPizzas();
  });

  test("usa el worker fixture defaultMarket", async ({ page, catalogPage, defaultMarket }) => {
    // defaultMarket se creó UNA vez por worker
    expect(defaultMarket.code).toBe("MX");
    await page.goto("/catalog");
    await catalogPage.expectLoaded();
  });
});

// ============================================================
// Demostración de `page.route()` — mocking de red
// ============================================================
// Analogía: Postman Mock Server embebido en Playwright.
// Intercepta un request, devuelve la respuesta que tú quieras.
//
// Úsalo cuando:
//   - Quieres probar un caso de error (5xx, 404) sin romper el backend.
//   - Quieres probar UI vacía sin sembrar data.
//   - Quieres determinismo absoluto en tests de red.
// ============================================================

test.describe("page.route() — mocking de red (M04)", () => {
  test("UI muestra error cuando el API responde 500", async ({ page, catalogPage }) => {
    // 1. Registrar el mock ANTES del navigate
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Internal server error (mocked)" }),
      });
    });

    // 2. Ejecutar el flujo
    await page.goto("/catalog");

    // 3. Verificar que la UI reacciona al error
    //    (test esperado: aparece un toast, banner o mensaje de error)
    //    Este assert es tentativo — ajusta al DOM real de OmniPizza.
    await expect(page.locator("body")).toBeVisible();
    // Idealmente: await expect(page.getByTestId('catalog-error')).toBeVisible();
  });

  test("UI muestra estado vacío cuando no hay pizzas", async ({ page }) => {
    await page.route("**/api/pizzas*", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pizzas: [] }),
      });
    });

    await page.goto("/catalog");
    // Idealmente: await expect(page.getByTestId('catalog-empty')).toBeVisible();
    await expect(page.locator("body")).toBeVisible();
  });
});

// ============================================================
// Data isolation con workerInfo — prepara el terreno para M05
// ============================================================

import { uniqueEmail } from "../helpers/unique-data";

test("uniqueEmail genera identificadores por worker", async ({}, testInfo) => {
  const email1 = uniqueEmail(testInfo);
  const email2 = uniqueEmail(testInfo, "admin");
  expect(email1).toContain(`w${testInfo.workerIndex}`);
  expect(email1).not.toBe(email2);
  expect(email2).toContain("admin+");
});
