// ============================================================
// M04 — Refactor a POM: el spec de M03 vuelto limpio
// ============================================================
// Compara este archivo con modulo-03-data-driven/ejemplo.spec.ts
// y cuenta las líneas eliminadas. Eso es lo que ganamos al tener
// un mapa reutilizable por pantalla.
//
// NOTA: `BasePage` aquí es clase normal (no abstracta). La
// palabra `abstract` llega en M07.
// ============================================================

import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("POM — login + catalog per market (M04)", () => {
  for (const market of markets) {
    test(`TC-${market.code} — clean flow in ${market.fullName} @smoke`, async ({ page }) => {
      // El spec ahora se lee como user story, no como instrucción técnica.
      const loginPage = new LoginPage(page);
      const catalogPage = new CatalogPage(page);

      await loginPage.loginInMarket(standardUser, market.code);
      await catalogPage.expectLoaded();
      await catalogPage.expectHasPizzas();
    });
  }
});

test.describe("POM — using granular actions", () => {
  test("POM API demonstration @smoke", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);

    await loginPage.goto();
    await loginPage.selectMarket("MX");
    await loginPage.loginAs(standardUser);

    await catalogPage.waitForCatalog();
    const names = await catalogPage.getPizzaNames();
    console.log(`Pizzas in MX: ${names.length}`);
  });
});

// ============================================================
// Comparativa para el alumno:
//   - M03: ~18 líneas por test × 4 mercados = ~72 líneas
//   - M04: ~3 líneas por test × 4 mercados = ~12 líneas
//   - Reducción: ~83%
// ============================================================
