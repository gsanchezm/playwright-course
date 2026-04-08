// ============================================================
// Mini-clase 2.3 — beforeEach / afterEach
// ============================================================
// Analogía: En un plan manual escribirías:
//   Precondición: el usuario debe estar logueado y en /dashboard.
//
// En vez de copiar/pegar esa precondición en CADA caso, Playwright
// te permite declararla UNA vez con "beforeEach" y automáticamente
// corre antes de cada test del describe.
//
// "afterEach" es lo contrario: pasos que corren DESPUÉS de cada
// test (cerrar sesión, limpiar datos, tomar screenshot final...).
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Suite con precondición repetitiva', () => {
  // Esta función corre ANTES de CADA test del describe.
  test.beforeEach(async ({ page }) => {
    console.log('[beforeEach] Navegando a la homepage...');
    await page.goto('https://playwright.dev/');
  });

  // Esta función corre DESPUÉS de CADA test del describe.
  test.afterEach(async ({ page }, testInfo) => {
    console.log(`[afterEach] Test "${testInfo.title}" terminó con estado: ${testInfo.status}`);
  });

  test('el título tiene Playwright', async ({ page }) => {
    // NO necesitamos "goto" aquí: el beforeEach ya navegó.
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('hay un link a Get Started', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: 'Get started' })
    ).toBeVisible();
  });

  test('el heading principal es visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1 }).first()
    ).toBeVisible();
  });
});
