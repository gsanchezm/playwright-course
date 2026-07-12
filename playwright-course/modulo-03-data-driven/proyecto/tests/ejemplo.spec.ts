// ============================================================
// M03 — Data-driven testing (bucle for...of por mercado)
// ============================================================
// Avance sobre M02: el smoke de login ahora corre contra los
// 5 mercados de OmniPizza (MX/US/CH/JP/SA) consumiendo JSON tipado
// (data/ + types/). Un `for...of` REGISTRA un test() por mercado.
//
// La jerarquía de locators ya la practicaste en M02; aquí el foco
// es el DATO. Aún no hay POM — sigue habiendo duplicación de
// pasos, pero al menos ya no hay datos hardcoded.
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
    'data/users.json does not contain a user with username "standard_user". ' +
      "Check the data seed before running M03.",
  );
}

// Mapa currency → símbolo que esperamos ver renderizado en la UI.
// Si añades un mercado nuevo, agrega su símbolo aquí (o déjalo
// fuera para que la validación se SALTE en ese mercado).
const currencySymbol: Partial<Record<Currency, string>> = {
  MXN: "$",
  // La app japonesa renderiza el yen FULL-WIDTH ￥ (U+FFE5) vía
  // Intl.NumberFormat('ja-JP'), NO el half-width ¥ (U+00A5).
  JPY: "￥",
  // Arabia Saudita (RTL): el riyal se renderiza como "ر.س" — símbolo
  // inequívoco, así que sí lo validamos (a diferencia de USD/CHF que
  // dejamos fuera por ambigüedad del "$"/símbolo suizo).
  SAR: "ر.س",
};

test.describe("Smoke parameterized by market (M03)", () => {
  // OJO: Playwright NO tiene `test.each()` (eso es de Jest/Vitest).
  // Para parametrizar, un `for` recorre el array y REGISTRA un
  // `test()` por dato → 5 TCs independientes (TC-MX, TC-US, ...),
  // no un test que itera por dentro.
  for (const market of markets) {
    test(`TC-${market.code} — login + catalog in market ${market.code} @smoke`, async ({ page }) => {
      // --- PASO 1: Login ---
      // Jerarquía: primero por testid (OmniPizza los tiene), luego por CSS prefix.
      await page.goto("/");
      await page.getByTestId(`market-${market.code}`).click();
      await page.getByTestId("username-desktop").fill(standardUser.username);
      await page.getByTestId("password-desktop").fill(standardUser.password);
      await page.getByTestId("login-button-desktop").click();

      // --- PASO 2: Validar que llegamos al catálogo ---
      // El argumento es un REGEX (match PARCIAL, robusto): pasa si la
      // URL CONTIENE "/catalog" — tolera ?query, locale o slash final.
      // Un string se fusiona con baseURL vía new URL() y se compara por
      // IGUALDAD exacta → frágil. El \/ escapa el delimitador del regex.
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
// 📚 ¿Buscas la chuleta de locators (los dos test.skip de
//    referencia)? Se movió a M02 — Locators, que es donde se
//    enseña la jerarquía. Aquí el foco es el DATO.
// ============================================================
