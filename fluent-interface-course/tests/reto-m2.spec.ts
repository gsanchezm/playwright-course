// ============================================================
// 🚩 Reto Módulo 2 — "Encola, drena, lee"
// ============================================================
// Concepto del módulo: las acciones se ENCOLAN (no se ejecutan al
// llamarlas); el `await` DRENA la cola; las QUERIES (getPizzaNames)
// son terminales y devuelven datos.
//
// Tu tarea: drenar la cadena ya construida y leer el catálogo con
// una query terminal.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm test tests/reto-m2.spec.ts --headed
// ============================================================

import { test, expect } from "@playwright/test";
import { LoginPage, CatalogPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M2 — encola, drena y lee el catálogo", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const catalogPage = new CatalogPage(page);

  // La cadena se CONSTRUYE aquí: cada método encola su trabajo y devuelve
  // `this`. Tras esta expresión hay 5 tareas en la fila... pero NADA ha
  // corrido todavía: falta drenar la cola.
  const cadena = loginPage
    .goto()
    .withUsername(standardUser.username)
    .withPassword(standardUser.password)
    .andMarket("MX")
    .login();

  // ──────────────────────────────────────────────────────────
  // TODO 1 — Drena la cadena con un `await`. Sin esto, el login
  //   nunca ocurre (la cola queda apuntada pero no se ejecuta).
  //   await cadena;
  // ──────────────────────────────────────────────────────────
  // (escribe el await aquí)

  // Espera a que el catálogo cargue (acción encolada + await).
  await catalogPage.waitForCatalog();

  // ──────────────────────────────────────────────────────────
  // TODO 2 — Usa la query terminal getPizzaNames(): DRENA la cola y
  //   devuelve string[] (es terminal, no encadenable). Guárdala en `names`.
  //   const names = await catalogPage.getPizzaNames();
  // ──────────────────────────────────────────────────────────
  const names: string[] = []; // <- reemplaza por: await catalogPage.getPizzaNames();

  // ──────────────────────────────────────────────────────────
  // Validaciones (NO las toques) — fallan en ROJO hasta que drenes la
  // cadena (TODO 1) y leas los nombres reales (TODO 2).
  // ──────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/catalog/);
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((n) => n.trim().length > 0)).toBe(true);
});
