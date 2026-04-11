// ============================================================
// Mini-clase 6.3: Interfaz + implementación en archivos separados
// ============================================================
// Analogía: WebActions es el "contrato SRS" de qué debe saber
// hacer un helper de UI. PlaywrightHelper lo cumple. Al separar
// el contrato de la clase, tu test depende del contrato (no de
// la clase), lo que lo hace más fácil de mantener y de mockear.
//
// Estructura del ejemplo (carpeta 03-web-actions/):
//   - WebActions.ts       → la interfaz (contrato)
//   - PlaywrightHelper.ts → la implementación con Playwright
//   - index.ts            → el test que usa el contrato
// ============================================================

import { WebActions } from "./WebActions";
import { PlaywrightHelper } from "./PlaywrightHelper";

// El test recibe "cualquier cosa que cumpla WebActions".
// No le importa cómo esté implementado por debajo.
function addToCartFlow(ui: WebActions): void {
  ui.click("#add-to-cart");
  const title = ui.getText("#product-title");
  console.log(`   → product title: ${title}`);
  console.log(`   → checkout visible: ${ui.isVisible("#checkout-btn")}`);
}

console.log("\n===== 6.3 implements WebActions =====");

console.log("→ Flujo Add-to-Cart con PlaywrightHelper");
addToCartFlow(new PlaywrightHelper());
