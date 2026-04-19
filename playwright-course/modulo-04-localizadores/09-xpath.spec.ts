// ============================================================
// Mini-clase 4.9 — XPath (último recurso)
// ============================================================
// XPath permite navegar el DOM por relaciones estructurales que
// CSS no expresa (padre, hermano anterior, texto exacto del nodo).
//
// Playwright lo soporta con el prefijo "xpath=" o detectándolo
// automáticamente cuando empieza con //.
//
// ⚠️ Filosofía del curso: XPath es el ÚLTIMO recurso. Usa
// getByRole/getByTestId primero. XPath solo cuando el DOM te obliga.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('XPath en OmniPizza (último recurso)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('texto exacto del nodo — botón Sign In', async ({ page }) => {
    // //button[text()="Sign In"]  → un button cuyo nodo de texto directo es "Sign In"
    const signIn = page.locator('//button[text()="Sign In"]');
    await expect(signIn).toBeVisible();
  });

  test('sin prefijo — Playwright detecta XPath por el // inicial', async ({ page }) => {
    // Equivalente a lo anterior; Playwright lo resuelve como XPath
    await expect(page.locator('//img[@alt="OmniPizza Logo"]')).toBeVisible();
  });

  test('contains() — más flexible que text() exacto', async ({ page }) => {
    // contains(., "Sign") matchea buttons donde CUALQUIER descendiente tenga "Sign"
    const signButtons = page.locator('//button[contains(., "Sign")]');
    expect(await signButtons.count()).toBeGreaterThanOrEqual(1);
  });

  test('atributo — equivalente a CSS [attr=value]', async ({ page }) => {
    // //input[@type="password"]
    const password = page.locator('//input[@type="password"]');
    await expect(password).toBeVisible();
  });

  test('navegación padre — muy difícil con CSS', async ({ page }) => {
    // Seleccionamos el LABEL del input password
    // (yendo: input[@type="password"] → parent::div → preceding-sibling::label)
    // Este ejemplo es ilustrativo — preferible hacerlo con getByText en la práctica.
    const labels = page.locator('//label');
    expect(await labels.count()).toBeGreaterThanOrEqual(2); // Username + Password
  });

  test('posición — el primer botón de mercado', async ({ page }) => {
    // Index basado en 1 (no 0)
    const firstMarket = page.locator('(//button[starts-with(@data-testid,"market-")])[1]');
    await expect(firstMarket).toBeVisible();
  });
});

// ============================================================
// Comparación rápida: el mismo elemento, 4 formas
//
//   const signIn1 = page.getByRole('button', { name: 'Sign In' });
//   const signIn2 = page.getByTestId('login-button-desktop');
//   const signIn3 = page.locator('button[data-testid="login-button-desktop"]');
//   const signIn4 = page.locator('//button[text()="Sign In"]');
//
// Orden de preferencia: 1 > 2 > 3 > 4
// ============================================================
