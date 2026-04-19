// ============================================================
// Mini-clase 2.5 — Modificadores: skip, only, fixme, slow
// ============================================================
// Analogía: En tu plan de pruebas manual tienes casos con estados:
//   - BLOQUEADO: no se puede ejecutar (feature no existe)   → skip
//   - EN FOCO: lo único que estoy debuggeando hoy           → only
//   - PENDIENTE DE ARREGLAR: encontré un bug                → fixme
//   - LENTO A PROPÓSITO: tarda el triple                    → slow
//
// OmniPizza tiene usuarios deterministas perfectos para cada
// modificador — los usamos como vehículo pedagógico.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('Modificadores de tests en OmniPizza', () => {
  // ✅ Test normal que siempre corre
  test('standard_user hace login normalmente', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  // ⏸ test.skip: no se ejecuta nunca (marcado como skipped en el reporte)
  //    Úsalo cuando: la feature aún no existe o el ambiente está caído.
  test.skip('signup de un nuevo usuario', async ({ page }) => {
    // OmniPizza NO tiene signup público; este test queda parqueado
    // hasta que se implemente el endpoint.
    await page.goto('/signup');
  });

  // 🎯 test.only: SOLO este test corre del archivo (los demás se saltan)
  //    Úsalo para debuggear. ⚠️ Quítalo antes de pushear.
  // test.only('en foco para debug', async ({ page }) => {
  //   await page.goto('/');
  // });

  // 🐛 test.fixme: marca un test como pendiente de arreglar.
  //    No se ejecuta pero queda documentado en el reporte.
  test.fixme('error_user completa el checkout (bug OMNI-42)', async ({ page }) => {
    // `error_user` falla ~50% en checkout — flaky por diseño del sandbox.
    // Dejamos el test marcado para retomarlo cuando se arregle.
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('error_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
    // ... aquí iría el flujo de checkout que a veces revienta
  });

  // 🐢 test.slow: multiplica ×3 el timeout de este test.
  //    `performance_glitch_user` agrega ~3s a cada request, por eso es
  //    un caso típico para marcar como slow.
  test('performance_glitch_user llega al catálogo aunque lento', async ({ page }) => {
    test.slow();
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('performance_glitch_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
  });
});

// describe.skip: saltar TODO un bloque de golpe
test.describe.skip('Suite de signup (pendiente de feature)', () => {
  test('placeholder', async () => {});
});
