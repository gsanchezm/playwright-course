// ============================================================
// Mini-clase 2.5 — Modificadores: skip, only, fixme, slow
// ============================================================
// Analogía: En tu plan de pruebas manual tienes casos con estados:
//   - BLOQUEADO: no se puede ejecutar (ambiente caído) → skip
//   - EN FOCO: lo único que estoy debuggeando hoy → only
//   - PENDIENTE DE ARREGLAR: encontré un bug → fixme
//   - LENTO: toma el triple de tiempo normal → slow
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Modificadores de tests', () => {
  // ✅ Test normal que siempre corre
  test('test normal que corre siempre', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Playwright/);
  });

  // ⏸ test.skip: no se ejecuta nunca (se marca en el reporte como skipped)
  //    Úsalo cuando: el backend está caído, feature aún no existe,
  //    o estás esperando un fix.
  test.skip('test bloqueado por bug QA-1234', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    // No se ejecuta — está "bloqueado"
  });

  // 🎯 test.only: cuando lo pones, SOLO este test corre del archivo
  //    (los demás del mismo archivo se saltan).
  //    Úsalo para debuggear un test aislado. ⚠️ Quítalo antes de pushear.
  // test.only('test en foco para debug', async ({ page }) => {
  //   await page.goto('https://playwright.dev/');
  // });

  // 🐛 test.fixme: marca un test como pendiente de arreglar.
  //    No se ejecuta, pero queda documentado.
  test.fixme('test que falla por un bug real', async ({ page }) => {
    // Sabemos que falla. Aún no lo arreglamos. Lo dejamos marcado.
    await page.goto('https://playwright.dev/');
    await expect(page).toHaveTitle(/Cypress/); // 🐛 va a fallar a propósito
  });

  // 🐢 test.slow: multiplica x3 el timeout de este test.
  //    Útil para tests que sabes que son lentos (ej. descargar algo).
  test('test lento intencionalmente', async ({ page }) => {
    test.slow(); // marca el test como lento
    await page.goto('https://playwright.dev/');
    await page.waitForTimeout(1000); // simula una operación lenta
    await expect(page).toHaveTitle(/Playwright/);
  });
});

// Puedes skippear UN describe completo:
test.describe.skip('Suite bloqueada: esperando deploy', () => {
  test('a', async () => {});
  test('b', async () => {});
});
