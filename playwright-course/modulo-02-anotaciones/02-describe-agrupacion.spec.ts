// ============================================================
// Mini-clase 2.2 — Agrupar tests con test.describe
// ============================================================
// Analogía: En un plan de pruebas manual tienes "secciones":
// "Login", "Checkout", "Perfil de usuario". Cada sección tiene
// varios casos adentro. "describe" es exactamente eso: agrupa
// tests relacionados bajo un título común.
//
// Beneficios:
// - En el reporte se ven agrupados.
// - Puedes correr solo una sección: pnpm test --grep "Login"
// - Los hooks (beforeEach, etc.) aplican solo a ese grupo.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Suite: Homepage de Playwright', () => {
  test('el título contiene la palabra Playwright', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('el botón "Get started" es visible', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(
      page.getByRole('link', { name: 'Get started' })
    ).toBeVisible();
  });

  test('la navegación contiene el link Docs', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page.getByRole('link', { name: 'Docs' }).first()).toBeVisible();
  });
});

// Puedes tener varios describes en el mismo archivo si quieres
test.describe('Suite: Página de instalación', () => {
  test('muestra el heading de Installation', async ({ page }) => {
    await page.goto('https://playwright.dev/docs/intro');
    await expect(
      page.getByRole('heading', { name: 'Installation' })
    ).toBeVisible();
  });
});
