// ============================================================
// features/checkout/checkout.factory.ts — datos de cliente de envío (FACTORY)
// ============================================================
// Analogía QA: la "fábrica de datos de prueba". En vez de copiar a mano
// el perfil de cada mercado en cada test, le pedimos a la fábrica
// "dame el cliente de MX" y nos lo entrega listo y consistente.
//
// FACTORY (por entidad): centraliza la construcción de objetos Market a
// partir de shared/data/markets.json. build() permite sobreescribir
// campos puntuales sin mutar la fuente (DRY + datos deterministas).
// ============================================================

import type { CountryCode, Market } from "../../shared/types";
import marketsJson from "../../shared/data/markets.json";

const markets = marketsJson as Market[];

export class ShippingCustomerFactory {
  /**
   * Devuelve el perfil de cliente/envío de un mercado por su código.
   * Lanza si el mercado no existe en markets.json (defecto en diseño).
   */
  static forMarket(code: CountryCode): Market {
    const market = markets.find((m) => m.code === code);
    if (!market) {
      throw new Error(`Market "${code}" not found in shared/data/markets.json`);
    }
    // Copia defensiva: nadie debe mutar la fuente JSON compartida.
    return { ...market };
  }

  /**
   * Construye un Market (mercado MX por defecto) permitiendo
   * sobreescribir campos puntuales para casos de borde.
   */
  static build(overrides: Partial<Market> = {}): Market {
    const base = ShippingCustomerFactory.forMarket(overrides.code ?? "MX");
    return { ...base, ...overrides };
  }
}
