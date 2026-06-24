// ============================================================
// fixtures/omnipizza.ts — Custom fixtures del curso Fluent Interface
// ============================================================
// Analogía QA: el fixture es el ambiente de prueba YA preparado
// (page objects instanciados, data sembrada). El TC lo recibe listo
// para ejecutar sus pasos encadenados.
//
// En este proyecto self-contained NO hay storageState ni setup project:
// el login se hace por UI dentro de la cadena fluida (loginInMarket).
// Estos fixtures sólo inyectan los 3 Page Objects ya instanciados y los
// datos de prueba (standardUser / defaultMarket) para evitar el boilerplate.
//
// Uso opcional: los specs de ejemplo y reto importan `test` directo de
// `@playwright/test` y leen los JSON. Este fixture queda disponible por si
// quieres refactorizar tus tests a un estilo aún más limpio:
//
//     import { test, expect } from "../fixtures/omnipizza";
//     test("...", async ({ loginPage, standardUser }) => { ... });
// ============================================================

import { test as base, expect } from "@playwright/test";
import { LoginPage, CatalogPage, CheckoutPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];

type PageFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  checkoutPage: CheckoutPage;
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
    if (!mx) throw new Error("Mercado MX no encontrado en data/markets.json");
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
  // eslint-disable-next-line no-empty-pattern
  standardUser: async ({}, use) => {
    const u = users.find((u) => u.username === "standard_user");
    if (!u) throw new Error("standard_user no encontrado en data/users.json");
    await use(u);
  },
});

export { expect };
export type { Market, User };
