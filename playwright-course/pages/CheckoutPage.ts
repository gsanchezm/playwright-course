// ============================================================
// CheckoutPage — Page Object del checkout de OmniPizza
// ============================================================
// Este es el esqueleto que el alumno termina en el reto de M03.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { Market } from "../types";

export class CheckoutPage extends BasePage {
  readonly path = "/checkout";

  private txtFullName: string = "checkout-fullname";
  private txtPhone: string = "checkout-phone";
  private txtAddress: string = "checkout-address";
  private txtZip: string = "checkout-zip";
  private btnPlaceOrder: string = "place-order";
  private lblOrderTotal: string = "order-total";
  private lblOrderConfirmation: string = "order-confirmation";

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
    return this.tid(this.txtZip);
  }

  private get placeOrderButton(): Locator {
    return this.tid(this.btnPlaceOrder);
  }

  private get orderTotal(): Locator {
    return this.page.getByTestId(this.lblOrderTotal);
  }

  private get orderConfirmation(): Locator {
    return this.page.getByTestId(this.lblOrderConfirmation);
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

  async expectConfirmation(): Promise<void> {
    await expect(this.orderConfirmation).toBeVisible({ timeout: 20_000 });
  }

  async expectTotalContains(currencySymbol: string): Promise<void> {
    await expect(this.orderTotal).toContainText(currencySymbol);
  }
}
