// ============================================================
// Mini-clase 4.6 — CSS y XPath (último recurso)
// ============================================================
// Analogía: Los selectores CSS y XPath son como el "martillo" de
// una caja de herramientas. Funcionan para casi todo, pero son
// frágiles: si el diseñador mueve una div, tu test se rompe.
//
// ¿Cuándo usarlos?
// - Nunca como primera opción.
// - Solo cuando NO hay rol, NI label, NI text-id, NI texto único.
// - Cuando el elemento está tan profundamente anidado que ningún
//   otro locator funciona.
//
// Regla de oro: si sientes que necesitas CSS o XPath, primero
// habla con tu equipo de devs y pregúntales si pueden agregar un
// data-testid. Es mejor inversión a largo plazo.
// ============================================================

import { test, expect } from '@playwright/test';

test.describe('CSS y XPath selectors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
  });

  test('CSS selector básico', async ({ page }) => {
    // page.locator() sin prefijo = CSS selector por default
    const heading = page.locator('h1');
    await expect(heading.first()).toBeVisible();
  });

  test('CSS con clases y atributos', async ({ page }) => {
    // CSS tradicional: etiqueta.clase[atributo="valor"]
    const link = page.locator('a[href="/docs/intro"]').first();
    await expect(link).toBeVisible();
  });

  test('CSS con :has-text pseudoclase', async ({ page }) => {
    // :has-text es una extensión de Playwright — busca elementos
    // que contengan un texto específico.
    const button = page.locator('a:has-text("Get started")').first();
    await expect(button).toBeVisible();
  });

  test('XPath (último recurso)', async ({ page }) => {
    // Prefijo "xpath=" o "//" para usar XPath
    const heading = page.locator('//h1').first();
    await expect(heading).toBeVisible();
  });
});

// ============================================================
// 🚨 Anti-patrones comunes — NO HAGAS ESTO:
//
// ❌ page.locator('div > div > div:nth-child(3) > button')
//    → frágil, depende 100% de la estructura del DOM.
//
// ❌ page.locator('.css-1x2y3z')
//    → las clases auto-generadas (Tailwind, CSS modules) cambian
//       en cada deploy.
//
// ❌ page.locator('//body/div[1]/div[2]/div[3]/button')
//    → XPath absoluto, lo peor que puedes hacer.
//
// ✅ ALTERNATIVAS BUENAS:
//   page.getByRole('button', { name: 'Submit' })
//   page.getByTestId('submit-order')
//   page.getByLabel('Email address')
// ============================================================
