// ============================================================
// CheckoutPage — Page Object del checkout de OmniPizza
// ============================================================
// Pantalla protagonista del reto de M03. Mismas técnicas: DRY
// (`typeInput`), 2 formas de locator (string + getter) y Fluent
// encadenable (acciones → `this`).
//
// Aquí SÍ hay inputs de texto, así que es el lugar ideal para ver el
// helper DRY `typeInput()` (Forma A) frente a los getters (Forma B).
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { Market } from "../types";

export class CheckoutPage extends BasePage {
  readonly path = "/checkout";

  // --- Forma A: testids como string ---
  private readonly txtFullName = "checkout-fullname";
  private readonly txtPhone = "checkout-phone";
  private readonly txtAddress = "checkout-address";
  private readonly txtZip = "checkout-zip";
  private readonly btnPlaceOrder = "place-order";
  private readonly lblOrderTotal = "order-total";
  private readonly lblConfirmation = "order-confirmation";

  // --- Forma B: los mismos locators como getters `Locator` ---
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
    return this.page.getByTestId(this.lblConfirmation);
  }

  // --- Acciones encadenables (devuelven `this`) ---

  // Forma A — rellena el form vía el helper DRY `typeInput()`.
  fillWithMarket(market: Market): this {
    return this
      .typeInput(this.txtFullName, market.fullName)
      .typeInput(this.txtPhone, market.phone)
      .typeInput(this.txtAddress, market.address)
      .typeInput(this.txtZip, market.zipCode);
  }

  // Forma B — el MISMO llenado usando los getters `Locator`.
  fillWithMarketByGetters(market: Market): this {
    return this.step(async () => {
      await this.fullNameInput.clear();
      await this.fullNameInput.fill(market.fullName);
      await this.phoneInput.clear();
      await this.phoneInput.fill(market.phone);
      await this.addressInput.clear();
      await this.addressInput.fill(market.address);
      await this.zipInput.clear();
      await this.zipInput.fill(market.zipCode);
    });
  }

  placeOrder(): this {
    return this.step(() => this.placeOrderButton.click());
  }

  checkoutWith(market: Market): this {
    return this.fillWithMarket(market).placeOrder();
  }

  // --- Assertions encadenables ---

  expectLoaded(): this {
    return this.step(() => expect(this.placeOrderButton).toBeVisible());
  }

  expectConfirmation(): this {
    return this.step(() => expect(this.orderConfirmation).toBeVisible({ timeout: 20_000 }));
  }

  expectTotalContains(currencySymbol: string): this {
    return this.step(() => expect(this.orderTotal).toContainText(currencySymbol));
  }
}
