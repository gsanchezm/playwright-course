// ============================================================
// Mini-clase 2.3 — beforeEach / afterEach
// ============================================================
// Analogía: En un plan manual escribirías:
//   Precondición: estar en la pantalla de login de OmniPizza.
//
// En vez de copiar ese `page.goto('/')` en CADA caso, Playwright
// te permite declararlo UNA vez con "beforeEach" y corre antes
// de cada test del describe.
//
// "afterEach" es lo contrario: pasos que corren DESPUÉS de cada
// test (cerrar sesión, limpiar, loguear el status, etc.).
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Pantalla de login con precondición repetitiva', () => {
  // Corre ANTES de CADA test del describe.
  test.beforeEach(async ({ page }) => {
    console.log('[beforeEach] Navegando a la pantalla de login...');
    await page.goto('/');
  });

  // Corre DESPUÉS de CADA test del describe.
  test.afterEach(async ({}, testInfo) => {
    console.log(`[afterEach] "${testInfo.title}" → ${testInfo.status}`);
  });

  test('el botón Sign In es visible', async ({ page }) => {
    // No necesitamos goto — el beforeEach ya navegó.
    await expect(page.getByTestId('login-button-desktop')).toBeVisible();
  });

  test('el selector de contraseña (toggle) está presente', async ({ page }) => {
    await expect(page.getByTestId('toggle-password')).toBeVisible();
  });

  test('los botones de quick-login listan los 5 usuarios deterministas', async ({ page }) => {
    await expect(page.getByTestId('user-standard_user')).toBeVisible();
    await expect(page.getByTestId('user-locked_out_user')).toBeVisible();
    await expect(page.getByTestId('user-problem_user')).toBeVisible();
    await expect(page.getByTestId('user-performance_glitch_user')).toBeVisible();
    await expect(page.getByTestId('user-error_user')).toBeVisible();
  });
});
