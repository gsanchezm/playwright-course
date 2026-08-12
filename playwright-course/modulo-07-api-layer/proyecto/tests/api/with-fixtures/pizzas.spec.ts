// ============================================================
// tests/api/with-fixtures/pizzas.spec.ts — la MISMA suite de
// pizzas.spec.ts, refactorizada a fixtures (M07 — Paso 9 bis)
// ============================================================
// Compara este archivo con ../pizzas.spec.ts línea por línea: el
// `AuthService.create()` + `login()` + `dispose()` repetido DENTRO
// del loop (una vez por mercado) desaparece — `accessToken` llega
// listo como parámetro del test. Ver README → Paso 9 bis.
// ============================================================

import { test, expect, API_URL } from "../../../fixtures/api";
import { PizzaService } from "../../../services";
import marketsJson from "../../../data/markets.json";
import type { Market } from "../../../types";

const markets = marketsJson as Market[];

test.describe("PizzaService @api (con fixtures)", () => {
  for (const market of markets) {
    test(`lists pizzas in market ${market.code} with currency ${market.currency}`, async ({
      accessToken,
    }) => {
      const pizzas = await PizzaService.create(API_URL, accessToken, market.code);
      const list = await pizzas.list();
      await pizzas.dispose();

      expect(list.length).toBeGreaterThan(0);
      expect(list[0].currency).toBe(market.currency);
    });
  }
});
