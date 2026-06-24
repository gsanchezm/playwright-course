// ============================================================
// CatalogPage — Page Object del catálogo de pizzas (/catalog)
// ============================================================
// Mismas técnicas que LoginPage: DRY, 2 formas de locator y Fluent
// encadenable. Las ACCIONES devuelven `this` (encolan); las QUERIES
// (getPizzaCount/getPizzaNames) terminan la cadena devolviendo DATOS.
//
// Nota: el catálogo no tiene inputs de texto, así que `typeInput` no
// aplica; las "2 formas" se ven a nivel de locator.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export type Category = "all" | "popular" | "veggie" | "meat" | "sides";

export class CatalogPage extends BasePage {
  readonly path = "/catalog";

  // --- Forma A: testids como string (incluye prefijos dinámicos) ---
  private readonly cardPrefix = "pizza-card-";
  private readonly addToCartPrefix = "add-to-cart-";
  private readonly categoryPrefix = "category-";
  private readonly cartCountId = "nav-cart-count";

  // --- Forma B: los mismos locators como getters `Locator` ---
  private get pizzaCards(): Locator {
    // testids dinámicos: [data-testid^="pizza-card-"] es legítimo
    return this.page.locator(`[data-testid^="${this.cardPrefix}"]`);
  }

  private get addToCartButtons(): Locator {
    return this.page.locator(`[data-testid^="${this.addToCartPrefix}"]`);
  }

  private get cartCount(): Locator {
    return this.page.getByTestId(this.cartCountId);
  }

  private categoryButton(category: Category): Locator {
    return this.page.getByTestId(`${this.categoryPrefix}${category}`);
  }

  // --- Acciones encadenables (devuelven `this`) ---

  waitForCatalog(): this {
    return this.step(() => this.pizzaCards.first().waitFor({ state: "visible", timeout: 30_000 }));
  }

  selectCategory(category: Category): this {
    return this.step(() => this.categoryButton(category).click());
  }

  addFirstPizza(): this {
    return this.step(() => this.addToCartButtons.first().click());
  }

  // --- Queries: TERMINAN la cadena devolviendo DATOS (no `this`) ---

  getPizzaCount(): Promise<number> {
    return this.query(() => this.pizzaCards.count());
  }

  getPizzaNames(): Promise<string[]> {
    return this.query(async () => {
      const names: string[] = [];
      const cards = await this.pizzaCards.all();
      for (const card of cards) {
        const name = await card.getByRole("heading").first().textContent();
        if (name) names.push(name.trim());
      }
      return names;
    });
  }

  // --- Assertions encadenables ---

  expectLoaded(): this {
    return this.step(async () => {
      await expect(this.page).toHaveURL(/\/catalog/);
      await expect(this.pizzaCards.first()).toBeVisible({ timeout: 30_000 });
    });
  }

  expectHasPizzas(): this {
    return this.step(async () => {
      const count = await this.pizzaCards.count();
      expect(count).toBeGreaterThan(0);
    });
  }

  expectCartCount(n: number): this {
    return this.step(() => expect(this.cartCount).toHaveText(String(n)));
  }
}
