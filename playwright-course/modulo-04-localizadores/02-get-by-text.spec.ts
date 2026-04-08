// ============================================================
// Mini-clase 4.2 — getByText
// ============================================================
// Analogía: Cuando el elemento NO es un botón, link o heading,
// sino simplemente texto visible en la página. Ejemplo clásico:
// mensajes de error, textos descriptivos, mensajes de éxito.
//
// Ejemplos de cuándo usarlo:
// - "Login successful" → mensaje de confirmación
// - "Password must be at least 8 characters" → validación
// - "Welcome back, John" → saludo personalizado
//
// 3 formas de hacer match:
//   1. Substring (default): .getByText('Welcome')
//      → encuentra "Welcome", "Welcome back", "Welcome to..."
//   2. Exact: .getByText('Welcome', { exact: true })
//      → solo exactamente "Welcome"
//   3. Regex: .getByText(/welcome/i)
//      → case-insensitive regex
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('getByText en playwright.dev', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });

  test('match por substring (default)', async ({ page }) => {
    // Busca cualquier elemento que CONTENGA el texto "Playwright enables"
    const descripcion = page.getByText('Playwright enables');
    await expect(descripcion).toBeVisible();
  });

  test('match con regex case-insensitive', async ({ page }) => {
    // /get started/i ignora mayúsculas/minúsculas
    const link = page.getByText(/get started/i).first();
    await expect(link).toBeVisible();
  });

  test('encontrar texto dentro del footer', async ({ page }) => {
    // Primero encuentra el footer (por rol) y luego busca texto dentro
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
  });
});

// ============================================================
// ⚠️ Pro tip: getByText funciona, pero cuando el elemento TAMBIÉN
// tiene un rol semántico (botón, link...), prefiere getByRole.
// Ejemplo:
//   ❌ page.getByText('Get started').click()
//   ✅ page.getByRole('link', { name: 'Get started' }).click()
// Porque si mañana el "Get started" aparece como span decorativo
// en otra parte de la página, tu test se vuelve ambiguo.
// ============================================================
