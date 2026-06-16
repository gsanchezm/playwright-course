// ============================================================
// M03 — Refactor a POM: el spec de M02 vuelto limpio
// ============================================================
// Compara este archivo con modulo-02-locators-data/ejemplo.spec.ts
// y cuenta las líneas eliminadas. Eso es lo que ganamos al tener
// un mapa reutilizable por pantalla.
//
// NOTA: `BasePage` aquí es clase normal (no abstracta). La
// palabra `abstract` llega en M05.
// ============================================================

import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

// Este spec EJERCITA el flujo de login por UI vía POM (loginInMarket hace
// goto("/") + selectMarket + loginAs), así que debe correr ANÓNIMO. El project
// ui-chromium inyecta el storageState autenticado del setup (M04); si lo
// heredáramos, page.goto("/") rebotaría al catálogo y la pantalla de login
// (botones market-*) nunca aparecería. Lo reseteamos a vacío solo para este archivo.
test.use({ storageState: { cookies: [], origins: [] } });

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("POM — login + catálogo por mercado (M03)", () => {
  for (const market of markets) {
    test(`TC-${market.code} — flow limpio en ${market.fullName} @smoke`, async ({ page }) => {
      // El spec ahora se lee como user story, no como instrucción técnica.
      const loginPage = new LoginPage(page);
      const catalogPage = new CatalogPage(page);

      await loginPage.loginInMarket(standardUser, market.code);
      await catalogPage.expectLoaded();
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("POM — uso de acciones granulares", () => {
  test("demostración de API del POM @smoke", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);

    await loginPage.goto();
    await loginPage.selectMarket("MX");
    await loginPage.loginAs(standardUser);

    await catalogPage.waitForCatalog();
    const names = await catalogPage.getPizzaNames();
    console.log(`Pizzas en MX: ${names.length}`);
  });
});

// ============================================================
// Comparativa para el alumno:
//   - M02: ~18 líneas por test × 4 mercados = ~72 líneas
//   - M03: ~3 líneas por test × 4 mercados = ~12 líneas
//   - Reducción: ~83%
// ============================================================
