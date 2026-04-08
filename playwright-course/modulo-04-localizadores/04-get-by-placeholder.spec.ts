// ============================================================
// Mini-clase 4.4 — getByPlaceholder
// ============================================================
// Analogía: A veces un input NO tiene label visible sino un
// "placeholder" (el texto gris que desaparece cuando escribes).
// Ejemplo clásico: cajas de búsqueda o inputs minimalistas.
//
// Ejemplo HTML:
//   <input type="text" placeholder="What needs to be done?" />
//
//   → page.getByPlaceholder('What needs to be done?').fill('...')
//
// ⚠️ Nota: en términos de accesibilidad, usar SOLO placeholder (sin label)
// no es ideal. Pero en la realidad pasa mucho, así que Playwright nos
// da esta opción.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByPlaceholder en TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
  });

  test('agregar un todo usando el placeholder', async ({ page }) => {
    // El input principal de TodoMVC tiene placeholder "What needs to be done?"
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('Comprar café');
    await input.press('Enter');

    await expect(page.getByText('Comprar café')).toBeVisible();
  });

  test('placeholder con match parcial usando regex', async ({ page }) => {
    // Match por regex si no conoces el placeholder exacto
    const input = page.getByPlaceholder(/what needs/i);

    await input.fill('Tarea con regex');
    await input.press('Enter');

    await expect(page.getByText('Tarea con regex')).toBeVisible();
  });
});
