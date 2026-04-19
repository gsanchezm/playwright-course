// ============================================================
// Fixtures del framework — auth.ts
// ============================================================
// En M5 creamos una fixture `authenticatedPage` dentro del mismo
// archivo de tests. Aquí la extraemos a su archivo propio — ES
// la estructura final del framework.
//
// Los tests hacen `import { test, expect } from '../fixtures/auth'`
// y obtienen una page autenticada + POMs instanciados listos para usar.
// ============================================================

import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';

type OmniPizzaFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  authenticatedPage: Page;
};

export const test = base.extend<OmniPizzaFixtures>({
  // Fixture: LoginPage instanciado
  loginPage: async ({ page }, use) => {
    const lp = new LoginPage(page);
    await lp.goto();
    await use(lp);
  },

  // Fixture: CatalogPage instanciado (no navega automáticamente)
  catalogPage: async ({ page }, use) => {
    const cp = new CatalogPage(page);
    await use(cp);
  },

  // Fixture: una `page` YA autenticada en OmniPizza, con catálogo cargado.
  //   Los tests que la usen no tienen que repetir el login.
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsStandardUser();

    const catalogPage = new CatalogPage(page);
    await catalogPage.expectLoaded();
    await catalogPage.waitForCatalog();

    await use(page);
  },
});

export { expect };
