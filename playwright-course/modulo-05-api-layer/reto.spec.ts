// ============================================================
// M05 — Reto: extender PizzaService con getByMarket
// ============================================================
// Objetivo:
//   1. Añade a services/PizzaService.ts un método:
//        async getByMarket(market: Market): Promise<Pizza[]>
//      que internamente use la currency del market para filtrar
//      o validar los resultados (ajusta al backend real).
//
//   2. Implementa también:
//        async getById(id: string | number): Promise<Pizza>
//      usando el endpoint correspondiente de OmniPizza.
//
//   3. Escribe un test que use ambos.
// ============================================================

import { test, expect } from "@playwright/test";
import { AuthService, PizzaService } from "../services";
import type { User, Market } from "../types";
import usersJson from "../data/users.json";
import marketsJson from "../data/markets.json";

const users = usersJson as User[];
const markets = marketsJson as Market[];
const standardUser = users.find((u) => u.username === "standard_user")!;
const mxMarket = markets.find((m) => m.code === "MX")!;
const API_URL = process.env.API_URL ?? "https://omnipizza-backend.onrender.com";

test.describe("Reto M05", () => {
  test.skip("TODO — getByMarket + getById", async () => {
    const auth = await AuthService.create(API_URL);
    const { access_token } = await auth.login(standardUser);
    await auth.dispose();

    const pizzas = await PizzaService.create(API_URL, access_token, mxMarket.code);

    // TODO 1 — implementar getByMarket y usarlo aquí
    // const list = await pizzas.getByMarket(mxMarket);

    // TODO 2 — implementar getById y usarlo aquí
    // const first = list[0];
    // const detail = await pizzas.getById(first.id);
    // expect(detail.id).toBe(first.id);

    await pizzas.dispose();
    expect(true).toBe(true);
  });
});
