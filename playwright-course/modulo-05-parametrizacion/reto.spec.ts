// ============================================================
// 🚩 RETO — Módulo 5: Parametrización
// ============================================================
// Completa los TODOs. Cuando termines:
//   pnpm test modulo-05-parametrizacion/reto.spec.ts
// ============================================================

import { test, expect, Page } from '@playwright/test';
import markets from './test-data.json';

// ----------------------------------------------------------------
// Reto 5.1 — forEach con array inline
//
// Recorre `marketFlags` con forEach y genera un test por cada entrada.
// Cada test debe:
//   1. page.goto('/')
//   2. expect(page.getByTestId(flag.testid)).toBeVisible()
// ----------------------------------------------------------------

const marketFlags = [
  { country: 'México', testid: 'market-MX' },
  { country: 'United States', testid: 'market-US' },
  { country: 'Switzerland', testid: 'market-CH' },
  { country: 'Japan', testid: 'market-JP' },
];

test.describe('Reto 5.1 — forEach sobre banderas de mercado', () => {
  // TODO: usar marketFlags.forEach((flag) => { test(`Bandera ${flag.country}`, async ({ page }) => { ... }); });
});

// ----------------------------------------------------------------
// Reto 5.2 — Data-driven con JSON
//
// El archivo `test-data.json` tiene 4 mercados. Escribe un test
// parametrizado que para cada mercado:
//   1. Entre a OmniPizza.
//   2. Seleccione la bandera del mercado.
//   3. Login con standard_user.
//   4. Verifique que llega al catálogo.
//   5. Valide que el catálogo tiene pizzas.
// ----------------------------------------------------------------

test.describe('Reto 5.2 — catálogo por mercado', () => {
  // TODO: for (const market of markets) { test(`mercado ${market.code}`, async ({ page }) => { ... }); }
});

// ----------------------------------------------------------------
// Reto 5.3 — Variables de entorno
//
// Escribe un test que lea el mercado desde una env var MARKET_CODE
// (default "MX") y verifique que esa bandera está visible.
//
// Prueba con: MARKET_CODE=JP pnpm test modulo-05-parametrizacion/reto.spec.ts -g "Reto 5.3"
// ----------------------------------------------------------------

test('Reto 5.3 — selección de mercado por env var', async ({ page }) => {
  const marketCode = process.env.MARKET_CODE ?? 'MX';
  // TODO: page.goto('/') + expect que market-<marketCode> es visible
});

// ----------------------------------------------------------------
// Reto 5.4 — Fixture personalizada
//
// Crea una fixture `cartWithOnePizza` que:
//   1. Haga login con standard_user.
//   2. Llegue al catálogo y espere que cargue.
//   3. Haga click en el primer botón add-to-cart.
//   4. Entregue la `page` al test.
// ----------------------------------------------------------------

type CartFixtures = {
  cartWithOnePizza: Page;
};

const testWithCart = test.extend<CartFixtures>({
  cartWithOnePizza: async ({ page }, use) => {
    // TODO: login con standard_user + esperar catálogo +
    //       click en el primer [data-testid^="add-to-cart-"]
    await use(page);
  },
});

testWithCart('Reto 5.4a — el contador del navbar aumenta tras add-to-cart', async ({ cartWithOnePizza }) => {
  // TODO: expect que el testid "nav-cart-count" tenga texto >= 1
});

testWithCart('Reto 5.4b — el botón de checkout del cart-sidebar existe', async ({ cartWithOnePizza }) => {
  // TODO: verificar que cart-checkout-btn existe y es clickable
});
