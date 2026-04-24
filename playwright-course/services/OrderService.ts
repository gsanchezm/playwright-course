// ============================================================
// OrderService — maneja /api/orders de OmniPizza (M05)
// ============================================================
// Demuestra:
//   - Factory con auth Bearer + X-Country-Code.
//   - Uso del contrato tipado (OrderPayload, Order).
// ============================================================

import { BaseService } from "./BaseService";
import { createAuthedContext } from "./AuthService";
import type { CountryCode, Order, OrderPayload } from "../types";

export class OrderService extends BaseService {
  protected basePath(): string {
    return "/api/orders";
  }

  static async create(
    baseURL: string,
    token: string,
    country: CountryCode,
  ): Promise<OrderService> {
    const api = await createAuthedContext(baseURL, token, {
      "X-Country-Code": country,
    });
    return new OrderService(api, baseURL);
  }

  async createOrder(payload: OrderPayload): Promise<Order> {
    const res = await this.api.post(this.url(""), { data: payload });
    if (!res.ok()) {
      throw new Error(`createOrder failed (${res.status()}): ${await res.text()}`);
    }
    return (await res.json()) as Order;
  }

  async listMine(): Promise<Order[]> {
    const res = await this.api.get(this.url(""));
    if (!res.ok()) {
      throw new Error(`listMine failed (${res.status()}): ${await res.text()}`);
    }
    return (await res.json()) as Order[];
  }
}
