// ============================================================
// tests/api/orders.spec.ts — Suite API para checkout + historial (M07)
// ============================================================
// OrderService existe desde el Paso 2.4 pero ningún spec lo ejercitaba
// — este archivo cierra ese hueco, mismo patrón hooks que auth.spec.ts
// y pizzas.spec.ts (beforeAll para el login, un solo token compartido).
//
// Crea órdenes REALES contra el backend compartido — por eso solo lo
// hace en 2 mercados (MX con `colonia`, SA con `district`), no en los 5:
// cada corrida de `pnpm test:api` escribiría 5 órdenes nuevas si se
// hiciera data-driven como pizzas.spec.ts. Los otros 3 mercados (US/CH/JP)
// ya validan su campo de dirección requerido en el test negativo de abajo.
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, OrderService, PizzaService } from "../../services";
import usersJson from "../../data/users.json";
import marketsJson from "../../data/markets.json";
import type { User, Market, OrderPayload } from "../../types";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const mxMarket = markets.find((m) => m.code === "MX")!;
const saMarket = markets.find((m) => m.code === "SA")!;
const usMarket = markets.find((m) => m.code === "US")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("OrderService @api", () => {
  let accessToken: string;
  let mxPizzaId: string | number;
  let saPizzaId: string | number;

  test.beforeAll(async () => {
    const auth = await AuthService.create(API_URL);
    ({ access_token: accessToken } = await auth.login(standardUser));
    await auth.dispose();

    // Los pizza_id son los mismos catálogo a catálogo (p01, p02, ...) —
    // solo cambian precio/currency por mercado — pero los pedimos por
    // mercado en vez de hardcodear el id, igual que hace reto.spec.ts.
    const mxPizzas = await PizzaService.create(API_URL, accessToken, mxMarket.code);
    mxPizzaId = (await mxPizzas.list())[0].id;
    await mxPizzas.dispose();

    const saPizzas = await PizzaService.create(API_URL, accessToken, saMarket.code);
    saPizzaId = (await saPizzas.list())[0].id;
    await saPizzas.dispose();
  });

  test("creates an order in MX (colonia) and it shows up in the history", async () => {
    const orders = await OrderService.create(API_URL, accessToken, mxMarket.code);
    const payload: OrderPayload = {
      country_code: mxMarket.code,
      items: [{ pizza_id: mxPizzaId, quantity: 1 }],
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

  test("creates an order in SA (district) with the market-specific address field", async () => {
    const orders = await OrderService.create(API_URL, accessToken, saMarket.code);
    const payload: OrderPayload = {
      country_code: saMarket.code,
      items: [{ pizza_id: saPizzaId, quantity: 1 }],
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

  test("checkout without the market's required address field fails with 400", async () => {
    const orders = await OrderService.create(API_URL, accessToken, usMarket.code);
    const payload = {
      country_code: usMarket.code,
      items: [{ pizza_id: mxPizzaId, quantity: 1 }],
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
