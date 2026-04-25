// ============================================================
// M01 — Reto: añadir un tercer smoke "feo" (con duplicación)
// ============================================================
// Objetivo: que cuentes las líneas que repetiste.
// Cuando lleguemos a M03 este reto se refactorizará a POM en
// ~4 líneas.
// ============================================================

import { test, expect } from "@playwright/test";

const USERNAME = process.env.TEST_USER_USERNAME ?? "standard_user";
const PASSWORD = process.env.TEST_USER_PASSWORD ?? "pizza123";

test.describe("Smoke Reto M01", () => {
  test("TC-003 — la categoría 'popular' filtra pizzas @smoke", async ({ page }) => {
    // TODO 1 — navegar al login
    // PISTA: page.goto("/")

    // TODO 2 — seleccionar mercado MX
    // PISTA: page.getByTestId("market-MX").click()

    // TODO 3 — hacer login con USERNAME/PASSWORD
    // PISTA: fill en username-desktop y password-desktop, luego click en login-button-desktop

    // TODO 4 — esperar a estar en /catalog
    // PISTA: expect(page).toHaveURL(/\/catalog/)

    // TODO 5 — click en la categoría "popular"
    // PISTA: page.getByTestId("category-popular").click()

    // TODO 6 — verificar que sigue habiendo al menos 1 pizza visible
    // PISTA: locator '[data-testid^="pizza-card-"]' count > 0
  });
});

// ============================================================
// Cuando termines, cuenta:
//   1. ¿Cuántas líneas son idénticas a TC-001 o TC-002 del ejemplo?
//   2. ¿Cuánto tiempo tardaste en escribirlas?
//   3. Si tuvieras que añadir 10 smokes más, ¿cuánto tiempo perderías?
//
// Guarda la respuesta mentalmente — en M03 la mediremos en concreto.
// ============================================================
