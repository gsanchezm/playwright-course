// ============================================================
// Mini-clase 2.2 — Agrupar tests con test.describe
// ============================================================
// Analogía: En un plan de pruebas manual tienes "secciones":
// "Login", "Checkout", "Perfil". Cada sección tiene varios casos
// adentro. "describe" es eso: agrupa tests relacionados bajo un
// título común.
//
// Beneficios:
// - En el reporte se ven agrupados.
// - Puedes correr solo una sección: pnpm test --grep "Login"
// - Los hooks (beforeEach, etc.) aplican solo a ese grupo.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Suite: Login de OmniPizza', () => {
  test('standard_user es redirigido al catálogo', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('locked_out_user ve el mensaje de error y no entra', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('locked_out_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();

    // El mensaje de error aparece y seguimos en la pantalla de login
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page).not.toHaveURL(/\/catalog/);
  });
});

// Puedes tener varios describes en el mismo archivo.
test.describe('Suite: UI de la pantalla de login', () => {
  test('el logo "Art of Pizza" es visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByAltText('Art of Pizza')).toBeVisible();
  });

  test('las 4 banderas de mercado están presentes', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTitle('Select MX')).toBeVisible();
    await expect(page.getByTitle('Select US')).toBeVisible();
    await expect(page.getByTitle('Select CH')).toBeVisible();
    await expect(page.getByTitle('Select JP')).toBeVisible();
  });
});
