// ============================================================
// CatalogPage — Page Object del catálogo de pizzas (/catalog)
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export type Category = "all" | "popular" | "veggie" | "meat" | "sides";

export class CatalogPage extends BasePage {
  readonly path = "/catalog";

  // --- Locators privados ---
  private get pizzaCards(): Locator {
    // testids dinámicos: [data-testid^="pizza-card-"] es legítimo
    return this.page.locator('[data-testid^="pizza-card-"]');
  }

  private get addToCartButtons(): Locator {
    return this.page.locator('[data-testid^="add-to-cart-"]');
  }

  private categoryButton(category: Category): Locator {
    return this.page.getByTestId(`category-${category}`);
  }

  private get cartCount(): Locator {
    return this.page.getByTestId("nav-cart-count");
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
