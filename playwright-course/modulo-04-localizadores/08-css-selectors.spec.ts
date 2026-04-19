// ============================================================
// Mini-clase 4.8 — Selectores CSS (page.locator)
// ============================================================
// Cuando los locators semánticos (Role/Label/TestId) no bastan,
// puedes caer al selector CSS crudo con page.locator('...').
//
// Doc: https://playwright.dev/docs/locators#matching-by-element
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('CSS selectors en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('por tag — contar todos los <button> visibles en login', async ({ page }) => {
    const buttons = page.locator('button').filter({ visible: true });
    // Hay varios: 4 banderas + 5 quick-login + toggle password + Sign In + ...
    expect(await buttons.count()).toBeGreaterThan(5);
  });

  test('por atributo exacto — input[type="password"]', async ({ page }) => {
    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toBeVisible();
    await passwordField.fill('pizza123');
    await expect(passwordField).toHaveValue('pizza123');
  });

  test('starts-with — todos los testids de mercado', async ({ page }) => {
    const marketButtons = page.locator('[data-testid^="market-"]');
    await expect(marketButtons).toHaveCount(4);
  });

  test('ends-with — todos los testids que terminan en "-desktop"', async ({ page }) => {
    const desktopElements = page.locator('[data-testid$="-desktop"]');
    // Al menos username, password y login-button en la pantalla de login
    expect(await desktopElements.count()).toBeGreaterThanOrEqual(3);
  });

  test('contains — testids que contienen "user-"', async ({ page }) => {
    const userButtons = page.locator('[data-testid*="user-"]');
    // Los 5 botones de quick-login
    await expect(userButtons).toHaveCount(5);
  });

  test('combinador descendiente — un button dentro del form', async ({ page }) => {
    const formButtons = page.locator('form button');
    expect(await formButtons.count()).toBeGreaterThanOrEqual(2);
  });

  test('pseudo-clase — :visible', async ({ page }) => {
    const visibleInputs = page.locator('input:visible');
    // Username + password
    expect(await visibleInputs.count()).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// ⚠️ Cuándo evitar CSS:
//   - No uses selectores frágiles tipo `.text-white.mt-4.btn-primary`.
//     Esas clases Tailwind cambian con refactors y rompen los tests.
//   - Prefiere getByRole, getByLabel, getByTestId SIEMPRE que puedas.
//
// ✅ Cuándo CSS sí tiene sentido:
//   - Selectores por atributo estable (data-*, type, id).
//   - Combinadores estructurales (form button, header a).
//   - Filtrar por pseudo-clase (:visible, :disabled).
// ============================================================
