// ============================================================
// 🚩 Reto Módulo 3 — "Encadena el flujo, no lo cortes"
// ============================================================
// Concepto del módulo: la transición de página fluida. `loginInMarket`
// ENCOLA el login y CRUZA de pantalla: devuelve el CatalogPage destino
// heredando la cola — y por eso NO se await-ea. El `await` llega DESPUÉS,
// sobre la cadena de assertions, y drena login + assertions en orden.
//
// Tu tarea: cruzar a catálogo con loginInMarket (sin await) y dejar que
// la cadena de assertions encadenadas haga el resto.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm test tests/reto-m3.spec.ts --headed
// ============================================================

import { test } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M3 — login fluido + assertions encadenadas en MX", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // ──────────────────────────────────────────────────────────
  // TODO — Cruza a catálogo con `loginInMarket` SIN `await`
  // ──────────────────────────────────────────────────────────
  // `loginInMarket(user, code)` encola el login y DEVUELVE el CatalogPage
  // destino (heredando la cola). OJO: NO lo await-es — devuelve un Page,
  // no una promesa de datos; await-earlo drenaría la cola y resolvería a
  // `undefined`, perdiendo el handle. Reemplaza el placeholder de abajo:
  //
  //   const catalogPage = loginPage.loginInMarket(standardUser, "MX");
  const catalogPage: CatalogPage = /* TODO: loginInMarket(...) */ new CatalogPage(page);

  // ──────────────────────────────────────────────────────────
  // Cadena de assertions (NO la toques) — un SOLO `await` drena la cola
  // heredada (el login encolado) y LUEGO las dos assertions, en orden.
  // Falla en ROJO mientras el placeholder de arriba no haga el login real.
  // ──────────────────────────────────────────────────────────
  await catalogPage.expectLoaded().expectHasPizzas();
});
