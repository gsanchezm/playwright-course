// ============================================================
// M03 — Reto: usar CheckoutPage (ya esqueletado) en un flujo E2E
// ============================================================
// Objetivo:
//   1. Ya existe `pages/CheckoutPage.ts` con locators y acciones.
//   2. Implementa el flujo E2E: login → catálogo → add pizza →
//      checkout → confirmación.
//   3. Parametriza por mercado usando markets.json.
//
// Si necesitas un locator que no existe en CheckoutPage,
// AÑÁDELO AHÍ — no inline en el spec. Esa es la regla del POM.
// ============================================================

import { test, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Reto M03 — E2E checkout con POM", () => {
  for (const market of markets) {
    test(`Reto-${market.code} — checkout completo en ${market.fullName}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const catalogPage = new CatalogPage(page);
      const checkoutPage = new CheckoutPage(page);

      // TODO 1 — login en el mercado correspondiente
      // PISTA: loginPage.loginInMarket(standardUser, market.code)

      // TODO 2 — esperar catálogo y añadir la primera pizza
      // PISTA: catalogPage.waitForCatalog() + catalogPage.addFirstPizza()

      // TODO 3 — navegar a checkout
      // PISTA: page.getByTestId('nav-checkout-desktop').click() o similar

      // TODO 4 — llenar formulario con los datos del market
      // PISTA: checkoutPage.fillWithMarket(market)

      // TODO 5 — colocar la orden
      // PISTA: checkoutPage.placeOrder()

      // TODO 6 — esperar confirmación
      // PISTA: checkoutPage.expectConfirmation()

      expect(market).toBeDefined(); // placeholder
    });
  }
});
