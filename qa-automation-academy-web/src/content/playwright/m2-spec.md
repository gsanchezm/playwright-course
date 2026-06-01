# El spec paso a paso

Esta página cubre la parte de **lectura y ejecución del ejemplo** de M02: correr el spec parametrizado, leer el bucle `for...of` data-driven y revisar el catálogo de locators. Al final tienes el código completo de `ejemplo.spec.ts`.

---

## Paso 6 — Ejecutar el ejemplo

```bash
# Headless — el smoke parametrizado, 4 mercados de un solo TC
pnpm m2

# UI mode — RECOMENDADO la primera vez
pnpm test:ui
```

**Qué debería pasar:**

- En la terminal verás **4 tests** corriendo, uno por mercado: `TC-MX`, `TC-US`, `TC-CH`, `TC-JP`.
- Todos pasan en verde (suelen tardar ~30-40s la primera vez por el cold start de Render).
- En UI mode, los 4 aparecen como hijos del mismo describe.

---

## Paso 7 — Lectura guiada del `for...of` data-driven

Abre `ejemplo.spec.ts` e identifica:

1. **El bucle `for (const market of markets)`** — un `test()` por cada elemento del array.
2. El **título dinámico** del test: `` `TC-${market.code} — login + catálogo en mercado ${market.code} @smoke` `` — cada test tiene un nombre único.
3. La **validación condicional por mercado** (símbolo `$` en MX, `¥` en JP) — lógica de negocio data-driven.
4. El **CSS selector legítimo** `[data-testid^="pizza-card-"]` — explica por qué baja al nivel 4 de la jerarquía: los testids son dinámicos.

---

## Paso 8 — Catálogo de locators (lectura, no ejecución)

Al final de `ejemplo.spec.ts` hay un `test.skip("ejemplos de cada nivel", ...)`. **No se ejecuta**, es una **referencia visual** de cada nivel de la jerarquía con código real. Escanéalo — lo vas a copiar para el reto.

---

## Código completo — `ejemplo.spec.ts`

```ts
// @file modulo-02-locators-data/ejemplo.spec.ts
// ============================================================
// M02 — Locators jerárquicos + Data tipada con test.each()
// ============================================================
// Avance sobre M01: el smoke de login ahora corre contra los
// 4 mercados de OmniPizza (MX/US/CH/JP) consumiendo JSON tipado.
//
// Aún no hay POM — sigue habiendo duplicación de pasos,
// pero al menos ya no hay datos hardcoded.
// ============================================================

import { test, expect } from "@playwright/test";
import type { Market, User, Currency } from "../types";
import marketsJson from "../data/markets.json";
import usersJson from "../data/users.json";

// Casting tipado del JSON: TypeScript verifica que el JSON cumple el contrato.
const markets = marketsJson as Market[];
const users = usersJson as User[];

// ────────────────────────────────────────────────────────
// Guard clause: si el dataset no trae el usuario que el smoke
// necesita, FALLAMOS RÁPIDO con un mensaje claro — en vez de
// usar `!` y dejar que el test reviente más adelante con un
// críptico "Cannot read property 'username' of undefined".
// ────────────────────────────────────────────────────────
const standardUser = users.find((u) => u.username === "standard_user");
if (!standardUser) {
  throw new Error(
    'data/users.json no contiene un usuario con username "standard_user". ' +
      "Revisa el seed de datos antes de correr M02.",
  );
}

// Mapa currency → símbolo que esperamos ver renderizado en la UI.
// Si añades un mercado nuevo, agrega su símbolo aquí (o déjalo
// fuera para que la validación se SALTE en ese mercado).
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  JPY: "¥",
};

test.describe("Smoke parametrizado por mercado (M02)", () => {
  // test.each() — un mismo TC ejecutado N veces, una por dato.
  for (const market of markets) {
    test(`TC-${market.code} — login + catálogo en mercado ${market.code} @smoke`, async ({ page }) => {
      // --- PASO 1: Login ---
      // Jerarquía: primero por testid (OmniPizza los tiene), luego por CSS prefix.
      await page.goto("/");
      await page.getByTestId(`market-${market.code}`).click();
      await page.getByTestId("username-desktop").fill(standardUser.username);
      await page.getByTestId("password-desktop").fill(standardUser.password);
      await page.getByTestId("login-button-desktop").click();

      // --- PASO 2: Validar que llegamos al catálogo ---
      await expect(page).toHaveURL(/\/catalog/);

      // --- PASO 3: Iterar el listado de pizzas (ciclo real) ---
      // CSS selector con prefijo — legítimo porque los testids son dinámicos.
      const pizzaCards = page.locator('[data-testid^="pizza-card-"]');
      await expect(pizzaCards.first()).toBeVisible({ timeout: 30_000 });
      const allCards = await pizzaCards.all();
      expect(allCards.length).toBeGreaterThan(0);

      // Recorrer cada tarjeta (for...of sobre el array de locators)
      for (const card of allCards) {
        await expect(card).toBeVisible();
      }

      // --- PASO 4: Validación dinámica por mercado ---
      // Reemplazamos la cadena `if / else if` por un LOOKUP MAP +
      // GUARD CLAUSE (fast return): si el mercado no tiene símbolo
      // definido, saltamos la aserción y seguimos. Cero ramificación,
      // cero `else`, fácil de extender (basta añadir una entrada al
      // mapa `currencySymbol`).
      const symbol = currencySymbol[market.currency];
      if (!symbol) return; // ← guard clause: nada que validar para esta currency

      await expect(page.locator("body")).toContainText(symbol);
    });
  }
});

// ============================================================
// M02 — Demostración de jerarquía de locators
// ============================================================
// Nota: el bloque siguiente NO se ejecuta como
// test — es un catálogo de ejemplos de cada nivel de locator.
//
// Copia cualquiera y úsalo en el reto si te conviene.
// ============================================================

test.describe("Referencia — jerarquía de locators", () => {
  test.skip("ejemplos de cada nivel", async ({ page }) => {
    await page.goto("/");

    // 1️⃣ getByRole — preferido
    page.getByRole("button", { name: "Login" });
    page.getByRole("textbox", { name: "Username" });

    // 2️⃣ getByLabel / getByText
    page.getByLabel("Username");
    page.getByText("Welcome");

    // 3️⃣ getByTestId
    page.getByTestId("username-desktop");

    // 4️⃣ CSS
    page.locator('[data-testid^="pizza-card-"]');
    page.locator(".btn-primary");

    // 5️⃣ XPath (último recurso)
    page.locator("//button[@aria-label='Submit']");

    // Filtros
    page.getByRole("listitem").filter({ hasText: "Spicy" });
    page.locator('[data-testid^="pizza-card-"]').nth(0);
  });
});
```
