// ============================================================
// 🚩 RETO — Módulo 4: Localizadores (integrador)
// ============================================================
// Meta: usar AL MENOS 5 estrategias distintas de locator para
// completar un mismo flujo en OmniPizza.
//
// Corre con:
//   pnpm test modulo-04-localizadores/reto.spec.ts
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('🚩 Reto integrador de localizadores', () => {
  // ----------------------------------------------------------------
  // Reto 4.1 — Localiza y verifica 6 elementos de la pantalla de
  // login usando 6 locators DIFERENTES (sin repetir estrategia).
  //
  // Elementos sugeridos:
  //   1. Logo principal del login    → ¿getByAltText?
  //   2. Heading "Welcome back!"     → ¿getByText?
  //   3. Botón Sign In               → ¿getByRole?
  //   4. Input username              → ¿getByPlaceholder?
  //   5. Bandera de MX               → ¿getByTitle?
  //   6. Botón quick-login error_user → ¿getByTestId?
  // ----------------------------------------------------------------

  test('Reto 4.1 — 6 elementos, 6 strategies', async ({ page }) => {
    await page.goto('/');

    // TODO: Logo principal del login por getByAltText
    // await expect(page.getByAltText(...)).toBeVisible();

    // TODO: Heading "Welcome back!" por getByText

    // TODO: Botón Sign In por getByRole

    // TODO: Input username por getByPlaceholder

    // TODO: Bandera de MX por getByTitle

    // TODO: user-error_user por getByTestId
  });

  // ----------------------------------------------------------------
  // Reto 4.2 — Chaining: dado el <form>, obtén su botón submit
  // SIN usar testid. Luego haz click con credenciales válidas.
  // ----------------------------------------------------------------

  test('Reto 4.2 — chaining form → submit button', async ({ page }) => {
    await page.goto('/');
    // TODO: localiza el botón submit via page.locator('form').locator(...)
    // TODO: llena credenciales y haz click
    // TODO: expect(page).toHaveURL(/\/catalog/)
  });

  // ----------------------------------------------------------------
  // Reto 4.3 — Filter + nth: del catálogo, obtén la tarjeta
  // de pizza que esté en la posición 1 (segunda) y que contenga un
  // botón add-to-cart (filter({ has: ... })). Haz click en ese botón.
  // ----------------------------------------------------------------

  test('Reto 4.3 — filter + nth en el catálogo', async ({ page }) => {
    // Helper login
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);

    // TODO: Localiza las tarjetas de pizza
    // TODO: Filtra las que tienen un botón add-to-cart dentro (filter({ has }))
    // TODO: Toma la tarjeta en la posición .nth(1)
    // TODO: Clickea su botón add-to-cart interno
  });

  // ----------------------------------------------------------------
  // Reto 4.4 — .or() — espera el resultado del login:
  // cualquiera que sea (éxito O error) el assertion debe pasar.
  // Úsalo como wrapper para un test que prueba ambos casos.
  // ----------------------------------------------------------------

  test('Reto 4.4 — .or() espera éxito o error de login', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('locked_out_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();

    // TODO: expect que aparezca login-error O el navbar-logo de OmniPizza
    // (en este caso solo aparece login-error, pero el locator debe permitir ambos)
  });
});
