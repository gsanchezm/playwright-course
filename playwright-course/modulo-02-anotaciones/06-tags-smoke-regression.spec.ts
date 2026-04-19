// ============================================================
// Mini-clase 2.6 — Tags: @smoke, @regression, @critical
// ============================================================
// Analogía: En un equipo de QA tienes distintos "suites":
//   - Smoke: los 5-10 tests MÁS importantes, corren en cada deploy.
//   - Regression: los 200+ tests que corren cada noche.
//   - Critical: los tests de flujos donde se pierde dinero si fallan.
//
// Playwright permite etiquetar tests con tags y correr solo los
// que tienen un tag específico usando --grep.
//
// Sintaxis: test('nombre @smoke @critical', ...)
//
// Comandos:
//   pnpm test --grep @smoke              → solo tests con @smoke
//   pnpm test --grep "@smoke|@critical"  → smoke O critical
//   pnpm test --grep-invert @slow        → todos MENOS los @slow
//
// Scripts ya definidos en package.json:
//   pnpm test:smoke        → atajo de --grep @smoke
//   pnpm test:regression   → atajo de --grep @regression
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Login de OmniPizza — tagged', () => {
  test('standard_user completa login @smoke @critical', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('el form tiene username + password + botón @smoke', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('username-desktop')).toBeVisible();
    await expect(page.getByTestId('password-desktop')).toBeVisible();
    await expect(page.getByTestId('login-button-desktop')).toBeVisible();
  });

  test('locked_out_user es rechazado @regression', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('locked_out_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('botones quick-login están disponibles @regression', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('user-standard_user')).toBeVisible();
    await expect(page.getByTestId('user-error_user')).toBeVisible();
  });

  test('las 4 banderas de mercado son clickables @regression @slow', async ({ page }) => {
    test.slow();
    await page.goto('/');
    await expect(page.getByTitle('Select MX')).toBeVisible();
    await expect(page.getByTitle('Select US')).toBeVisible();
    await expect(page.getByTitle('Select CH')).toBeVisible();
    await expect(page.getByTitle('Select JP')).toBeVisible();
  });
});
