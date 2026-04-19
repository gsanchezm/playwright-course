// ============================================================
// Mini-clase 4.6 — getByTitle
// ============================================================
// Localiza un elemento por su atributo "title" (el tooltip que
// aparece al hacer hover).
//
// Doc: https://playwright.dev/docs/locators#locate-by-title
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByTitle en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('las 4 banderas de mercado tienen title="Select XX"', async ({ page }) => {
    await expect(page.getByTitle('Select MX')).toBeVisible();
    await expect(page.getByTitle('Select US')).toBeVisible();
    await expect(page.getByTitle('Select CH')).toBeVisible();
    await expect(page.getByTitle('Select JP')).toBeVisible();
  });

  test('cambiar de mercado haciendo click en la bandera de MX', async ({ page }) => {
    await page.getByTitle('Select MX').click();
    // Después del click, el botón "Sign In" sigue siendo visible — la selección
    // de mercado no cambia de pantalla, solo actualiza el estado del store.
    await expect(page.getByTestId('login-button-desktop')).toBeVisible();
  });

  test('los botones de quick-login tienen title = username', async ({ page }) => {
    // Cada botón user-<username> tiene title con el nombre del usuario
    await expect(page.getByTitle('standard_user')).toBeVisible();
    await expect(page.getByTitle('locked_out_user')).toBeVisible();
    await expect(page.getByTitle('problem_user')).toBeVisible();
    await expect(page.getByTitle('performance_glitch_user')).toBeVisible();
    await expect(page.getByTitle('error_user')).toBeVisible();
  });

  test('click en el quick-login de standard_user autocompleta el form', async ({ page }) => {
    await page.getByTitle('standard_user').click();
    // El form se prellena — confirmamos que la función del botón funcionó
    await expect(page.getByTestId('username-desktop')).toHaveValue('standard_user');
  });

  test('regex — todos los titles que empiezan con "Select"', async ({ page }) => {
    const flags = page.getByTitle(/^select /i);
    await expect(flags).toHaveCount(4);
  });
});

// ============================================================
// getByTitle es útil cuando:
//   ✅ La app usa title= para tooltips (UI convencional).
//   ✅ Necesitas distinguir entre elementos similares por tooltip.
//
// Evítalo cuando:
//   ❌ Los titles no existen o son triviales (title="").
//   ❌ Se usan solo para debugging del dev.
// ============================================================
