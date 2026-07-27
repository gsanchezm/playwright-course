// ============================================================
// fixtures/omnipizza.ts — Custom fixtures del framework (heredado de M05)
// ============================================================
// Analogía QA: el fixture es el ambiente de prueba YA preparado.
// El TC recibe los Page Objects listos (loginPage, catalogPage)
// sin escribir `new LoginPage(page)`, y ejecuta sus pasos.
//
// Set completo heredado de M05/M06 (checkoutPage/menuPage/profilePage/
// pizzaCustomizer incluidos). M07 no le suma NADA a este archivo — lo
// nuevo de M07 vive en services/, la capa de API que corre AL LADO de
// esta, no en su reemplazo.
// ============================================================

import { test as base, expect } from "@playwright/test";
import {
  LoginPage,
  CatalogPage,
  CheckoutPage,
  MenuPage,
  ProfilePage,
  PizzaCustomizerModal,
} from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];

type PageFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
  menuPage: MenuPage;
  profilePage: ProfilePage;
  pizzaCustomizer: PizzaCustomizerModal;
  standardUser: User;
};

type WorkerFixtures = {
  // Worker-scoped: se crea 1 vez por worker.
  defaultMarket: Market;
};

export const test = base.extend<PageFixtures, WorkerFixtures>({
  // --- Worker fixture ---
  // eslint-disable-next-line no-empty-pattern
  defaultMarket: [async ({}, use) => {
    const mx = markets.find((m) => m.code === "MX");
    if (!mx) throw new Error("MX market not found in data/markets.json");
    await use(mx);
  }, { scope: "worker" }],

  // --- Test fixtures ---
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  menuPage: async ({ page }, use) => {
    await use(new MenuPage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  pizzaCustomizer: async ({ page }, use) => {
    await use(new PizzaCustomizerModal(page));
  },
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const u = users.find((u) => u.username === "standard_user");
    if (!u) throw new Error("standard_user not found in data/users.json");
    await use(u);
  },
});

export { expect };
export type { Market, User };
