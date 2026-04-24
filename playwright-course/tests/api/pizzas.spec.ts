// ============================================================
// tests/api/pizzas.spec.ts — Suite API para catálogo (M05)
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, PizzaService } from "../../services";
import usersJson from "../../data/users.json";
import marketsJson from "../../data/markets.json";
import type { User, Market } from "../../types";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("PizzaService @api", () => {
  for (const market of markets) {
    test(`lista pizzas en mercado ${market.code} con currency ${market.currency}`, async () => {
      // 1. Login para obtener token
      const auth = await AuthService.create(API_URL);
      const { access_token } = await auth.login(standardUser);
      await auth.dispose();

      // 2. Consumir el servicio tipado
      const pizzas = await PizzaService.create(API_URL, access_token, market.code);
      const list = await pizzas.list();
      await pizzas.dispose();

      // 3. Contrato: hay pizzas y vienen con la moneda del mercado
      expect(list.length).toBeGreaterThan(0);
      expect(list[0].currency).toBe(market.currency);
    });
  }
});
