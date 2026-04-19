// ============================================================
// Tests de login usando el Page Object Model
// ============================================================
// Compara con modulo-02-anotaciones/02-describe-agrupacion.spec.ts:
// el código del test ahora se lee como una ESPECIFICACIÓN, no como
// un script. Los detalles de testids quedan escondidos en LoginPage.
// ============================================================

import { test, expect } from '../fixtures/auth';

test.describe.configure({ retries: 1 });

test.describe('Suite: Login con POM', () => {
  test('standard_user → catálogo', async ({ loginPage, page }) => {
    await loginPage.login('standard_user', 'pizza123');
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('locked_out_user ve el error', async ({ loginPage }) => {
    await loginPage.login('locked_out_user', 'pizza123');
    await loginPage.expectLoginError();
  });

  test('quick-login: un click autocompleta y entra', async ({ loginPage, page }) => {
    await loginPage.useQuickLogin('standard_user');
    // El quick-login prellena — necesitamos aún click en Sign In
    await loginPage.login('standard_user', 'pizza123');
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('selección de mercado antes del login', async ({ loginPage }) => {
    await loginPage.selectMarket('JP');
    await loginPage.expectLoaded();
  });
});
