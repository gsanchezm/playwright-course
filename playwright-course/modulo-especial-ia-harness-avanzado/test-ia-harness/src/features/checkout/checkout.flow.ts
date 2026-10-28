// ============================================================
// features/checkout/checkout.flow.ts — orquestación del pago (FACADE)
// ============================================================
// Analogía QA: el "conserje" del checkout. El test dice "completa el
// pago para este mercado" y el flow se encarga del cómo (llenar datos
// + enviar el pedido).
//
// FACADE: ofrece una API simple (completeCheckout) y oculta los pasos
// internos del Page Object. El flow recibe `page` y construye por dentro
// el CheckoutPage que orquesta (contrato de fixtures: constructor(page)).
// ============================================================

import type { Page } from "@playwright/test";
import type { Market } from "../../shared/types";
import { CheckoutPage } from "./checkout.page";

export class CheckoutFlow {
  private readonly checkoutPage: CheckoutPage;

  constructor(page: Page) {
    this.checkoutPage = new CheckoutPage(page);
  }

  /**
   * Completa el checkout para el mercado dado: navega, llena los datos de
   * envío y envía el pedido. Asume que ya hay sesión y carrito con items
   * (precondiciones que siembra el catálogo/carrito).
   */
  async completeCheckout(market: Market): Promise<void> {
    await this.checkoutPage.goto();
    await this.checkoutPage.expectLoaded();
    await this.checkoutPage.checkoutWith(market);
  }
}
