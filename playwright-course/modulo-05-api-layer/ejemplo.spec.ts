// ============================================================
// M05 — API Layer con BaseService abstracta
// ============================================================
// Este ejemplo demuestra:
//   1. Clase abstracta con método abstracto obligatorio.
//   2. Factory pattern con auth inyectada.
//   3. Data-driven vía datos tipados compartidos con UI.
//   4. Data isolation con uniqueOrderId (prepara para OrderService).
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, PizzaService } from "../services";
import type { User, Market } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";
import { uniqueOrderId } from "../helpers/unique-data";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("M05 — demostración de la capa de servicios @api", () => {
  test("flujo completo: auth → list pizzas por mercado", async () => {
    // 1. Login via AuthService (clase concreta que extiende BaseService)
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    await auth.dispose();

    // 2. Iterar mercados reutilizando el token
    for (const market of markets) {
      const pizzas = await PizzaService.create(API_URL, access_token, market.code);
      const list = await pizzas.list();
      await pizzas.dispose();

      expect(list.length).toBeGreaterThan(0);
      expect(list[0]).toHaveProperty("id");
      expect(list[0]).toHaveProperty("name");
      expect(list[0].currency).toBe(market.currency);
    }
  });

  test("uniqueOrderId genera folios únicos por worker", async ({}, testInfo) => {
    const id1 = uniqueOrderId(testInfo);
    const id2 = uniqueOrderId(testInfo);
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^ORD-w\d+-\d+-\d+$/);
  });
});
