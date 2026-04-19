// ============================================================
// Mini-clase 4.10 — .filter()
// ============================================================
// .filter() reduce un locator múltiple a SOLO los elementos que
// cumplen un criterio. Combínalo con otros locators para construir
// queries compuestas sin caer en XPath complejo.
//
// Variantes:
//   .filter({ hasText: "..." })     → contiene ese texto
//   .filter({ hasText: /regex/ })   → texto por regex
//   .filter({ hasNotText: "..." })  → NO contiene ese texto
//   .filter({ has: locator })       → contiene otro locator
//   .filter({ hasNot: locator })    → NO contiene otro locator
//   .filter({ visible: true })      → solo visibles
//
// Doc: https://playwright.dev/docs/locators#filtering-locators
// ============================================================

import { test, expect } from '@playwright/test';

// Render free-tier cold-starts pueden causar flakiness.
// Un reintento absorbe el primer intento fallido sin enmascarar bugs reales.
test.describe.configure({ retries: 1 });

// Helper para el login — el catálogo requiere sesión
async function loginAsStandardUser(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
  // Esperamos que el catálogo cargue al menos 1 pizza card antes de que
  // los tests hagan queries — OmniPizza en Render puede tardar.
  await page.locator('[data-testid^="pizza-card-"]').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test.describe('.filter() — escenarios en login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('filter({ hasText }) — button que contiene "Sign"', async ({ page }) => {
    const signButton = page.locator('button').filter({ hasText: 'Sign' });
    await expect(signButton).toBeVisible();
  });

  test('filter({ hasText: regex }) — quick-login users con "error"', async ({ page }) => {
    const errorUsers = page
      .locator('[data-testid^="user-"]')
      .filter({ hasText: /error|locked/i });
    // "locked_out_user" y "error_user"
    await expect(errorUsers).toHaveCount(2);
  });

  test('excluir un item del set: CSS :not([data-testid=...])', async ({ page }) => {
    // filter({ hasNot }) opera sobre DESCENDIENTES, no sobre el elemento
    // mismo — por eso no sirve para "quita este botón del set".
    // La forma correcta con CSS: :not() en el mismo selector.
    const normalUsers = page.locator(
      '[data-testid^="user-"]:not([data-testid="user-performance_glitch_user"])'
    );
    // De los 5 botones, 4 quedan después de excluir al de performance_glitch
    await expect(normalUsers).toHaveCount(4);
  });

  test('filter({ visible: true }) — solo elementos visibles', async ({ page }) => {
    const visibleButtons = page.locator('button').filter({ visible: true });
    expect(await visibleButtons.count()).toBeGreaterThan(5);
  });
});

test.describe('.filter() — escenarios en catálogo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('filter({ hasText }) en pizza-cards', async ({ page }) => {
    // Tarjeta(s) que mencionan "cheese" (útil si una pizza lo contiene)
    const cheeseCards = page
      .locator('[data-testid^="pizza-card-"]')
      .filter({ hasText: /cheese|queso/i });
    // El count puede ser 0 o más, pero la query no debe romper
    const n = await cheeseCards.count();
    expect(n).toBeGreaterThanOrEqual(0);
  });

  test('filter({ has }) — pizza-cards que contienen un botón add-to-cart', async ({ page }) => {
    const cardsWithAdd = page
      .locator('[data-testid^="pizza-card-"]')
      .filter({ has: page.locator('[data-testid^="add-to-cart-"]') });
    // Todas las tarjetas tienen Add → count > 0
    expect(await cardsWithAdd.count()).toBeGreaterThan(0);
  });

  test('filter({ hasNot }) — tarjetas sin un elemento imaginario', async ({ page }) => {
    const cardsWithoutFake = page
      .locator('[data-testid^="pizza-card-"]')
      .filter({ hasNot: page.locator('[data-testid="fake-element-that-does-not-exist"]') });
    // TODAS las tarjetas cumplen (ninguna tiene ese elemento)
    const all = await page.locator('[data-testid^="pizza-card-"]').count();
    expect(await cardsWithoutFake.count()).toBe(all);
  });
});

// ============================================================
// Cuándo usar .filter():
//   ✅ Tienes un conjunto grande y quieres el subset que cumple X.
//   ✅ El criterio es "contiene texto" o "contiene otro elemento".
//   ❌ El criterio requiere JS arbitrario → usa .evaluate()
// ============================================================
