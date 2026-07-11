// ============================================================
// BasePage — clase base del Page Object Model (M03)
// ============================================================
// Analogía QA: plantilla genérica que todo Page hereda.
// "Toda pantalla tiene header, toast, y necesita un helper
// para resolver testids con sufijo de viewport."
//
// IMPORTANTE (M03): esta clase NO es abstracta — es una clase
// normal. La palabra `abstract` la veremos en M05 cuando tengamos
// varios servicios que la justifiquen.
//
// Convención: no instancies BasePage directamente. Extiéndela.
// ============================================================

import type { Page, Locator } from "@playwright/test";

export class BasePage {
  // `protected` — visible sólo para clases hijas (como herramientas
  // internas del equipo QA, no del cliente externo/tests).
  // `readonly` — el Page Object se amarra a una pestaña y no salta
  // a otra a mitad del TC (evita bugs de "¿por qué el assert corrió
  // en la pestaña equivocada?").
  constructor(protected readonly page: Page) {}

  /**
   * Helper viewport-aware para resolver testids de OmniPizza.
   *
   * OmniPizza añade sufijos "-desktop" (≥768px) o "-responsive"
   * (<768px) a sus testids. En vez de duplicar lógica en cada
   * Page hijo, la encapsulamos aquí.
   *
   * @param base — el testid base, ej. "username"
   * @returns Locator del testid con sufijo correcto
   */
  protected tid(base: string): Locator {
    const size = this.page.viewportSize();
    const suffix = size && size.width < 768 ? "-responsive" : "-desktop";
    return this.page.getByTestId(`${base}${suffix}`);
  }

  /**
   * Esperar a que la URL coincida con un patrón.
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
