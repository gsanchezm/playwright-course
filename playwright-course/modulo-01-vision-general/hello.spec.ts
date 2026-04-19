// ============================================================
// Módulo 1 — Visión general · Primer smoke test
// ============================================================
// Historia del curso:
//   OmniPizza es una app de pedidos de pizza (React + FastAPI) en
//   vivo en https://omnipizza-frontend.onrender.com. A lo largo del
//   curso vamos a ir construyendo un mini framework que la cubre
//   con pruebas E2E y de API. Este archivo es el PRIMER test.
//
// Meta del smoke:
//   Que "standard_user" haga login y llegue al catálogo.
// ============================================================

import { test, expect } from '@playwright/test';

test('smoke: standard_user puede hacer login y llegar al catálogo', async ({ page }) => {
  // Arrange — baseURL ya apunta a OmniPizza en playwright.config.ts
  await page.goto('/');

  // Act — llenamos el formulario de login.
  // OmniPizza expone data-testid en todos los campos; a viewport
  // desktop (default) el hook `tid()` del front añade el sufijo
  // "-desktop". En M4 veremos los detalles; por ahora úsalo tal cual.
  // (El form viene prellenado con standard_user / pizza123, pero
  //  lo tipeamos explícitamente para que el test sea realista.)
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();

  // Assert 1 — la SPA redirige a /catalog tras login exitoso.
  await expect(page).toHaveURL(/\/catalog/);

  // Assert 2 — el logo de OmniPizza está en el navbar ⇒ sesión activa.
  await expect(page.getByAltText('OmniPizza')).toBeVisible();
});
