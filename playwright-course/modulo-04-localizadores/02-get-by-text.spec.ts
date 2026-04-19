// ============================================================
// Mini-clase 4.2 — getByText
// ============================================================
// Localiza un elemento por su contenido textual (o un substring).
// Útil para encabezados, párrafos, textos sueltos. Para botones y
// links es mejor getByRole (por accesibilidad).
//
// Doc: https://playwright.dev/docs/locators#locate-by-text
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByText en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('match substring (default) — "Welcome back"', async ({ page }) => {
    // getByText hace substring por default
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('match exacto — texto completo', async ({ page }) => {
    await expect(
      page.getByText('Welcome back!', { exact: true })
    ).toBeVisible();
  });

  test('match con regex — "Art of Pizza"', async ({ page }) => {
    // Regex permite case-insensitive y patrones flexibles
    await expect(page.getByText(/art of pizza/i)).toBeVisible();
  });

  test('texto "Quick Login" está en la sección de usuarios de prueba', async ({ page }) => {
    await expect(page.getByText('Quick Login')).toBeVisible();
  });

  test('texto del subtítulo del login', async ({ page }) => {
    await expect(
      page.getByText('Please enter your details.')
    ).toBeVisible();
  });

  test('texto del tagline — "Crafting moments"', async ({ page }) => {
    // Texto más largo de la pantalla, ideal para regex case-insensitive
    await expect(page.getByText(/crafting moments/i)).toBeVisible();
  });

  // ─── Catálogo (después de login) ───────────────────────────────
  test('después del login hay texto con nombre del catálogo', async ({ page }) => {
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);

    // Match con regex: "Menu" aparece en el header del catálogo
    await expect(page.getByText(/menu/i).first()).toBeVisible();
  });
});

// ============================================================
// Reglas de getByText:
//   - Por default, es SUBSTRING + trim + collapse whitespace.
//   - { exact: true }  → match de cadena completa.
//   - /regex/          → patrones flexibles.
//   - NO uses getByText para elementos accionables (botones, links).
//     Usa getByRole. getByText es para texto puro.
// ============================================================
