// ============================================================
// Mini-clase 4.1 — getByRole
// ============================================================
// El locator MÁS recomendado por Playwright. Se basa en el "role"
// accesible del elemento (button, link, heading, textbox, etc.).
// Si tu test usa getByRole, tu app es simultáneamente más accesible.
//
// Doc: https://playwright.dev/docs/locators#locate-by-role
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByRole en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('botón "Sign In" es visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /sign in/i })
    ).toBeVisible();
  });

  test('el botón "Sign In" es clickable y dispara el login', async ({ page }) => {
    // Llenamos con credenciales válidas y clickamos el botón localizado por role
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('hay 5 botones de quick-login (role=button)', async ({ page }) => {
    // Combinamos 2 condiciones sobre el MISMO elemento con .and():
    //   role=button AND data-testid empieza con "user-"
    const quickLoginButtons = page
      .getByRole('button')
      .and(page.locator('[data-testid^="user-"]'));
    // standard_user, locked_out_user, problem_user, performance_glitch_user, error_user
    await expect(quickLoginButtons).toHaveCount(5);
  });

  test('el botón de toggle password existe por role', async ({ page }) => {
    // El toggle del password es un <button>
    const toggle = page.getByTestId('toggle-password');
    await expect(toggle).toBeVisible();
    // También se puede localizar genéricamente: todos los buttons del form
    const formButtons = page.locator('form button');
    expect(await formButtons.count()).toBeGreaterThanOrEqual(2);
  });

  // ─── Después del login, usamos getByRole para heading ──────────
  test('el heading "Menu" o similar aparece después del login', async ({ page }) => {
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);

    // En /catalog hay un heading con el nombre del menú.
    // Usamos un matcher flexible porque el texto varía con i18n.
    const anyHeading = page.getByRole('heading').first();
    await expect(anyHeading).toBeVisible();
  });
});

// ============================================================
// Roles más usados en Playwright:
//   button, link, heading, textbox, checkbox, radio, combobox,
//   option, dialog, alert, list, listitem, menu, menuitem, img, ...
//
// Opciones útiles:
//   { name: "texto" }    → por accessible name (exacto)
//   { name: /regex/i }   → por accessible name (regex, ignore case)
//   { exact: true }      → match exacto con "name"
//   { level: 2 }         → h2 cuando el role es "heading"
// ============================================================
