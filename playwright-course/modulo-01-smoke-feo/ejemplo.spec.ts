// ============================================================
// M01 — Smoke "feo" contra OmniPizza live
// ============================================================
// Objetivo pedagógico: que duela.
//
// - Locators inline en cada test.
// - Login duplicado.
// - Mercado hardcoded.
// - No hay POM, ni fixtures, ni data-driven.
//
// En M02 parametrizaremos. En M03 refactorizaremos a POM.
// ============================================================

import { test, expect } from "@playwright/test";

// Credenciales leídas de .env (M01 ya enseña secrets desde día 1).
const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke OmniPizza — versión fea (M01)", () => {
  // beforeAll de warmup: OmniPizza vive en Render free tier y el
  // primer request del día tarda 30-40s (cold start). En M04
  // reemplazaremos esto por un `auth.setup.ts` project.
  test.beforeAll(async ({ request }) => {
    await request.get(`${process.env.API_URL}/health`).catch(() => {
      // Si /health no responde aún, el primer navigate lo despertará igual.
    });
  });

  test("TC-001 — login exitoso con usuario válido @smoke", async ({ page }) => {
    // Paso 1 — abrir la pantalla de login
    await page.goto("/");

    // Paso 2 — seleccionar mercado (MX)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar formulario
    await page.getByTestId("login-button-desktop").click();

    // Resultado esperado — aterrizar en el catálogo
    await expect(page).toHaveURL(/\/catalog/);
  });

  test("TC-002 — catálogo muestra al menos 1 pizza @smoke", async ({ page }) => {
    // Paso 1 — abrir login (OTRA VEZ)
    await page.goto("/");

    // Paso 2 — seleccionar mercado (DUPLICADO)
    await page.getByTestId("market-MX").click();

    // Paso 3 — llenar credenciales (DUPLICADO)
    await page.getByTestId("username-desktop").fill(USERNAME);
    await page.getByTestId("password-desktop").fill(PASSWORD);

    // Paso 4 — enviar (DUPLICADO)
    await page.getByTestId("login-button-desktop").click();

    // Paso 5 — esperar catálogo (DUPLICADO)
    await expect(page).toHaveURL(/\/catalog/);

    // Paso 6 — nuevo: verificar que hay pizzas
    const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
    await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    const count = await pizzaCards.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================================
// Nota para el alumno:
//
// Cuenta las líneas que se repiten entre TC-001 y TC-002:
//   - page.goto("/")
//   - getByTestId("market-MX").click()
//   - fill de username / password
//   - click de login-button
//   - expect URL /catalog
//
// Son ~6 líneas por test × N tests futuros.
// Esa es la duplicación que vas a matar en M03.
// ============================================================
