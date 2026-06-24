// ============================================================
// 🚩 Reto Fluent Interface — Flujo E2E completo encadenado
// ============================================================
// Completa los // TODO con CADENAS FLUIDAS (acciones que devuelven
// `this`, cerradas con UN solo `await` que drena la cola), no con una
// pila de `await` sueltos. Parametrizado por mercado.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm test tests/fluent-reto.spec.ts --headed
//
// Este reto ARRANCA con login por UI (loginInMarket hace goto("/") +
// selectMarket + loginAs). El proyecto corre ANÓNIMO por defecto
// (sin storageState ni setup), así que no hay que resetear nada.
//
// Regla de oro del POM: si necesitas un locator que no existe en su
// Page, NO lo escribas inline en el spec — añádelo al Page.
// ============================================================

import { test } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Reto M4 — E2E fluido: login → catálogo → checkout", () => {
  for (const market of markets) {
    test(`Reto-${market.code} — checkout completo en ${market.fullName}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      const checkoutPage = new CheckoutPage(page);

      // ──────────────────────────────────────────────────────────
      // TODO 1 — Login fluido que CRUZA al catálogo
      // ──────────────────────────────────────────────────────────
      // `loginInMarket` encola el login y devuelve el CatalogPage destino
      // heredando la cola. OJO: NO lo await-es — devuelve un Page (thenable),
      // no una promesa de datos. Guarda el handle.
      //
      //   const catalogPage = loginPage.loginInMarket(standardUser, market.code);
      const catalogPage: CatalogPage = /* TODO */ new CatalogPage(page);

      // ──────────────────────────────────────────────────────────
      // TODO 2 — Cadena del catálogo (un solo await drena login + catálogo)
      // ──────────────────────────────────────────────────────────
      // Encadena sobre catalogPage: espera el catálogo, añade la primera
      // pizza y valida que el carrito subió a 1. Cierra con UN await.
      //
      //   await catalogPage.waitForCatalog().addFirstPizza().expectCartCount(1);
      // TODO

      // ──────────────────────────────────────────────────────────
      // TODO 3 — La costura cruda: navegar al checkout (acción INLINE)
      // ──────────────────────────────────────────────────────────
      // No existe un método fluido catálogo→checkout (ningún Page devuelve
      // un CheckoutPage). Aquí el patrón fluido NO llega: haces la nav
      // inline y luego retomas la cadena en el CheckoutPage.
      //
      //   await page.getByTestId("nav-checkout-desktop").click();
      //   await checkoutPage.expectLoaded();
      // TODO

      // ──────────────────────────────────────────────────────────
      // TODO 4 — Cadena del checkout: rellenar → confirmar
      // ──────────────────────────────────────────────────────────
      // Encadena sobre checkoutPage: rellena el form con los datos del
      // mercado y haz click en "Place order". Todo en UNA cadena con UN await.
      //
      //   await checkoutPage.fillWithMarket(market).placeOrder();
      // TODO

      // ──────────────────────────────────────────────────────────
      // Validación fija (NO la toques) — falla en ROJO hasta que tu flujo
      // navegue de verdad hasta la confirmación. Con los TODO vacíos, esto
      // nunca aparece y el test queda en rojo (como debe ser hasta resolver).
      // ──────────────────────────────────────────────────────────
      await checkoutPage.expectConfirmation();
    });
  }
});
