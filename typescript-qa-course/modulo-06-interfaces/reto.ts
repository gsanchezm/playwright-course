// ============================================================
// 🚩 Reto FINAL QA - Módulo 6: "The Automation Contract"
// ============================================================
// Instrucciones:
// Crea interfaces y clases que las implementen.
// Ejecuta con: pnpm tsx modulo-06-interfaces/reto.ts
// ============================================================

// TODO 1: Crea una interfaz "WebActions" con los métodos:
//   - click(element: string): void
//   - getText(element: string): string


// TODO 2: Crea una clase "PlaywrightHelper" que IMPLEMENTE la interfaz WebActions
//   - click debe imprimir: "Simulating click in Playwright on: [element]"
//   - getText debe imprimir: "Getting text in Playwright from: [element]"
//     y retornar un string


// TODO 3: Crea una instancia de PlaywrightHelper y prueba ambos métodos
// Ejemplo:
//   const pw = new PlaywrightHelper();
//   pw.click("#login-btn");
//   const title = pw.getText("#page-title");


// --- EXTRA ---

// TODO 4: Crea una interfaz "UserResponse" con:
//   - id: number
//   - token: string


// TODO 5: Crea una función "startSession" que reciba un objeto
// de tipo UserResponse e imprima: "Session started with token: [token]"


// TODO 6: Prueba la función con un objeto que cumpla la interfaz
// Ejemplo: startSession({ id: 1, token: "abc123xyz" });
