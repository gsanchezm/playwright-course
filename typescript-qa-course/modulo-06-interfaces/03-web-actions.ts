// ============================================================
// Mini-clase 6.3: Interfaz con métodos + implements
// ============================================================
// Analogía: Un contrato SRS que obliga a cualquier helper de
// automatización a tener estos 3 métodos. Si falta alguno,
// TypeScript marca error.
// ============================================================

export interface WebActions {
  click(element: string): void;
  getText(element: string): string;
  isVisible(element: string): boolean;
}

// "implements" obliga a la clase a cumplir TODO el contrato.
export class PlaywrightHelper implements WebActions {
  click(element: string): void {
    console.log(`[Playwright] Clicking on: ${element}`);
  }

  getText(element: string): string {
    console.log(`[Playwright] Getting text from: ${element}`);
    return `Text of ${element}`;
  }

  isVisible(element: string): boolean {
    console.log(`[Playwright] Checking visibility of: ${element}`);
    return true;
  }
}

console.log("\n===== 6.3 implements WebActions =====");
const pwDemo = new PlaywrightHelper();
pwDemo.click("#add-to-cart");
const pwText = pwDemo.getText("#product-title");
console.log(`Got text: ${pwText}`);
console.log(`Visible: ${pwDemo.isVisible("#checkout-btn")}`);
