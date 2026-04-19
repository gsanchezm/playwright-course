// ============================================================
// Mini-clase 2.4 — beforeAll / afterAll
// ============================================================
// Diferencia clave con beforeEach:
//   - beforeEach corre N veces (una por cada test).
//   - beforeAll corre UNA SOLA VEZ al inicio del describe.
//
// Caso real: OmniPizza vive en Render (free tier). Si nadie tocó
// el backend en un rato, está "dormido" y el primer request puede
// tardar 30-40s. Un `beforeAll` con un ping al /health despierta
// el servicio antes de que corran los tests reales — así evitamos
// que el PRIMER test se lleve el timeout.
// ============================================================

import { test, expect, request } from '@playwright/test';

test.describe('Suite con warm-up del backend', () => {
  let suiteStartedAt: number;

  // ─── Setup: una sola vez antes de todos los tests ─────────────
  test.beforeAll(async () => {
    console.log('[beforeAll] 🚀 Despertando OmniPizza backend...');
    suiteStartedAt = Date.now();

    const api = await request.newContext();
    const res = await api.get('https://omnipizza-backend.onrender.com/health', {
      timeout: 60_000,
    });
    console.log(`[beforeAll] Backend vivo (status ${res.status()})`);
    await api.dispose();
  });

  // ─── Teardown: una sola vez después de todos los tests ────────
  test.afterAll(async () => {
    const elapsed = ((Date.now() - suiteStartedAt) / 1000).toFixed(1);
    console.log(`[afterAll] ✅ Suite completa en ${elapsed}s`);
  });

  // ─── Tests ────────────────────────────────────────────────────
  test('login de standard_user llega al catálogo', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('username-desktop').fill('standard_user');
    await page.getByTestId('password-desktop').fill('pizza123');
    await page.getByTestId('login-button-desktop').click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('/catalog sin sesión redirige al login', async ({ page }) => {
    await page.goto('/catalog');
    // La ruta protegida empuja al usuario de vuelta al login (/)
    await expect(page).not.toHaveURL(/\/catalog/);
  });
});

// ============================================================
// ¿Cuándo usar beforeAll vs beforeEach?
// - beforeAll: setup CARO que todos los tests pueden COMPARTIR
//   (wake-up de un servicio, obtener un token, seed de datos).
// - beforeEach: setup BARATO que cada test necesita AISLADO
//   (navegar a una URL, resetear estado de UI).
// ============================================================
