# 6.3 — `implements WebActions` (contrato + implementación)

> **Módulo 6 · Interfaces**

> **Analogía QA:** `WebActions` es el **contrato SRS** de qué debe saber hacer un helper de UI. `PlaywrightHelper` lo cumple. Al separar el contrato de la clase, tu **test depende del contrato (no de la herramienta)** — y mañana puedes cambiar Playwright por Selenium sin reescribir los tests.

---

## ¿Qué aprendes?

- La diferencia entre **`extends`** (herencia, una sola clase padre) e **`implements`** (cumplir un contrato, puedes implementar varios a la vez).
- Cómo estructurar un proyecto con la interfaz y la implementación **en archivos separados**.
- Cómo el contrato hace que tus helpers sean **intercambiables** (Playwright, Selenium, mock, etc.).

---

## Estructura

```
modulo-06-interfaces/03-web-actions/
├── WebActions.ts        → la interfaz (contrato)
├── PlaywrightHelper.ts  → la implementación con Playwright
└── index.ts             → el test que usa el contrato
```

---

## Código

```ts
// @file 03-web-actions/WebActions.ts
export interface WebActions {
  click(element: string): void;
  getText(element: string): string;
  isVisible(element: string): boolean;
}
```

```ts
// @file 03-web-actions/PlaywrightHelper.ts
import { WebActions } from "./WebActions";

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
```

```ts
// @file 03-web-actions/index.ts
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

addToCartFlow(new PlaywrightHelper());
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-interfaces/03-web-actions
```

---

## Qué observar

- Si en `PlaywrightHelper` olvidas implementar `isVisible`, el compilador lo marca **antes** de correr el test.
- `addToCartFlow(ui: WebActions)` te permite pasar un mock en pruebas unitarias y una implementación real en E2E — **sin tocar el flujo**.
- En un proyecto real, este patrón es el que permite migrar de Selenium a Playwright sin reescribir cientos de tests.

---

⬅️ Anterior: [6.2 Interfaces anidadas](/docs/typescript/m6-product-list) · ➡️ Siguiente: [6.4 Interfaz para funciones](/docs/typescript/m6-assertion-fn)
