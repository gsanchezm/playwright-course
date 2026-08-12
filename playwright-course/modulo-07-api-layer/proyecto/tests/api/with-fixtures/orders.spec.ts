// ============================================================
// tests/api/with-fixtures/orders.spec.ts — la MISMA suite de
// ../orders.spec.ts, refactorizada a fixtures (M07 — Paso 9 bis)
// ============================================================
// Compara con ../orders.spec.ts: el `beforeAll` + login manual
// desaparece — `accessToken` llega listo como parámetro del test,
// igual que en with-fixtures/pizzas.spec.ts. Ver README → Paso 9 bis.
// ============================================================

import { test, expect, API_URL } from "../../../fixtures/api";
import { OrderService, PizzaService } from "../../../services";
import marketsJson from "../../../data/markets.json";
import type { Market, OrderPayload } from "../../../types";

const markets = marketsJson as Market[];
const mxMarket = markets.find((m) => m.code === "MX")!;
const saMarket = markets.find((m) => m.code === "SA")!;
const usMarket = markets.find((m) => m.code === "US")!;

test.describe("OrderService @api (con fixtures)", () => {
  test("creates an order in MX (colonia) and it shows up in the history", async ({
    accessToken,
  }) => {
    const mxPizzas = await PizzaService.create(API_URL, accessToken, mxMarket.code);
    const pizzaId = (await mxPizzas.list())[0].id;
    await mxPizzas.dispose();

    const orders = await OrderService.create(API_URL, accessToken, mxMarket.code);
    const payload: OrderPayload = {
      country_code: mxMarket.code,
      items: [{ pizza_id: pizzaId, quantity: 1 }],
      name: mxMarket.fullName,
      address: mxMarket.address,
      phone: mxMarket.phone,
      colonia: mxMarket.colonia,
      propina: 10,
    };

    const created = await orders.createOrder(payload);
    expect(created.order_id).toMatch(/^ORDER-/);
    expect(created.currency).toBe(mxMarket.currency);
    expect(created.total).toBeGreaterThan(0);

    const history = await orders.listMine();
    await orders.dispose();

    expect(history.some((o) => o.order_id === created.order_id)).toBe(true);
  });

  test("creates an order in SA (district) with the market-specific address field", async ({
    accessToken,
  }) => {
    const saPizzas = await PizzaService.create(API_URL, accessToken, saMarket.code);
    const pizzaId = (await saPizzas.list())[0].id;
    await saPizzas.dispose();

    const orders = await OrderService.create(API_URL, accessToken, saMarket.code);
    const payload: OrderPayload = {
      country_code: saMarket.code,
      items: [{ pizza_id: pizzaId, quantity: 1 }],
      name: saMarket.fullName,
      address: saMarket.address,
      phone: saMarket.phone,
      district: saMarket.district,
    };

    const created = await orders.createOrder(payload);
    expect(created.order_id).toMatch(/^ORDER-/);
    expect(created.currency).toBe(saMarket.currency);
    await orders.dispose();
  });

  test("checkout without the market's required address field fails with 400", async ({
    accessToken,
  }) => {
    const orders = await OrderService.create(API_URL, accessToken, usMarket.code);
    const payload = {
      country_code: usMarket.code,
      items: [{ pizza_id: "p01", quantity: 1 }],
      name: usMarket.fullName,
      address: usMarket.address,
      phone: usMarket.phone,
      // sin `zip_code` a propósito — es el campo requerido en US.
    } as OrderPayload;

    await expect(orders.createOrder(payload)).rejects.toThrow(
      /createOrder failed \(400\)/,
    );
    await orders.dispose();
  });
});
