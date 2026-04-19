// ============================================================
// Mini-clase 5.4 — Fixtures personalizadas
// ============================================================
// Una "fixture" es un objeto que Playwright te inyecta en cada test.
// Las built-in: page, context, browser, request.
// Puedes CREAR las tuyas — es la base del framework final.
//
// En el curso construimos `authenticatedPage`: una página ya logueada
// con standard_user. Los tests que la usen no tienen que repetir el
// boilerplate de login.
// ============================================================

import { test as base, expect, Page } from '@playwright/test';

base.describe.configure({ retries: 1 });

// Definimos los tipos de nuestras fixtures custom
type OmniPizzaFixtures = {
  authenticatedPage: Page;
};

// Extendemos `test` para agregar la fixture
export const test = base.extend<OmniPizzaFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // ─── Setup ─────────────────────────────────────
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);

    // Esperamos que el catálogo esté listo antes de entregar la page
    await page
      .locator('[data-testid^="pizza-card-"]')
      .first()
      .waitFor({ state: 'visible', timeout: 30_000 });

    // ─── Entregamos la página al test ──────────────
    await use(page);

    // ─── Teardown (después del test) ───────────────
    // Aquí podrías hacer logout, limpiar estado, etc.
    // En este caso no hace falta: cada test tiene su page aislado.
  },
});

// Ahora los tests usan `authenticatedPage` en vez de `page`
test('el catálogo tiene al menos 1 pizza', async ({ authenticatedPage }) => {
  const count = await authenticatedPage
    .locator('[data-testid^="pizza-card-"]')
    .count();
  expect(count).toBeGreaterThan(0);
});

test('cada pizza tiene su botón add-to-cart', async ({ authenticatedPage }) => {
  const pizzas = authenticatedPage.locator('[data-testid^="pizza-card-"]');
  const addButtons = authenticatedPage.locator('[data-testid^="add-to-cart-"]');
  const pizzaCount = await pizzas.count();
  const addCount = await addButtons.count();
  expect(addCount).toBe(pizzaCount);
});

test('las categorías del catálogo están disponibles', async ({ authenticatedPage }) => {
  // Los testids de categorías son estáticos (sin sufijo -desktop)
  await expect(authenticatedPage.getByTestId('category-all')).toBeVisible();
  await expect(authenticatedPage.getByTestId('category-popular')).toBeVisible();
});

// ============================================================
// Por qué esta fixture es PODEROSA:
//
// 1. Antes: 3 tests × 8 líneas de login boilerplate = 24 líneas duplicadas.
// 2. Después: 1 fixture con el login + 3 tests limpios.
// 3. Si mañana cambia el flujo de login (nuevo campo, CAPTCHA, MFA),
//    cambias UN lugar — la fixture.
// 4. Los tests se leen como ESPECIFICACIONES, no como scripts.
//
// En M10 (POM) vamos a mover esta fixture a `fixtures/auth.ts` como
// parte de la estructura final del framework.
// ============================================================
