// ============================================================
// Mini-clase 5.2 — Data-driven desde JSON
// ============================================================
// Cuando tienes muchos casos o los datos son ricos, muévelos a un
// archivo JSON. Ventaja: QA (o product, o negocio) puede agregar
// casos sin tocar el código TypeScript.
//
// OmniPizza tiene 4 mercados (MX/US/CH/JP) con pricing, moneda y
// form fields distintos. Un ejercicio clásico de data-driven.
// ============================================================

import { test, expect } from '@playwright/test';
import markets from './test-data.json';

test.describe.configure({ retries: 1 });

test.describe('Catálogo por mercado (MX / US / CH / JP)', () => {
  for (const market of markets) {
    test(`catálogo carga correctamente para mercado ${market.code}`, async ({ page }) => {
      // 1. Entrar a la pantalla de login
      await page.goto('/');

      // 2. Seleccionar el mercado via la bandera correspondiente
      //    El testid market-<code> es estático (sin sufijo -desktop)
      await page.getByTestId(`market-${market.code}`).click();

      // 3. Login con standard_user (credenciales comunes a todos los mercados)
      await page.getByTestId('username-desktop').fill('standard_user');
      await page.getByTestId('password-desktop').fill('pizza123');
      await page.getByTestId('login-button-desktop').click();
      await expect(page).toHaveURL(/\/catalog/);

      // 4. Esperar que cargue al menos una pizza del catálogo
      await page
        .locator('[data-testid^="pizza-card-"]')
        .first()
        .waitFor({ state: 'visible', timeout: 30_000 });

      // 5. Aserciones específicas del mercado
      const pizzaCount = await page.locator('[data-testid^="pizza-card-"]').count();
      expect(pizzaCount).toBeGreaterThan(0);

      // Verificamos que el precio de la primera pizza esté presente
      // (El formato exacto cambia por mercado — solo verificamos que exista.)
      const firstPrice = page.locator('[data-testid^="pizza-price-"]').first();
      await expect(firstPrice).toBeVisible();
      const priceText = await firstPrice.textContent();
      expect(priceText).toBeTruthy();
    });
  }
});

// ============================================================
// ¿for-of vs forEach?
//   - Cuando generas tests, forEach o for-of funcionan igual.
//   - for-of lee un poco mejor cuando tienes muchas propiedades.
//
// Ejecutar SOLO un mercado (útil en dev):
//   pnpm test modulo-05-parametrizacion/02-data-driven-json.spec.ts -g "MX"
//
// Ejecutar en todos los browsers:
//   pnpm test modulo-05-parametrizacion/02-data-driven-json.spec.ts
//   → 4 mercados × 3 browsers = 12 tests
// ============================================================
