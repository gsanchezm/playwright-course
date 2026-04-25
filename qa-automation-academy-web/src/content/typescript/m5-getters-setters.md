# 5.4 — Getters & Setters aplicados a un Test Case

> **Módulo 5 · Clases**

> **Analogía QA:** ejecutamos un Test Case real (**TC-042: Login y búsqueda con timeout configurado**) combinando los getters/setters heredados de `BasePage` con los métodos de `LoginPage` y `HomePage`. Es el cierre del módulo: los conceptos del POM aplicados a un script de automatización.

---

## ¿Qué aprendes?

- Cómo se accede a un **getter** (`page.timeout`) y a un **setter** (`page.timeout = 5000`) — la sintaxis es la de una propiedad, no la de un método.
- Que cada instancia tiene su propio estado: cambiar `loginPage.timeout` **no** afecta a `homePage.timeout`.
- Cómo encadenar `Page Objects` para escribir un test que se lee como una secuencia de pasos.

---

## Código

```ts
// @file modulo-05-classes/04-getters-setters.ts
import { LoginPage } from "./02-login-page";
import { HomePage } from "./03-home-page";

console.log("TC-042: Login y búsqueda con timeout configurado\n");

// SETUP: instanciamos los Page Objects apuntando al ambiente QA.
const loginPage = new LoginPage("https://qa.myapp.com");
const homePage = new HomePage("https://qa.myapp.com");

// STEP 1 — Precondición: validar configuración inicial (getters).
console.log("[Step 1] Verificar configuración inicial");
console.log(`  Base URL (read-only): ${loginPage.baseUrl}`);
console.log(`  Timeout default: ${loginPage.timeout}ms`);

// baseUrl es de SOLO LECTURA — descomenta para ver el error:
// loginPage.baseUrl = "https://hack.example.com"; // ❌ Cannot assign to 'baseUrl'

// STEP 2 — El setter rechaza valores inválidos (timeout negativo).
console.log("\n[Step 2] Intentar timeout inválido (-5000ms)");
loginPage.timeout = -5000; // rechazado por el setter
const rejectedOk = loginPage.timeout === 30000;
console.log(`  Timeout tras rechazo: ${loginPage.timeout}ms`);

// STEP 3 — Configurar timeout válido para el ambiente QA.
console.log("\n[Step 3] Configurar timeout válido (45000ms)");
loginPage.timeout = 45000;
const loginTimeoutOk = loginPage.timeout === 45000;

// STEP 4 — Ejecutar el login (usa internamente waitForLoad → respeta el timeout).
console.log("\n[Step 4] Ejecutar login");
loginPage.performLogin("admin", "Test1234!");

// STEP 5 — HomePage tiene su propio timeout, independiente del de loginPage.
console.log("\n[Step 5] Configurar HomePage con timeout corto (10000ms)");
homePage.timeout = 10000;
const homeTimeoutOk = homePage.timeout === 10000;
console.log(`  loginPage.timeout sigue siendo: ${loginPage.timeout}ms`);
console.log(`  homePage.timeout es: ${homePage.timeout}ms`);

// STEP 6 — Ejecutar búsqueda en HomePage.
console.log("\n[Step 6] Ejecutar búsqueda");
homePage.search("wireless keyboard");

// RESULTADO DEL TEST CASE
const testPassed = rejectedOk && loginTimeoutOk && homeTimeoutOk;
console.log(`\nTC-042 → ${testPassed ? "PASSED ✅" : "FAILED ❌"}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-classes/04-getters-setters.ts
```

---

## Qué observar

- En el **Step 2**, asignar un valor negativo no lanza una excepción — el setter lo rechaza y deja el valor anterior. Ese tipo de "fallo silencioso pero seguro" es típico en validaciones de POM.
- En el **Step 5**, `loginPage.timeout` y `homePage.timeout` son **independientes** porque cada instancia tiene su propio `_timeout`. Es el comportamiento que esperarías de cualquier objeto.
- El test final (`testPassed`) se construye con assertions explícitas (`rejectedOk`, `loginTimeoutOk`, `homeTimeoutOk`) — el mismo patrón que usarás con `expect()` en Playwright.

---

⬅️ Anterior: [5.3 HomePage](/docs/typescript/m5-home-page) · ➡️ Siguiente: [🚩 Reto M5](/docs/typescript/m5-reto)
