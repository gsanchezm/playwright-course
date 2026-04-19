// ============================================================
// Mini-clase 2.1 — El test más simple posible (OmniPizza)
// ============================================================
// Analogía: Este es el equivalente a un "caso de prueba" en tu
// plan de pruebas manual. Un caso = un objetivo verificable.
//
// Anatomía:
//   test(nombre, async ({ fixtures }) => { pasos })
//
// - "test" es la función que define UN caso.
// - El "nombre" es el título humano del caso (aparece en el reporte).
// - El callback "async" contiene los pasos.
// - "{ page }" es una "fixture": Playwright te da una página nueva
//   automáticamente por cada test.
// ============================================================

import { test, expect } from '@playwright/test';

test('caso simple: login de standard_user llega al catálogo', async ({ page }) => {
  // Paso 1: Navegar a la home (OmniPizza muestra el login aquí)
  await page.goto('/');

  // Paso 2: Llenar credenciales y enviar
  await page.getByTestId('username-desktop').fill('standard_user');
  await page.getByTestId('password-desktop').fill('pizza123');
  await page.getByTestId('login-button-desktop').click();

  // Paso 3: Validar redirección
  await expect(page).toHaveURL(/\/catalog/);
});
