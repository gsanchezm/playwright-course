// ============================================================
// features/checkout/checkout.page.ts — Page Object del checkout (POM)
// ============================================================
// Analogía QA: el "mapa de navegación" de la pantalla de pago.
// Los tests NUNCA tocan locators directamente — sólo llaman
// métodos de negocio como fillWithMarket() o checkoutWith().
//
// POM: esta clase concentra los locators y las acciones del checkout.
// Extiende BasePage (Template Method) para reusar tid()/waitForUrl()
// sin reimplementarlos.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "../../core/BasePage";
import type { Market } from "../../shared/types";

export class CheckoutPage extends BasePage {
  // Ruta de la pantalla de checkout.
  private readonly path = "/checkout";

  // Testids base. Nombre/teléfono/dirección y el botón llevan sufijo
  // -desktop/-responsive → se resuelven con tid(). zip-code y order-total
  // NO llevan sufijo → getByTestId directo.
  private readonly txtFullName = "full-name";
  private readonly txtPhone = "phone";
  private readonly txtAddress = "address";
  private readonly txtZip = "zip-code";
  private readonly btnPlaceOrder = "place-order-btn";
  private readonly lblOrderTotal = "order-total";
  private readonly itemPrefix = "order-item-";

  // --- Locators privados: documentación interna del Page ---

  private get fullNameInput(): Locator {
    return this.tid(this.txtFullName);
  }

  private get phoneInput(): Locator {
    return this.tid(this.txtPhone);
  }

  private get addressInput(): Locator {
    return this.tid(this.txtAddress);
  }

  // zip-code NO lleva sufijo → getByTestId directo (no tid).
  private get zipInput(): Locator {
    return this.page.getByTestId(this.txtZip);
  }

  private get placeOrderButton(): Locator {
    return this.tid(this.btnPlaceOrder);
  }

  // order-total NO lleva sufijo → getByTestId directo.
  private get orderTotal(): Locator {
    return this.page.getByTestId(this.lblOrderTotal);
  }

  // Items del resumen del pedido (testid dinámico con prefijo).
  private get orderItems(): Locator {
    return this.page.locator(`[data-testid^="${this.itemPrefix}"]`);
  }

  // --- Acciones públicas: la interfaz del POM ---

  /** Navega a la pantalla de checkout. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Llena los datos de envío con el perfil del mercado dado. */
  async fillWithMarket(market: Market): Promise<void> {
    await this.fullNameInput.fill(market.fullName);
    await this.phoneInput.fill(market.phone);
    await this.addressInput.fill(market.address);
    await this.zipInput.fill(market.zipCode);
  }

  /** Envía el pedido (clic en "place order"). */
  async placeOrder(): Promise<void> {
    await this.placeOrderButton.click();
  }

  /** Flujo de pantalla: llenar datos + enviar pedido. */
  async checkoutWith(market: Market): Promise<void> {
    await this.fillWithMarket(market);
    await this.placeOrder();
    // NOTA: la pantalla de confirmación post-orden NO está verificada,
    // por eso aquí no afirmamos nada duro sobre ella.
  }

  // --- Assertions de estado (web-first, sin sleeps) ---

  /** El checkout cargó (el botón de enviar pedido es accionable). */
  async expectLoaded(): Promise<void> {
    await expect(this.placeOrderButton).toBeVisible();
    await expect(this.placeOrderButton).toBeEnabled();
  }

  /** El total del pedido contiene el símbolo/código de moneda esperado. */
  async expectTotalContains(currencySymbol: string): Promise<void> {
    await expect(this.orderTotal).toBeVisible();
    await expect(this.orderTotal).toContainText(currencySymbol);
  }

  /** Hay al menos un item en el resumen del pedido. */
  async expectHasItems(): Promise<void> {
    await expect(this.orderItems.first()).toBeVisible();
  }
}
