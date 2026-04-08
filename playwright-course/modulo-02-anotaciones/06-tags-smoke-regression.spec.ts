// ============================================================
// Mini-clase 2.6 — Tags: @smoke, @regression, @critical
// ============================================================
// Analogía: En un equipo de QA tienes distintos "suites":
//   - Smoke: los 5-10 tests MÁS importantes, corren en cada deploy.
//   - Regression: los 200+ tests que corren cada noche.
//   - Critical: los tests de flujos donde se pierde dinero si fallan.
//
// Playwright permite etiquetar tests con tags y luego correr
// solo los que tienen un tag específico usando --grep.
//
// Sintaxis:
//   test('nombre @smoke @critical', ...)
//
// Comandos:
//   pnpm test --grep @smoke              → solo tests con @smoke
//   pnpm test --grep "@smoke|@critical"  → smoke O critical
//   pnpm test --grep-invert @slow        → todos MENOS los @slow
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Suite de ejemplos con tags', () => {
  test('homepage carga correctamente @smoke @critical', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('link Get Started existe @smoke', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(
      page.getByRole('link', { name: 'Get started' })
    ).toBeVisible();
  });

  test('página de Docs carga @regression', async ({ page }) => {
    await page.goto('https://playwright.dev/docs/intro');
    await expect(
      page.getByRole('heading', { name: 'Installation' })
    ).toBeVisible();
  });

  test('página de API carga @regression', async ({ page }) => {
    await page.goto('https://playwright.dev/docs/api/class-playwright');
    await expect(page.locator('body')).toBeVisible();
  });

  test('búsqueda en la homepage @regression @slow', async ({ page }) => {
    test.slow();
    await page.goto('https://playwright.dev/');
    // Simulación de un test más complejo
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============================================================
// 💡 Práctica: corre los siguientes comandos y observa la diferencia
//
//   pnpm test modulo-02-anotaciones/06-tags-smoke-regression.spec.ts --grep @smoke
//   pnpm test modulo-02-anotaciones/06-tags-smoke-regression.spec.ts --grep @regression
//   pnpm test modulo-02-anotaciones/06-tags-smoke-regression.spec.ts --grep @critical
//
// Usando los scripts del package.json:
//   pnpm test:smoke
//   pnpm test:regression
// ============================================================
