// ============================================================
// Mini-clase 2.4 — beforeAll / afterAll
// ============================================================
// Diferencia clave con 03-hooks-each.spec.ts:
//   - beforeEach corre N veces (una por cada test)
//   - beforeAll corre UNA SOLA VEZ, al inicio del describe
//
// Analogía: Imagina que llegas en la mañana a tu trabajo de QA.
//   - beforeAll = prender la computadora, abrir el ambiente de QA,
//     obtener un token de API — lo haces UNA vez en todo el día.
//   - beforeEach = abrir un nuevo caso en TestRail — lo haces
//     antes de CADA caso que vas a ejecutar.
//
// ¿Cuándo usar beforeAll en vez de beforeEach?
// - Cuando el setup es caro (crear datos en DB, hacer login API).
// - Cuando todos los tests pueden compartir el mismo estado inicial.
//
// ⚠️ CUIDADO: si en beforeAll creas un "page" o datos, los tests
// pueden contaminarse entre sí. Úsalo solo para cosas de solo lectura.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Suite con setup pesado una sola vez', () => {
  // Esta variable se comparte entre los tests del describe.
  let suiteStartedAt: Date;

  test.beforeAll(async () => {
    console.log('[beforeAll] 🚀 Iniciando la suite...');
    suiteStartedAt = new Date();

    // Aquí podrías: obtener un token, crear un usuario de prueba,
    // cargar un archivo grande, etc.
  });

  test.afterAll(async () => {
    const elapsed = (new Date().getTime() - suiteStartedAt.getTime()) / 1000;
    console.log(`[afterAll] ✅ Suite terminó en ${elapsed}s`);

    // Aquí podrías: borrar el usuario de prueba, cerrar conexiones, etc.
  });

  test('primer test que usa el estado de la suite', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    expect(suiteStartedAt).toBeDefined();
  });

  test('segundo test que también usa el estado', async ({ page }) => {
    await page.goto('https://playwright.dev/docs/intro');
    await expect(
      page.getByRole('heading', { name: 'Installation' })
    ).toBeVisible();
  });
});
