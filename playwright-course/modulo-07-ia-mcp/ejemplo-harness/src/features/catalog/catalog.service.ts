// ============================================================
// features/catalog/catalog.service.ts — cliente de /api/pizzas (SERVICE)
// ============================================================
// Analogía QA: el "adaptador" hacia el backend de pizzas. Aísla el
// detalle HTTP (rutas, headers, parseo) detrás de métodos de negocio
// como list(). Quien lo usa pide "dame las pizzas", no arma requests.
//
// SERVICE/ADAPTER: extiende BaseService (Template Method) y rellena
// los huecos del contrato: basePath() y la factory create(). Requiere
// auth (Bearer) + header X-Country-Code para resolver el mercado.
// ============================================================

import { BaseService, createAuthedContext } from "../../core/BaseService";
import type { CountryCode, Pizza, PizzasResponse } from "../../shared/types";

export class CatalogService extends BaseService {
  /** Hueco del Template Method: base path de este servicio. */
  protected basePath(): string {
    return "/api/pizzas";
  }

  /**
   * Factory — crea la instancia con un APIRequestContext autenticado.
   * Añade el header X-Country-Code para que el backend resuelva precios
   * y catálogo del mercado correcto.
   */
  static async create(
    baseURL: string,
    token: string,
    country: CountryCode,
  ): Promise<CatalogService> {
    const api = await createAuthedContext(baseURL, token, {
      "X-Country-Code": country,
    });
    return new CatalogService(api, baseURL);
  }

  /**
   * Lista las pizzas del catálogo → GET /api/pizzas.
   * Devuelve el arreglo de pizzas o lanza si la respuesta no es OK.
   */
  async list(): Promise<Pizza[]> {
    const res = await this.api.get(this.url(""));
    if (!res.ok()) {
      throw new Error(
        `list pizzas failed (${res.status()}): ${await res.text()}`,
      );
    }
    const body = (await res.json()) as PizzasResponse;
    return body.pizzas ?? [];
  }
}
