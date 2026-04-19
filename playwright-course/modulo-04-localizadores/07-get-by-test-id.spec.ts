// ============================================================
// Mini-clase 4.7 — getByTestId
// ============================================================
// El locator más ROBUSTO cuando el equipo front ha instrumentado
// el DOM con `data-testid`. No se rompe con i18n, ni con cambios
// de copy, ni con refactors de estructura.
//
// Sin embargo, tiene un trade-off: el testid es una dependencia
// EXPLÍCITA entre tests y código de producción. Si mañana borran
// el testid, rompes los tests — úsalo con acuerdo del equipo front.
//
// Doc: https://playwright.dev/docs/locators#locate-by-test-id
// ============================================================

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────
// El "gotcha" de OmniPizza: el hook `tid()`
//
// Muchos componentes envuelven su data-testid con un helper que
// añade un sufijo según el viewport:
//   - Desktop (≥768px) → "-desktop"
//   - Mobile  (<768px) → "-responsive"
//
// Por ejemplo: el input de username tiene
//   data-testid="username-desktop"  en desktop
//   data-testid="username-responsive" en mobile
//
// Para que los tests funcionen en CUALQUIER viewport, armamos un
// helper que decide el sufijo según el ancho del viewport.
// ─────────────────────────────────────────────────────────────

function tid(page: import('@playwright/test').Page, base: string) {
  const size = page.viewportSize();
  const suffix = size && size.width < 768 ? '-responsive' : '-desktop';
  return page.getByTestId(`${base}${suffix}`);
}

test.describe('getByTestId en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('locator básico con el sufijo -desktop', async ({ page }) => {
    // Uso directo del sufijo — funciona en desktop (default)
    await expect(page.getByTestId('username-desktop')).toBeVisible();
    await expect(page.getByTestId('password-desktop')).toBeVisible();
    await expect(page.getByTestId('login-button-desktop')).toBeVisible();
  });

  test('locator viewport-aware usando el helper tid()', async ({ page }) => {
    // El helper decide el sufijo por ti — así funciona en mobile también
    await expect(tid(page, 'username')).toBeVisible();
    await expect(tid(page, 'password')).toBeVisible();
    await expect(tid(page, 'login-button')).toBeVisible();
  });

  test('testids ESTÁTICOS (sin sufijo) — market-<country>', async ({ page }) => {
    // Los botones de mercado NO pasan por tid(): sus testids son estáticos
    await expect(page.getByTestId('market-MX')).toBeVisible();
    await expect(page.getByTestId('market-US')).toBeVisible();
    await expect(page.getByTestId('market-CH')).toBeVisible();
    await expect(page.getByTestId('market-JP')).toBeVisible();
  });

  test('testids estáticos — user-<username>', async ({ page }) => {
    await expect(page.getByTestId('user-standard_user')).toBeVisible();
    await expect(page.getByTestId('user-error_user')).toBeVisible();
  });

  test('login-error solo aparece tras credenciales inválidas', async ({ page }) => {
    await page.getByTestId('username-desktop').fill('locked_out_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  // ─── Catálogo ──────────────────────────────────────────────────
  test('después del login aparecen testids de pizzas y categorías', async ({ page }) => {
    await tid(page, 'username').fill('standard_user');
    await tid(page, 'password').fill('pizza123');
    await tid(page, 'login-button').click();
    await expect(page).toHaveURL(/\/catalog/);

    // Categorías estáticas
    await expect(page.getByTestId('category-all')).toBeVisible();
    await expect(page.getByTestId('category-popular')).toBeVisible();

    // Al menos una tarjeta de pizza con testid prefix pizza-card-
    const firstCard = page.locator('[data-testid^="pizza-card-"]').first();
    await expect(firstCard).toBeVisible();
  });
});

// ============================================================
// Reglas con data-testid:
//
// 1. Úsalo cuando getByRole / getByLabel no bastan.
// 2. Documenta el contrato con el equipo front: "los testids son
//    API pública de los tests; borrarlos rompe CI".
// 3. Evita testids con valores dinámicos si puedes (p.ej.,
//    "pizza-card-${id}" requiere que sepas el id).
// 4. Para apps con responsive: un helper tid() como el de arriba
//    evita duplicar specs por viewport.
// ============================================================
