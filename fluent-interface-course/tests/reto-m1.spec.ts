// ============================================================
// 🚩 Reto Módulo 1 — "Hazlo encadenable"
// ============================================================
// Concepto del módulo: cada acción devuelve `this`, así que se
// ENCADENAN, y un único `await` al final drena la cola en orden.
//
// Tu tarea: escribir el login como UNA sola cadena fluida.
//
// ▶ Cómo correr SOLO este reto:
//   pnpm test tests/reto-m1.spec.ts --headed
//
// Corre ANÓNIMO por defecto (login por UI); el proyecto no tiene
// storageState ni setup project.
// ============================================================

import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages";
import type { User } from "../types";
import usersJson from "../data/users.json";

const users = usersJson as User[];
const standardUser = users.find((u) => u.username === "standard_user")!;

test("Reto M1 — encadena goto + selectMarket + loginAs en una sola expresión", async ({ page }) => {
  const loginPage = new LoginPage(page);

  // ──────────────────────────────────────────────────────────
  // TODO — Escribe el login como UNA sola cadena fluida
  // ──────────────────────────────────────────────────────────
  // Encadena, en esta línea, las tres acciones (cada una devuelve `this`)
  // y ciérrala con UN solo `await`:
  //   goto()  →  selectMarket("MX")  →  loginAs(standardUser)
  //
  //   await loginPage.goto().selectMarket("MX").loginAs(standardUser);
  //
  // (escribe la cadena aquí)

  // ──────────────────────────────────────────────────────────
  // Validación fija (NO la toques) — falla en ROJO hasta que tu cadena
  // navegue, elija mercado, haga login y llegue al catálogo.
  // ──────────────────────────────────────────────────────────
  await expect(page).toHaveURL(/\/catalog/);
});
