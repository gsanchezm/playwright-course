// ============================================================
// features/checkout/checkout.builder.ts — armado del pedido (BUILDER)
// ============================================================
// Analogía QA: el "armador de combos paso a paso". En lugar de un
// constructor con 10 parámetros (¿cuál era el 7º?), encadenamos
// llamadas legibles: forMarket("MX").addItem(3).withTip(20).build().
//
// BUILDER + interfaz fluida: cada método devuelve `this` para encadenar;
// build() entrega el OrderPayload ya válido. El builder conoce las
// PARTICULARIDADES por mercado: el campo de dirección y el de propina
// cambian de nombre según el país (lo exige el backend de OmniPizza).
// ============================================================

import type { CountryCode, Market, OrderPayload } from "../../shared/types";
import { ShippingCustomerFactory } from "./checkout.factory";

export class OrderBuilder {
  private countryCode: CountryCode = "MX";
  private readonly items: OrderPayload["items"] = [];
  private name = "";
  private address = "";
  private phone = "";
  // Valor del campo de dirección específico del mercado (colonia/zip/plz/prefectura).
  private marketAddressValue = "";
  // Propina opcional (se mapea al campo correcto del mercado en build()).
  private tip?: number;

  /**
   * Fija el mercado: setea country_code y los datos base (nombre, dirección,
   * teléfono) y el campo de dirección específico del país, leídos de la
   * fábrica de clientes de envío.
   */
  forMarket(code: CountryCode): this {
    const market: Market = ShippingCustomerFactory.forMarket(code);
    this.countryCode = code;
    this.name = market.fullName;
    this.address = market.address;
    this.phone = market.phone;
    this.marketAddressValue = this.resolveMarketAddress(code, market);
    return this;
  }

  /** Agrega un item al pedido (cantidad por defecto = 1). */
  addItem(pizzaId: string | number, quantity = 1): this {
    this.items.push({ pizza_id: pizzaId, quantity });
    return this;
  }

  /** Agrega propina (se mapea al campo del mercado en build()). */
  withTip(amount: number): this {
    this.tip = amount;
    return this;
  }

  /**
   * Materializa el OrderPayload válido para el backend. Cada mercado nombra
   * distinto su campo de dirección y su propina (lo exige el backend), por
   * eso el switch asigna el campo concreto con su nombre exacto.
   */
  build(): OrderPayload {
    const payload: OrderPayload = {
      country_code: this.countryCode,
      items: [...this.items],
      name: this.name,
      address: this.address,
      phone: this.phone,
    };
    switch (this.countryCode) {
      case "MX":
        payload.colonia = this.marketAddressValue;
        if (this.tip !== undefined) payload.propina = this.tip;
        break;
      case "US":
        payload.zip_code = this.marketAddressValue;
        if (this.tip !== undefined) payload.tip = this.tip;
        break;
      case "CH":
        payload.plz = this.marketAddressValue;
        if (this.tip !== undefined) payload.trinkgeld = this.tip;
        break;
      case "JP":
        payload.prefectura = this.marketAddressValue;
        if (this.tip !== undefined) payload.chip = this.tip;
        break;
    }
    return payload;
  }

  /**
   * Resuelve el valor del campo de dirección específico del mercado.
   * markets.json sólo expone `colonia` (MX) y `zipCode`; para JP, que no
   * tiene un campo dedicado de prefectura, reutilizamos la línea de
   * dirección como valor de prefectura.
   */
  private resolveMarketAddress(code: CountryCode, market: Market): string {
    switch (code) {
      case "MX":
        return market.colonia ?? "";
      case "US":
        return market.zipCode;
      case "CH":
        return market.zipCode;
      case "JP":
        return market.address;
    }
  }
}
