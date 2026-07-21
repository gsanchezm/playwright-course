// ============================================================
// CheckoutPage — Page Object del checkout de OmniPizza
// ============================================================
// Este es el esqueleto que el alumno termina en el reto de M04.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { Market } from "../types";

export class CheckoutPage extends BasePage {
  readonly path = "/checkout";

  // testids verificados contra la app en vivo (2026-06-29). Nombre/teléfono/
  // dirección y el botón llevan sufijo -desktop/-responsive → se resuelven con
  // tid(); zip-code y order-total NO llevan sufijo → getByTestId directo.
  private txtFullName: string = "full-name";
  private txtPhone: string = "phone";
  private txtAddress: string = "address";
  private txtZip: string = "zip-code";
  private btnPlaceOrder: string = "place-order-btn";
  private lblOrderTotal: string = "order-total";
  // Verificado en vivo 2026-07-12: "Place order" abre un MODAL de
  // confirmación (role="dialog"), no envía directo. Confirmarlo y llegar
  // a la pantalla /order-success es contenido de M05 — aquí solo
  // comprobamos que el modal aparece.
  private modalConfirmOrder: string = "confirm-order-modal";

  // --- Locators privados ---
  private get fullNameInput(): Locator {
    return this.tid(this.txtFullName);
  }

  private get phoneInput(): Locator {
    return this.tid(this.txtPhone);
  }

  private get addressInput(): Locator {
    return this.tid(this.txtAddress);
  }

  private get zipInput(): Locator {
    // zip-code NO lleva sufijo -desktop → getByTestId directo (no tid)
    return this.page.getByTestId(this.txtZip);
  }

  private get placeOrderButton(): Locator {
    return this.tid(this.btnPlaceOrder);
  }

  private get orderTotal(): Locator {
    return this.page.getByTestId(this.lblOrderTotal);
  }

  private get confirmOrderModal(): Locator {
    return this.page.getByTestId(this.modalConfirmOrder);
  }

  // --- Acciones ---

  async fillWithMarket(market: Market): Promise<void> {
    await this.fullNameInput.fill(market.fullName);
    await this.phoneInput.fill(market.phone);
    await this.addressInput.fill(market.address);
    await this.zipInput.fill(market.zipCode);
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  async checkoutWith(market: Market): Promise<void> {
    await this.fillWithMarket(market);
    await this.placeOrder();
  }

  // --- Assertions ---

  async expectLoaded(): Promise<void> {
    await expect(this.placeOrderButton).toBeVisible();
  }

  /** Verifica que "Place order" abrió el modal de confirmación (role="dialog"). */
  async expectConfirmation(): Promise<void> {
    await expect(this.confirmOrderModal).toBeVisible({ timeout: 20_000 });
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  async expectTotalContains(currencySymbol: string): Promise<void> {
    await expect(this.orderTotal).toContainText(currencySymbol);
  }
}
