// ============================================================
// Mini-clase 2.1 — El test más simple posible
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

test('caso simple: abrir la página de Playwright', async ({ page }) => {
  // Paso 1: Navegar
  await page.goto('https://playwright.dev/');

  // Paso 2: Validar
  await expect(page).toHaveTitle(/Playwright/);
});
