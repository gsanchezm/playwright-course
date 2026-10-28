// ============================================================
// shared/fixtures.ts — inyección de dependencias (patrón DI)
// ============================================================
// Analogía QA: el ambiente de prueba YA preparado. El TC declara
// qué piezas necesita (authFlow, catalogPage, standardUser…) y
// Playwright se las INYECTA listas — el test nunca hace `new`.
//
// DI con fixtures de Playwright: invertimos la creación de objetos.
// En vez de que cada spec instancie Pages/Flows, los declaramos una
// vez aquí y el runner los provee por test. Menos boilerplate, una
// sola fuente de verdad y armado consistente (DRY + SRP).
//
// NOTA: las clases de cada slice (AuthPage, CatalogFlow, …) las
// generan otros agentes con los nombres FIJOS del contrato. Aquí se
// importan por esos nombres exactos.
// ============================================================

import { test as base, expect } from "@playwright/test";
import { env } from "../core/env";
import type { Market, User } from "./types";
import usersJson from "./data/users.json";
import marketsJson from "./data/markets.json";

// Slices verticales (creadas por agentes hermanos, nombres fijos).
import { AuthPage } from "../features/auth/auth.page";
import { AuthFlow } from "../features/auth/auth.flow";
import { CatalogPage } from "../features/catalog/catalog.page";
import { CatalogFlow } from "../features/catalog/catalog.flow";
import { CartPage } from "../features/cart/cart.page";
import { CartFlow } from "../features/cart/cart.flow";
import { CheckoutPage } from "../features/checkout/checkout.page";
import { CheckoutFlow } from "../features/checkout/checkout.flow";

const users = usersJson as User[];
const markets = marketsJson as Market[];

// Tipos de las fixtures que este harness inyecta a cada test.
type HarnessFixtures = {
  authPage: AuthPage;
  authFlow: AuthFlow;
  catalogPage: CatalogPage;
  catalogFlow: CatalogFlow;
  cartPage: CartPage;
  cartFlow: CartFlow;
  checkoutPage: CheckoutPage;
  checkoutFlow: CheckoutFlow;
  standardUser: User;
  defaultMarket: Market;
};

export const test = base.extend<HarnessFixtures>({
  // --- Pages (POM) ---
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // --- Flows (Facade) ---
  authFlow: async ({ page }, use) => {
    await use(new AuthFlow(page));
  },
  catalogFlow: async ({ page }, use) => {
    await use(new CatalogFlow(page));
  },
  cartFlow: async ({ page }, use) => {
    await use(new CartFlow(page));
  },
  checkoutFlow: async ({ page }, use) => {
    await use(new CheckoutFlow(page));
  },

  // --- Datos de dominio ---
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const user = users.find((u) => u.username === env.username);
    if (!user) {
      throw new Error(`User "${env.username}" not found in shared/data/users.json`);
    }
    await use(user);
  },
  // eslint-disable-next-line no-empty-pattern
  defaultMarket: async ({}, use) => {
    const market = markets.find((m) => m.code === env.country);
    if (!market) {
      throw new Error(`Market "${env.country}" not found in shared/data/markets.json`);
    }
    await use(market);
  },
});

export { expect };
