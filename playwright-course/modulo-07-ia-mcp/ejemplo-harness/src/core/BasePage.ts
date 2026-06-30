// ============================================================
// core/BasePage.ts — base del Page Object Model (TEMPLATE METHOD)
// ============================================================
// Analogía QA: la plantilla genérica que todo Page hereda.
// "Toda pantalla necesita un helper para resolver testids con
// sufijo de viewport, esperar una URL y sacar screenshots."
//
// TEMPLATE METHOD: BasePage define el esqueleto reutilizable
// (tid/waitForUrl/screenshot); cada Page concreto rellena los
// pasos específicos (sus locators y acciones de negocio).
//
// Convención: no instancies BasePage directamente. Extiéndela.
// ============================================================

import type { Page, Locator } from "@playwright/test";

export class BasePage {
  // `protected readonly`: visible sólo para los Page hijos y amarrado
  // a una pestaña (evita que un assert corra en la pestaña equivocada).
  constructor(protected readonly page: Page) {}

  /**
   * Helper viewport-aware para resolver testids de OmniPizza.
   * La app añade "-desktop" (≥768px) o "-responsive" (<768px) a
   * muchos testids; lo encapsulamos aquí para no repetir lógica.
   *
   * @param base — testid base, ej. "username"
   */
  protected tid(base: string): Locator {
    const size = this.page.viewportSize();
    const suffix = size && size.width < 768 ? "-responsive" : "-desktop";
    return this.page.getByTestId(`${base}${suffix}`);
  }

  /**
   * Espera a que la URL coincida con un patrón (web-first, sin sleeps).
   */
  protected async waitForUrl(pattern: RegExp, timeout = 15_000): Promise<void> {
    await this.page.waitForURL(pattern, { timeout });
  }

  /**
   * Screenshot con nombre semántico para debug.
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}
