// ============================================================
// CatalogPage — Page Object del catálogo de pizzas (/catalog)
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export type Category = "all" | "popular" | "veggie" | "meat" | "sides";

export class CatalogPage extends BasePage {
  readonly path = "/catalog";

  private cardPizza: string = "pizza-card-";
  private btnAddToCart: string = "add-to-cart-";
  private btnConfirmAddToCart: string = "confirm-add-to-cart";
  private btnCategory: string = "category-";
  private lblCartCount: string = "nav-cart-count";
  private lblPizzaPrice: string = "pizza-price-";

  // --- Locators privados ---
  private get pizzaCards(): Locator {
    // testids dinámicos: [data-testid^="pizza-card-"] es legítimo
    return this.page.locator(`[data-testid^="${this.cardPizza}"]`);
  }

  private get addToCartButtons(): Locator {
    return this.page.locator(`[data-testid^="${this.btnAddToCart}"]`);
  }

  private categoryButton(category: Category): Locator {
    return this.page.getByTestId(`${this.btnCategory}${category}`);
  }

  private get cartCount(): Locator {
    return this.page.getByTestId(this.lblCartCount);
  }

  // --- Acciones ---

  async waitForCatalog(): Promise<void> {
    await this.pizzaCards.first().waitFor({ state: "visible", timeout: 30_000 });
  }

  async selectCategory(category: Category): Promise<void> {
    await this.categoryButton(category).click();
  }

  async addFirstPizza(): Promise<void> {
    await this.addToCartButtons.first().click();
    // Agregar al carrito abre el modal "Customize Pizza". Elegir un
    // tamaño es REQUIRED: sin él, `confirm-add-to-cart` sigue
    // deshabilitado. Elegimos "medium" por defecto y confirmamos.
    await this.page.getByTestId("size-medium").click();
    await this.page.getByTestId(this.btnConfirmAddToCart).click();
  }

  /**
   * Abre el modal "Customize Pizza" de la primera pizza SIN confirmar.
   * Útil para demostrar la interacción con el popup (PizzaCustomizerModal).
   */
  async openCustomizerForFirst(): Promise<void> {
    await this.addToCartButtons.first().click();
  }

  /**
   * Precio de la primera pizza tal como lo pinta el market activo.
   * En SA vuelve en numerales árabes + `ر.س.`; útil para asserts de
   * moneda/RTL. testid `pizza-price-pNN` (sin sufijo de viewport).
   */
  async getFirstPizzaPrice(): Promise<string> {
    const price = this.page
      .locator(`[data-testid^="${this.lblPizzaPrice}"]`)
      .first();
    return (await price.innerText()).trim();
  }

  async getPizzaCount(): Promise<number> {
    return this.pizzaCards.count();
  }

  async getPizzaNames(): Promise<string[]> {
    const names: string[] = [];
    const cards = await this.pizzaCards.all();
    for (const card of cards) {
      const name = await card.getByRole("heading").first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  // --- Assertions ---

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/catalog/);
    await expect(this.pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  }

  async expectHasPizzas(): Promise<void> {
    const count = await this.pizzaCards.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectCartCount(n: number): Promise<void> {
    await expect(this.cartCount).toHaveText(String(n));
  }
}
