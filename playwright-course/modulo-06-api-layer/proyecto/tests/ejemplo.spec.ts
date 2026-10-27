// ============================================================
// M06 — API Layer con BaseService abstracta
// ============================================================
// Contraparte de API del flujo de UI (tests/ui/ejemplo.spec.ts): los
// MISMOS tres pasos — login → pizzas → crear orden — sin navegador.
//   UI: loginPage.loginInMarket → catalogPage.expectHasPizzas → checkout
//   API: AuthService.login → PizzaService.list → OrderService.createOrder
//
// Este ejemplo demuestra:
//   1. Clase abstracta con método abstracto obligatorio.
//   2. Factory pattern con auth inyectada.
//   3. Data-driven vía datos tipados compartidos con UI.
//   4. Data isolation con uniqueOrderId (prepara para OrderService).
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, OrderService, PizzaService } from "../services";
import type { User, Market, OrderPayload } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";
import { uniqueOrderId } from "../helpers/unique-data";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("M06 — service layer demonstration @api", () => {
  test("full flow: auth → list pizzas by market", async () => {
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

  test("same steps as the UI flow: login → pizzas → create order", async () => {
    const usMarket = markets.find((m) => m.code === "US")!;

    // Paso 1 — Login (UI: loginPage.loginInMarket)
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    await auth.dispose();

    // Paso 2 — Pizzas (UI: catalogPage.expectHasPizzas)
    const pizzas = await PizzaService.create(API_URL, access_token, usMarket.code);
    const list = await pizzas.list();
    await pizzas.dispose();
    expect(list.length).toBeGreaterThan(0);

    // Paso 3 — Crear orden (UI: checkout → confirmOrder → /order-success)
    const orders = await OrderService.create(API_URL, access_token, usMarket.code);
    const payload: OrderPayload = {
      country_code: usMarket.code,
      items: [{ pizza_id: list[0].id, quantity: 1 }],
      name: usMarket.fullName,
      address: usMarket.address,
      phone: usMarket.phone,
      zip_code: usMarket.zipCode,
    };
    const created = await orders.createOrder(payload);
    await orders.dispose();
    expect(created.order_id).toMatch(/^ORDER-/);
    expect(created.currency).toBe(usMarket.currency);
  });

  test("uniqueOrderId generates unique order ids per worker", async ({}, testInfo) => {
    const id1 = uniqueOrderId(testInfo);
    const id2 = uniqueOrderId(testInfo);
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^ORD-w\d+-\d+-\d+$/);
  });
});
