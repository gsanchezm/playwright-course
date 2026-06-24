// ============================================================
// Fluent Interface — Ejemplo RESUELTO (todo en verde)
// ============================================================
// Este spec EJERCITA el Fluent Interface encadenable del POM sobre la
// app OmniPizza desplegada. Cuenta cuántas acciones de Playwright
// terminas escribiendo INLINE: casi ninguna — todo vive en los Pages,
// y se lee como una frase encadenada.
//
// Patrón clave:
//   - Las ACCIONES devuelven `this` (encolan su trabajo) → encadenables.
//   - Las QUERIES (getPizzaNames) TERMINAN la cadena devolviendo datos.
//   - El `await` final drena la cola en orden.
//
// Este proyecto se loguea por UI dentro de la cadena fluida
// (loginInMarket hace goto("/") + selectMarket + loginAs), así que corre
// ANÓNIMO por defecto — no hay storageState ni setup project.
//
// NOTA: `BasePage` aquí es clase normal (no abstracta).
// ============================================================

import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { Market, User } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

const markets = marketsJson as Market[];
const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test.describe("Fluent — login + catálogo por mercado", () => {
  for (const market of markets) {
    test(`TC-${market.code} — flow limpio en ${market.fullName} @smoke`, async ({ page }) => {
      // Fluent: loginInMarket CRUZA a /catalog y DEVUELVE el CatalogPage
      // (encadenable, hereda la cola). El `await` ejecuta el login y luego
      // las assertions encadenadas en una sola expresión.
      const loginPage = new LoginPage(page);
      const catalogPage = loginPage.loginInMarket(standardUser, market.code);

      await catalogPage.expectLoaded().expectHasPizzas();
    });
  }
});

test.describe("Fluent — Interface encadenado (acciones granulares)", () => {
  test("demostración de API del POM @smoke", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);

    // Fluent builder: cada paso hace UNA cosa y se lee como una frase.
    // Las acciones ENCOLAN su trabajo; el `await` ejecuta toda la cadena en orden.
    await loginPage
      .goto()
      .withUsername(standardUser.username)
      .withPassword(standardUser.password)
      .andMarket("MX")
      .login();

    // El catálogo también encadena acciones; las QUERIES (getPizzaNames)
    // cierran la cadena devolviendo datos.
    await catalogPage.waitForCatalog();
    const names = await catalogPage.getPizzaNames();
    console.log(`Pizzas en MX: ${names.length}`);
  });
});

// ============================================================
// Idea pedagógica del Fluent Interface:
//   - Sin Fluent: 1 `await` por acción → muchas líneas ruidosas.
//   - Con Fluent: una sola expresión encadenada que se lee como una frase.
//   - Regla de oro: SIEMPRE haz `await` de la cadena (drena la cola).
// ============================================================
