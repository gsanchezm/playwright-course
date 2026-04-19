// ============================================================
// CatalogPage — Page Object para /catalog de OmniPizza
// ============================================================

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  readonly path = '/catalog';

  // Locator prefijos — los testids dinámicos tienen prefijo estable
  private readonly pizzaCardPrefix = '[data-testid^="pizza-card-"]';
  private readonly addToCartPrefix = '[data-testid^="add-to-cart-"]';

  // ─── Locators ─────────────────────────────────────────────────

  private get pizzaCards(): Locator {
    return this.page.locator(this.pizzaCardPrefix);
  }

  private get addToCartButtons(): Locator {
    return this.page.locator(this.addToCartPrefix);
  }

  private categoryButton(category: 'all' | 'popular' | 'veggie' | 'meat' | 'sides'): Locator {
    return this.page.getByTestId(`category-${category}`);
  }

  private get cartCount(): Locator {
    return this.page.getByTestId('nav-cart-count');
  }

  // ─── ACCIONES ─────────────────────────────────────────────────

  async waitForCatalog() {
    // Esperar que al menos una tarjeta esté visible.
    await this.pizzaCards.first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async selectCategory(category: 'all' | 'popular' | 'veggie' | 'meat' | 'sides') {
    await this.categoryButton(category).click();
  }

  async addFirstPizza() {
    await this.addToCartButtons.first().click();
  }

  async pizzaCount(): Promise<number> {
    return await this.pizzaCards.count();
  }

  // ─── ASSERTIONS ───────────────────────────────────────────────

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/catalog/);
    await expect(this.pizzaCards.first()).toBeVisible();
  }

  async expectHasPizzas() {
    const n = await this.pizzaCards.count();
    expect(n).toBeGreaterThan(0);
  }

  async expectAddButtonCountMatchesPizzaCount() {
    const pizzas = await this.pizzaCards.count();
    const buttons = await this.addToCartButtons.count();
    expect(buttons).toBe(pizzas);
  }
}
