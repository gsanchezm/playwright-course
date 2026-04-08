// ============================================================
// BasePage — la clase padre de todos los Page Objects
// ============================================================
// Analogía: Es como la "metodología de pruebas" de tu empresa.
// Todos los planes de prueba incluyen:
//   - Abrir el navegador
//   - Esperar que la página cargue
//   - Tomar screenshot si algo falla
//
// En vez de copiar esos pasos en CADA plan, los escribes UNA vez
// en una "guía base" y cada plan específico la referencia.
// ============================================================

import { Page, expect } from '@playwright/test';

export class BasePage {
  // "protected" permite que las subclases (LoginPage, HomePage, etc.)
  // accedan a "page", pero no el código externo.
  protected readonly page: Page;

  // La URL base de la página. Cada subclase la define.
  protected readonly url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  /**
   * Navegar a la URL de la página.
   * Analogía: Es como decir "abre el navegador y ve a la página X".
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  /**
   * Esperar a que la página termine de cargar.
   * Analogía: Es como esperar a que el spinner desaparezca antes
   * de empezar a interactuar.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Validar que el título contiene un texto.
   */
  async assertTitle(expected: RegExp | string): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  /**
   * Tomar un screenshot con un nombre descriptivo.
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}
