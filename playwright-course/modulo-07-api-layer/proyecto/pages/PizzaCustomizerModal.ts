// ============================================================
// PizzaCustomizerModal — Page Object del popup "Customize Pizza"
// ============================================================
// Analogía QA: un modal/popup es una "sub-pantalla" que se monta
// encima de la actual. Merece su propio Page Object.
//
// 🎯 Técnica que enseña: cómo automatizar un MODAL. Dos detalles
//    clave del de OmniPizza:
//
//    1. NO expone role="dialog" — así que NO sirve
//       getByRole("dialog"). Nos anclamos por testids del modal.
//    2. "Choose Size" se marca REQUIRED en la UI, pero el botón
//       `confirm-add-to-cart` NO nace deshabilitado (verificado en
//       vivo). Buena lección de QA: un "requerido" visual no siempre
//       bloquea el submit — verifícalo, no lo asumas.
//
// Se abre al hacer clic en `add-to-cart-*` del catálogo (ver
// CatalogPage.openCustomizerForFirst()).
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export type PizzaSize = "small" | "medium" | "large" | "family";

export class PizzaCustomizerModal extends BasePage {
  private btnClose: string = "customizer-close";
  private btnSize: string = "size-";
  private chipTopping: string = "topping-";
  private lblPrice: string = "customizer-price";
  private btnConfirm: string = "confirm-add-to-cart";

  // --- Locators privados ---
  private sizeButton(size: PizzaSize): Locator {
    return this.page.getByTestId(`${this.btnSize}${size}`);
  }

  private toppingChip(name: string): Locator {
    return this.page.getByTestId(`${this.chipTopping}${name}`);
  }

  private get priceLabel(): Locator {
    return this.page.getByTestId(this.lblPrice);
  }

  private get confirmButton(): Locator {
    return this.page.getByTestId(this.btnConfirm);
  }

  private get closeButton(): Locator {
    return this.page.getByTestId(this.btnClose);
  }

  // --- Acciones ---

  async selectSize(size: PizzaSize): Promise<void> {
    await this.sizeButton(size).click();
  }

  /** Alterna un topping (chip). Ej: "pepperoni", "mushrooms", "bacon". */
  async toggleTopping(name: string): Promise<void> {
    await this.toppingChip(name).click();
  }

  async getPrice(): Promise<string> {
    return (await this.priceLabel.innerText()).trim();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  // --- Assertions ---

  async expectOpen(): Promise<void> {
    // Sin role="dialog": nos anclamos a un testid propio del modal.
    await expect(this.confirmButton).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    await expect(this.confirmButton).toBeHidden();
  }
}
