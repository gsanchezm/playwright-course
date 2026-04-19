// ============================================================
// Mini-clase 4.11 — Chaining, nesting, .and(), .or()
// ============================================================
// Un locator se puede ENCADENAR con otro para hacer una query
// jerárquica (padre → hijo), o COMBINAR con .and() / .or() para
// describir condiciones sobre un mismo elemento.
//
// Doc: https://playwright.dev/docs/locators#chaining-locators
//      https://playwright.dev/docs/locators#matching-two-locators-simultaneously
// ============================================================

import { test, expect } from '@playwright/test';

// Render free-tier cold-starts pueden causar flakiness en specs con login.
test.describe.configure({ retries: 1 });

async function loginAsStandardUser(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();
  await expect(page).toHaveURL(/\/catalog/);
  await page.locator('[data-testid^="pizza-card-"]').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test.describe('Chaining y nesting', () => {
  test('chaining dentro del form de login', async ({ page }) => {
    await page.goto('/');
    // .locator('form').locator('button') = botones dentro del <form>
    const submitButton = page.locator('form').locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('nested: form > input[type="password"]', async ({ page }) => {
    await page.goto('/');
    // Chaining clásico: el password input DENTRO del form.
    const passwordInput = page.locator('form').locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('nested en catálogo: tarjeta de pizza → botón add-to-cart interno', async ({ page }) => {
    await loginAsStandardUser(page);
    const firstCard = page.locator('[data-testid^="pizza-card-"]').first();
    const addButton = firstCard.locator('[data-testid^="add-to-cart-"]');
    await expect(addButton).toBeVisible();
  });
});

test.describe('.and() — intersección (ambas condiciones)', () => {
  test('button que ES submit Y tiene role=button', async ({ page }) => {
    await page.goto('/');
    // .and() intersecta dos locators: el elemento debe cumplir ambos
    const submit = page
      .locator('button[type="submit"]')
      .and(page.getByRole('button'));
    await expect(submit).toBeVisible();
  });
});

test.describe('.or() — unión (cualquiera de las dos)', () => {
  test('Sign In O Crear cuenta (si existiera)', async ({ page }) => {
    await page.goto('/');
    // La pantalla de login NO tiene "Sign Up", así que el .or() cae en "Sign In"
    const primary = page
      .getByRole('button', { name: /sign in/i })
      .or(page.getByRole('button', { name: /sign up/i }));
    await expect(primary).toBeVisible();
  });

  test('login-error O catálogo — el test pasa independiente del resultado del login', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();

    // Sea éxito (catálogo carga) o error, alguno de los dos aparece
    const outcome = page
      .getByAltText('OmniPizza') // navbar tras login exitoso
      .or(page.getByTestId('login-error')); // o el error
    await expect(outcome).toBeVisible();
  });
});

// ============================================================
// Reglas rápidas:
//
//   A.locator(B)   — "B dentro de A" (jerárquico)
//   A.and(B)       — "cumple A Y B" (mismo elemento)
//   A.or(B)        — "cumple A O B" (cualquiera)
//
// En la práctica:
//   - 90% de los tests: encadenas locators para bajar por el DOM.
//   - .and() es raro — útil cuando dos aspectos son necesarios.
//   - .or() es útil cuando el resultado es "uno de dos finales".
// ============================================================
