// ============================================================
// Mini-clase 4.3 — getByLabel
// ============================================================
// Localiza un INPUT por el texto de su <label> asociado.
// Funciona cuando el DOM tiene uno de estos patrones:
//
//   <label for="username">Username</label>
//   <input id="username" />                         ← linked por "for"/"id"
//
//   <label>Username <input /></label>                ← label envolvente
//
//   <input aria-label="Username" />                  ← aria-label directo
//
//   <input aria-labelledby="x" /> <span id="x">Username</span>
//
// IMPORTANTE — pedagógicamente: OmniPizza's InputGroup NO conecta
// <label> con <input> mediante "for"/"id". Por eso getByLabel()
// FALLA en el login form. Esto es una lección de accesibilidad.
//
// Doc: https://playwright.dev/docs/locators#locate-by-label
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByLabel — comportamiento y limitación en OmniPizza', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.fixme(
    'getByLabel("Username") debería funcionar pero NO funciona en OmniPizza',
    async ({ page }) => {
      // El <label>Username</label> no tiene atributo "for" y el <input>
      // no tiene "id", por eso Playwright no puede conectarlos.
      // Este test queda como FIXME — documenta el bug de accesibilidad.
      await expect(page.getByLabel('Username')).toBeVisible();
    }
  );

  test('alternativa 1: getByPlaceholder("standard_user") SÍ funciona', async ({ page }) => {
    // El placeholder del input es literalmente "standard_user"
    await expect(page.getByPlaceholder('standard_user')).toBeVisible();
    await page.getByPlaceholder('standard_user').fill('admin');
    await expect(page.getByPlaceholder('standard_user')).toHaveValue('admin');
  });

  test('alternativa 2: getByTestId("username-desktop") SÍ funciona', async ({ page }) => {
    await page.getByTestId('username-desktop').fill('standard_user');
    await expect(page.getByTestId('username-desktop')).toHaveValue('standard_user');
  });
});

// ============================================================
// La lección del módulo:
//
// getByLabel es el locator IDEAL por accesibilidad — si tu app lo
// soporta, úsalo. Pero no siempre los frontends están bien escritos.
//
// Orden de preferencia cuando getByLabel no funciona:
//   1. getByRole (si el elemento tiene role claro)
//   2. getByPlaceholder (si el placeholder es estable)
//   3. getByTestId (explícito, robusto)
//
// Regla: si necesitas que getByLabel funcione, ABRE UN PR al frontend
// para añadir `htmlFor` e `id` en el label/input. Es accesibilidad real.
// ============================================================
