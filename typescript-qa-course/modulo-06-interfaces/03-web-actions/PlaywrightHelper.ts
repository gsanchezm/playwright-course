import { WebActions } from "./WebActions";

// ============================================================
// Implementación concreta con Playwright.
// ============================================================
// Una versión real usaría `@playwright/test` y recibiría un
// objeto `page`. Aquí simulamos las llamadas para mantener el
// foco en cómo la clase cumple el contrato WebActions.
// ============================================================

export class PlaywrightHelper implements WebActions {
  click(element: string): void {
    console.log(`[Playwright] page.locator("${element}").click()`);
  }

  getText(element: string): string {
    console.log(`[Playwright] page.locator("${element}").innerText()`);
    return `Text of ${element}`;
  }

  isVisible(element: string): boolean {
    console.log(`[Playwright] page.locator("${element}").isVisible()`);
    return true;
  }
}
