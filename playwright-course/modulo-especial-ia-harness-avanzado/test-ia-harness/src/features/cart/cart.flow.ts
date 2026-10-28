// ============================================================
// features/cart/cart.flow.ts — orquestación del carrito (FACADE)
// ============================================================
// Analogía QA: el "conserje" del carrito. El test dice "mete una pizza
// y muéstrame el carrito" o "llévame al checkout", y el flow se encarga
// del cómo, combinando varios Pages.
//
// FACADE: ofrece una API simple (addPizzaAndOpenCart / proceedToCheckout)
// y oculta que por dentro coordina CatalogPage + CartPage.
//
// Slice UI-only (KISS/YAGNI): sin service ni factory — el carrito no
// los necesita. El flow compone Pages, no servicios.
// ============================================================

import type { Page } from "@playwright/test";
import { CatalogPage } from "../catalog/catalog.page";
import { CartPage } from "./cart.page";

export class CartFlow {
  private readonly catalog: CatalogPage;
  private readonly cart: CartPage;

  // Contrato de fixtures: el flow recibe un único `page` y construye
  // por dentro los Pages que orquesta.
  constructor(page: Page) {
    this.catalog = new CatalogPage(page);
    this.cart = new CartPage(page);
  }

  /**
   * Agrega la primera pizza del catálogo y deja el carrito abierto.
   * Precondición: ya hay sesión y estamos en /catalog (lo siembra el
   * test vía authFlow). Confirmar el alta abre el sidebar.
   */
  async addPizzaAndOpenCart(): Promise<void> {
    await this.catalog.addFirstPizza();
    await this.cart.openCart();
  }

  /**
   * Continúa del carrito al checkout. Asume que el carrito ya está
   * abierto (p. ej. tras addPizzaAndOpenCart()).
   */
  async proceedToCheckout(): Promise<void> {
    await this.cart.goToCheckout();
  }
}
