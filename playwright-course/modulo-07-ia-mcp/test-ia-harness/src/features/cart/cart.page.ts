// ============================================================
// features/cart/cart.page.ts — Page Object del carrito (POM)
// ============================================================
// Analogía QA: el "mapa" del sidebar del carrito. Los tests no tocan
// locators: piden expectHasItems() o goToCheckout().
//
// POM: concentra locators y acciones del carrito. Extiende BasePage
// (Template Method) para reusar la infraestructura común.
//
// Slice UI-only (KISS/YAGNI): el carrito no gana nada con un service
// ni un factory, así que esta slice sólo tiene page + flow.
//
// OJO con los testids: TODOS los del carrito son SIN sufijo de
// viewport, así que usamos page.getByTestId(...) directo, NUNCA tid().
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "../../core/BasePage";

export class CartPage extends BasePage {
  // Testids del carrito (todos sin sufijo de viewport).
  private readonly sidebar = "cart-sidebar";
  private readonly itemPrefix = "cart-item-";
  private readonly totalValue = "cart-total-value";
  private readonly btnCheckout = "cart-checkout-btn";
  private readonly navCartCount = "nav-cart-count";

  // --- Locators privados ---

  private get cartSidebar(): Locator {
    return this.page.getByTestId(this.sidebar);
  }

  // Items: testids dinámicos (prefijo) → única excepción con locator().
  private get cartItems(): Locator {
    return this.page.locator(`[data-testid^="${this.itemPrefix}"]`);
  }

  private get cartTotal(): Locator {
    return this.page.getByTestId(this.totalValue);
  }

  private get checkoutButton(): Locator {
    return this.page.getByTestId(this.btnCheckout);
  }

  // nav-cart-count es CONDICIONAL: ausente cuando el carrito está vacío.
  private get cartCountBadge(): Locator {
    return this.page.getByTestId(this.navCartCount);
  }

  // --- Acciones públicas ---

  /**
   * "Abre" el carrito: en OmniPizza el sidebar se muestra solo tras
   * confirmar el alta de una pizza, así que aquí sólo esperamos a que
   * sea visible (web-first, sin trigger inventado ni sleeps).
   */
  async openCart(): Promise<void> {
    await this.cartSidebar.waitFor({ state: "visible" });
  }

  /** Cuenta los items actualmente en el carrito. */
  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  /** Continúa al checkout desde el carrito. */
  async goToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }

  // --- Assertions (web-first, sin sleeps) ---

  /** El carrito tiene al menos un item (auto-espera al primero). */
  async expectHasItems(): Promise<void> {
    await expect(this.cartItems.first()).toBeVisible();
  }

  /**
   * El badge de cantidad del nav muestra `n`.
   * Sólo válido para n>=1: el badge NO se renderiza con carrito vacío.
   */
  async expectCartCount(n: number): Promise<void> {
    await expect(this.cartCountBadge).toHaveText(String(n));
  }

  /** El total del carrito es visible (sanity-check del sidebar). */
  async expectTotalVisible(): Promise<void> {
    await expect(this.cartTotal).toBeVisible();
  }
}
