// ============================================================
// features/catalog/catalog.page.ts — Page Object del catálogo (POM)
// ============================================================
// Analogía QA: el "mapa de navegación" de la pantalla de catálogo.
// Los tests NUNCA tocan locators directamente — sólo llaman métodos
// de negocio como selectCategory(), search() o addFirstPizza().
//
// POM: esta clase concentra los locators y las acciones de la
// pantalla. Extiende BasePage (Template Method) para reusar tid()
// y waitForUrl() sin reimplementarlos.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "../../core/BasePage";

// Categorías válidas del catálogo de OmniPizza (verificadas).
export type Category = "all" | "popular" | "veggie" | "meat" | "sides";

export class CatalogPage extends BasePage {
  // Ruta de la pantalla de catálogo.
  private readonly path = "/catalog";

  // Prefijos/testids base de OmniPizza (verificados).
  private readonly cardPizza = "pizza-card-";
  private readonly btnAddToCart = "add-to-cart-";
  private readonly btnConfirmAddToCart = "confirm-add-to-cart";
  private readonly btnCategory = "category-";
  private readonly txtSearch = "search-pizza";
  private readonly lblCartCount = "nav-cart-count";

  // --- Locators privados: documentación interna del Page ---

  // testids dinámicos: [data-testid^="pizza-card-"] es la única
  // excepción legítima a page.locator (el prefijo ES un testid).
  private get pizzaCards(): Locator {
    return this.page.locator(`[data-testid^="${this.cardPizza}"]`);
  }

  private get addToCartButtons(): Locator {
    return this.page.locator(`[data-testid^="${this.btnAddToCart}"]`);
  }

  // confirm-add-to-cart NO lleva sufijo → getByTestId directo.
  private get confirmAddButton(): Locator {
    return this.page.getByTestId(this.btnConfirmAddToCart);
  }

  // category-<c> NO lleva sufijo → getByTestId directo.
  private categoryButton(category: Category): Locator {
    return this.page.getByTestId(`${this.btnCategory}${category}`);
  }

  // search-pizza lleva sufijo de viewport → helper tid().
  private get searchInput(): Locator {
    return this.tid(this.txtSearch);
  }

  // nav-cart-count NO lleva sufijo y es condicional (ausente con
  // carrito vacío) → getByTestId directo.
  private get cartCount(): Locator {
    return this.page.getByTestId(this.lblCartCount);
  }

  // --- Acciones públicas: la interfaz del POM ---

  /** Navega a la pantalla de catálogo. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Espera a que el catálogo esté cargado (primera card visible). */
  async waitForCatalog(): Promise<void> {
    await this.pizzaCards.first().waitFor({ state: "visible", timeout: 30_000 });
  }

  /** Filtra el catálogo por categoría. */
  async selectCategory(category: Category): Promise<void> {
    await this.categoryButton(category).click();
  }

  /** Escribe un término en el buscador de pizzas. */
  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  /**
   * Agrega la primera pizza al carrito: click en add-to-cart y luego
   * confirma en el paso de confirmación.
   */
  async addFirstPizza(): Promise<void> {
    await this.addToCartButtons.first().click();
    await this.confirmAddButton.click();
  }

  /** Cuenta cuántas cards de pizza hay visibles. */
  async getPizzaCount(): Promise<number> {
    return this.pizzaCards.count();
  }

  /** Devuelve los nombres (h3) de cada card de pizza. */
  async getPizzaNames(): Promise<string[]> {
    const names: string[] = [];
    const cards = await this.pizzaCards.all();
    for (const card of cards) {
      const name = await card.getByRole("heading").first().textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  // --- Assertions de estado (web-first, sin sleeps) ---

  /** El catálogo cargó: URL correcta y primera card visible. */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/catalog/);
    await expect(this.pizzaCards.first()).toBeVisible({ timeout: 30_000 });
  }

  /** Hay al menos una pizza en el catálogo. */
  async expectHasPizzas(): Promise<void> {
    const count = await this.pizzaCards.count();
    expect(count).toBeGreaterThan(0);
  }
}
