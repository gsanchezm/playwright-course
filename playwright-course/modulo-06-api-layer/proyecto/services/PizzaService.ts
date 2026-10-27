// ============================================================
// PizzaService — maneja /api/pizzas (M06)
// ============================================================
// Un método por endpoint: `list()` envuelve GET /api/pizzas.
// (El reto del módulo extiende OrderService, no este servicio.)
// ============================================================

import { BaseService } from "./BaseService";
import { createAuthedContext } from "./AuthService";
import type { CountryCode, Pizza, PizzasResponse } from "../types";

export class PizzaService extends BaseService {
  protected basePath(): string {
    return "/api/pizzas";
  }

  static async create(
    baseURL: string,
    token: string,
    country: CountryCode,
  ): Promise<PizzaService> {
    const api = await createAuthedContext(baseURL, token, {
      "X-Country-Code": country,
    });
    return new PizzaService(api, baseURL);
  }

  async list(): Promise<Pizza[]> {
    const res = await this.api.get(this.url(""));
    if (!res.ok()) {
      throw new Error(`list pizzas failed (${res.status()}): ${await res.text()}`);
    }
    const body = (await res.json()) as PizzasResponse;
    return body.pizzas ?? [];
  }
}
