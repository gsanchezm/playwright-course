// ============================================================
// features/checkout/checkout.service.ts — cliente de /api/orders (SERVICE)
// ============================================================
// Analogía QA: el "adaptador" hacia el backend de pedidos. Aísla el
// detalle HTTP (rutas, headers, parseo) detrás de métodos de negocio
// como createOrder() o listMine(). Quien lo usa pide "crea el pedido",
// no arma requests.
//
// SERVICE/ADAPTER: extiende BaseService (Template Method) y rellena los
// huecos del contrato: basePath() y la factory create(). Demuestra auth
// Bearer + header X-Country-Code para multi-mercado.
// ============================================================

import { BaseService, createAuthedContext } from "../../core/BaseService";
import type { CountryCode, Order, OrderPayload } from "../../shared/types";

export class CheckoutService extends BaseService {
  /** Hueco del Template Method: base path de este servicio. */
  protected basePath(): string {
    return "/api/orders";
  }

  /**
   * Factory — crea la instancia con un APIRequestContext ya autenticado
   * (Bearer) y con el header X-Country-Code del mercado.
   */
  static async create(
    baseURL: string,
    token: string,
    country: CountryCode,
  ): Promise<CheckoutService> {
    const api = await createAuthedContext(baseURL, token, {
      "X-Country-Code": country,
    });
    return new CheckoutService(api, baseURL);
  }

  /**
   * Crea un pedido → POST /api/checkout.
   * OJO: la orden se CREA con POST /api/checkout, NO con basePath()
   * (/api/orders es sólo lectura: historial y detalle). Por eso la URL
   * se arma directo desde baseURL en vez de usar this.url().
   */
  async createOrder(payload: OrderPayload): Promise<Order> {
    const res = await this.api.post(`${this.baseURL}/api/checkout`, {
      data: payload,
    });
    if (!res.ok()) {
      throw new Error(`createOrder failed (${res.status()}): ${await res.text()}`);
    }
    return (await res.json()) as Order;
  }

  /** Lista los pedidos del usuario autenticado → GET /api/orders. */
  async listMine(): Promise<Order[]> {
    const res = await this.api.get(this.url(""));
    if (!res.ok()) {
      throw new Error(`listMine failed (${res.status()}): ${await res.text()}`);
    }
    return (await res.json()) as Order[];
  }
}
