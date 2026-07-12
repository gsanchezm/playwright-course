// ============================================================
// CheckoutPage — Page Object del checkout de OmniPizza
// ============================================================
// Este es el esqueleto que el alumno termina en el reto de M03.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import type { Market } from "../types";

// Métodos de pago que expone el checkout (botones con role="radio").
export type PaymentMethod = "card" | "cash" | "paypal";

// Datos de una tarjeta de crédito de PRUEBA (nunca reales).
// expMonth "01".."12", expYear "24".."39" (los <option> de los selects).
export interface CardData {
  holder: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

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
  // Pantalla post-orden verificada en vivo 2026-07-12: /order-success.
  private lblOrderConfirmation: string = "screen-order-success";

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

  // ==========================================================
  // 🆕 Widgets nuevos del checkout (M05 — demo de interacción)
  // ==========================================================
  // Agregado 2026-07-12: método de pago (radio group), tarjeta con
  // dropdowns nativos de expiración, y los dos sabores de tooltip.
  // ==========================================================

  private btnPaymentMethod: string = "payment-method-";
  private txtCardHolder: string = "card-holder";
  private txtCardNumber: string = "card-number";
  private selCardExpiryMonth: string = "card-expiry-month";
  private selCardExpiryYear: string = "card-expiry-year";
  private txtCardCvv: string = "card-cvv";
  private btnTipInfo: string = "tip-info";
  private lblTipTooltip: string = "tip-tooltip";

  // --- Locators privados (widgets nuevos) ---
  private paymentMethodButton(method: PaymentMethod): Locator {
    // Botones con role="radio": payment-method-card/cash/paypal.
    return this.page.getByTestId(`${this.btnPaymentMethod}${method}`);
  }

  private get cardHolderInput(): Locator {
    return this.page.getByTestId(this.txtCardHolder);
  }

  private get cardNumberInput(): Locator {
    return this.page.getByTestId(this.txtCardNumber);
  }

  private get cardExpiryMonthSelect(): Locator {
    return this.page.getByTestId(this.selCardExpiryMonth);
  }

  private get cardExpiryYearSelect(): Locator {
    return this.page.getByTestId(this.selCardExpiryYear);
  }

  private get cardCvvInput(): Locator {
    return this.page.getByTestId(this.txtCardCvv);
  }

  private get tipInfoButton(): Locator {
    return this.page.getByTestId(this.btnTipInfo);
  }

  private get tipTooltip(): Locator {
    return this.page.getByTestId(this.lblTipTooltip);
  }

  // --- Acciones (widgets nuevos) ---

  /**
   * Elige el método de pago. Son botones con role="radio" (no <input
   * radio> nativos), por eso los accionamos con .click() y verificamos
   * el estado con aria-checked (ver expectPaymentSelected()).
   */
  async selectPaymentMethod(method: PaymentMethod): Promise<void> {
    await this.paymentMethodButton(method).click();
  }

  /**
   * Llena la tarjeta de PRUEBA. El plato fuerte pedagógico: la
   * expiración son dos <select> NATIVOS → se accionan con
   * .selectOption(value), NO clickeando/escribiendo. Los <option>
   * usan value "MM"/"01".."12" y "YY"/"24".."39".
   */
  async fillCard(card: CardData): Promise<void> {
    await this.cardHolderInput.fill(card.holder);
    await this.cardNumberInput.fill(card.number);
    // <select> nativo → selectOption por value:
    await this.cardExpiryMonthSelect.selectOption(card.expMonth);
    await this.cardExpiryYearSelect.selectOption(card.expYear);
    await this.cardCvvInput.fill(card.cvv);
  }

  /** Hover sobre el ícono ℹ️ de la propina (dispara el tooltip custom). */
  async hoverTipInfo(): Promise<void> {
    await this.tipInfoButton.hover();
  }

  /**
   * Lee el tooltip NATIVO del teléfono (atributo `title`).
   * Los title del navegador NO son hover-asertables por Playwright:
   * no aparecen en el DOM al hacer hover, así que se leen del atributo.
   */
  async getPhoneTitle(): Promise<string | null> {
    return this.tid("phone").getAttribute("title");
  }

  // --- Assertions (widgets nuevos) ---

  async expectCardFieldsVisible(): Promise<void> {
    await expect(this.cardNumberInput).toBeVisible();
    await expect(this.cardExpiryMonthSelect).toBeVisible();
  }

  /**
   * Con un método != card, los campos de tarjeta se QUITAN del DOM
   * (no sólo se ocultan). `toBeHidden()` cubre ambos casos: un
   * elemento ausente cuenta como oculto.
   */
  async expectCardFieldsHidden(): Promise<void> {
    await expect(this.cardNumberInput).toBeHidden();
  }

  async expectPaymentSelected(method: PaymentMethod): Promise<void> {
    // El botón activo del radio group marca aria-checked="true".
    await expect(this.paymentMethodButton(method)).toHaveAttribute(
      "aria-checked",
      "true",
    );
  }

  async expectExpiry(month: string, year: string): Promise<void> {
    await expect(this.cardExpiryMonthSelect).toHaveValue(month);
    await expect(this.cardExpiryYearSelect).toHaveValue(year);
  }

  /** Tooltip CUSTOM: tras el hover, el [role="tooltip"] se hace visible. */
  async expectTipTooltipVisible(): Promise<void> {
    await expect(this.tipTooltip).toBeVisible();
  }

  /** El tooltip custom NO existe en el DOM hasta el hover (está oculto). */
  async expectTipTooltipHidden(): Promise<void> {
    await expect(this.tipTooltip).toBeHidden();
  }

  // ==========================================================
  // 🆕 Confirmación de orden — popup (role="dialog") + éxito
  // ==========================================================
  // El flujo tiene DOS pasos (verificado en vivo 2026-07-12):
  //   1. place-order-btn NO envía: abre un MODAL de confirmación
  //      `confirm-order-modal` que SÍ expone role="dialog" (a
  //      diferencia del customizer) → "Confirm your order".
  //   2. `confirm-order-yes` confirma y la app navega a
  //      /order-success (pantalla COMPLETA, no modal) con un
  //      `order-id` generado.
  // ==========================================================

  private modalConfirmOrder: string = "confirm-order-modal";
  private btnConfirmOrderYes: string = "confirm-order-yes";
  private btnConfirmOrderCancel: string = "confirm-order-cancel";
  private screenOrderSuccess: string = "screen-order-success";
  private lblOrderId: string = "order-id";

  private get confirmOrderModal(): Locator {
    return this.page.getByTestId(this.modalConfirmOrder);
  }
  private get confirmOrderYesButton(): Locator {
    return this.page.getByTestId(this.btnConfirmOrderYes);
  }
  private get confirmOrderCancelButton(): Locator {
    return this.page.getByTestId(this.btnConfirmOrderCancel);
  }
  private get orderSuccessScreen(): Locator {
    return this.page.getByTestId(this.screenOrderSuccess);
  }
  private get orderId(): Locator {
    return this.page.getByTestId(this.lblOrderId);
  }

  /** 2º paso: confirma la orden dentro del modal (confirm-order-yes). */
  async confirmOrder(): Promise<void> {
    await this.confirmOrderYesButton.click();
  }

  /** Cancela en el modal de confirmación (cierra sin ordenar). */
  async cancelOrderConfirmation(): Promise<void> {
    await this.confirmOrderCancelButton.click();
  }

  /**
   * El popup de confirmación SÍ es un role="dialog" — se puede afirmar
   * tanto por testid como por rol (contraste con el customizer, que no
   * expone dialog).
   */
  async expectConfirmOrderModal(): Promise<void> {
    await expect(this.confirmOrderModal).toBeVisible();
    await expect(this.page.getByRole("dialog")).toBeVisible();
  }

  /** Tras confirmar: pantalla /order-success con un id de orden generado. */
  async expectOrderSuccess(): Promise<void> {
    await this.waitForUrl(/\/order-success/);
    await expect(this.orderSuccessScreen).toBeVisible();
    await expect(this.orderId).toContainText("ORDER-");
  }
}
