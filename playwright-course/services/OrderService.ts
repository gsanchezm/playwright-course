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
    // OJO: la orden se CREA con POST /api/checkout, NO con basePath()
    // (/api/orders es solo lectura: historial y detalle). Por eso
    // construimos la URL directo desde baseURL en vez de usar this.url().
    //
    // El `payload` ya cumple el contrato REAL del endpoint (ver OrderPayload
    // en types/omnipizza.d.ts): { country_code, items: [{ pizza_id, quantity }],
    // name, address, phone }. Se envía tal cual en el body, sin transformar.
    const res = await this.api.post(`${this.baseURL}/api/checkout`, { data: payload });
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
