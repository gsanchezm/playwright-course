// ============================================================
// Mini-clase 4.12 — .first(), .last(), .nth()
// ============================================================
// Cuando un locator matchea MÚLTIPLES elementos, puedes elegir
// uno por posición:
//   .first()     → el primero
//   .last()      → el último
//   .nth(index)  → el de posición "index" (0-based)
//
// Doc: https://playwright.dev/docs/locators#matching-only-the-first-element
// ============================================================

import { test, expect } from '@playwright/test';

// El primer test de este archivo a veces sufre el cold-start de Render.
// Un reintento lo absorbe sin perder la lección pedagógica.
test.describe.configure({ retries: 1 });

async function loginAsStandardUser(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
  await page.locator('[data-testid^="pizza-card-"]').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test.describe('Position selectors en login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('.first() — la primera bandera de mercado', async ({ page }) => {
    const firstFlag = page.locator('[data-testid^="market-"]').first();
    await expect(firstFlag).toBeVisible();
    // Verificamos que el testid empieza con "market-"
    const testid = await firstFlag.getAttribute('data-testid');
    expect(testid).toMatch(/^market-/);
  });

  test('.last() — el último quick-login user', async ({ page }) => {
    const lastUser = page.locator('[data-testid^="user-"]').last();
    await expect(lastUser).toBeVisible();
    const testid = await lastUser.getAttribute('data-testid');
    expect(testid).toMatch(/^user-/);
  });

  test('.nth(index) — el quick-login de la posición 2 (tercero)', async ({ page }) => {
    // Los 5 quick-login están en orden: standard, locked_out, problem, performance, error
    const third = page.locator('[data-testid^="user-"]').nth(2);
    const testid = await third.getAttribute('data-testid');
    // Esperamos "user-problem_user" (tercero, índice 2)
    expect(testid).toBe('user-problem_user');
  });

  test('all() — iterar sobre todas las banderas de mercado', async ({ page }) => {
    const flags = await page.locator('[data-testid^="market-"]').all();
    expect(flags.length).toBe(4);
    for (const flag of flags) {
      await expect(flag).toBeVisible();
    }
  });
});

test.describe('Position selectors en catálogo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('.first() pizza card es visible', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="pizza-card-"]').first();
    await expect(firstCard).toBeVisible();
  });

  test('.last() pizza card es visible', async ({ page }) => {
    const lastCard = page.locator('[data-testid^="pizza-card-"]').last();
    await expect(lastCard).toBeVisible();
  });

  test('count() — el catálogo tiene varias pizzas', async ({ page }) => {
    const n = await page.locator('[data-testid^="pizza-card-"]').count();
    expect(n).toBeGreaterThan(0);
  });
});

// ============================================================
// Reglas:
//
// - Preferí .first() / .last() sobre .nth(0) / .nth(-1) — leen mejor.
// - Si usas .nth(N), pregúntate: ¿qué pasa si el orden cambia?
//   Un test que dependa de "la pizza en la posición 3" es FRÁGIL.
//   Mejor: filtrar por nombre o por testid específico.
//
// - .all() devuelve un array de locators (no element handles) —
//   útil para iterar con for-of asíncrono.
// ============================================================
