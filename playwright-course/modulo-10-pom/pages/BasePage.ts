// ============================================================
// BasePage — clase base del Page Object Model
// ============================================================
// Todos los Page Objects extienden BasePage y heredan:
//   - la referencia al `page` (la pestaña del navegador)
//   - métodos comunes de navegación y espera
//   - acceso al sufijo responsive/desktop (tid)
//
// Heredando de BasePage, cada LoginPage/CatalogPage/etc. se enfoca
// SOLO en su lógica específica.
// ============================================================

import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  // "protected" permite que las clases hijas usen `this.page`.
  constructor(protected readonly page: Page) {}

  // URL relativa de la página — cada hija decide la suya.
  abstract readonly path: string;

  // Navegar a la página (relativa al baseURL de playwright.config.ts)
  async goto() {
    await this.page.goto(this.path);
  }

  // Helper: resuelve el testid con el sufijo correcto según el viewport.
  // OmniPizza añade "-desktop" (≥768px) o "-responsive" (<768px).
  protected tid(base: string): Locator {
    const size = this.page.viewportSize();
    const suffix = size && size.width < 768 ? '-responsive' : '-desktop';
    return this.page.getByTestId(`${base}${suffix}`);
  }

  // Esperar a que la URL coincida con un patrón dado.
  async waitForUrl(pattern: RegExp, timeout = 15_000) {
    await this.page.waitForURL(pattern, { timeout });
  }

  // Tomar un screenshot (útil para debug/reporting custom).
  async screenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
