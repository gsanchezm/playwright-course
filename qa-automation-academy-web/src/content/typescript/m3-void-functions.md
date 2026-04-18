# 3.5 — Funciones que no retornan nada (`void`)

> **Módulo 3 · Funciones**

> **Analogía QA:** loguear el resultado de un test **ejecuta la acción** de imprimir, pero no te devuelve ningún valor. Combinamos `login()` + `logTestResult()` para simular un test real end-to-end.

---

## ¿Qué aprendes?

- Cómo declarar una función con tipo de retorno `void`.
- Cómo **componer** funciones: una `void` que llama a otras para orquestar un flujo.
- El patrón `runXxxTest(...)` que usan frameworks reales (Jest, Playwright) por debajo.

---

## Código

```ts
// @file modulo-03-functions/05-void-functions.ts
import { login } from "./01-login";

export function logTestResult(testName: string, passed: boolean): void {
  const status = passed ? "PASSED" : "FAILED";
  console.log(`[${status}] ${testName}`);
}

// Caso de uso real: ejecuta un "test" completo usando las funciones
// de las mini-clases anteriores.
export function runLoginTest(
  testName: string,
  username: string,
  password: string
): void {
  const passed = login(username, password);
  logTestResult(testName, passed);
}

runLoginTest("Login con credenciales válidas", "admin", "Test1234!");
runLoginTest("Login con password vacío", "admin", "");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/05-void-functions.ts
```

---

## Qué observar

- `runLoginTest(...)` es `void` porque su objetivo es **orquestar** — no calcula un valor, ejecuta pasos.
- Este es el primer "mini-framework" del curso: `login()` decide, `logTestResult()` reporta, `runLoginTest()` coordina.
- En Playwright, los `test(...)` callbacks siempre retornan `Promise<void>` (la versión asíncrona de `void`) — misma idea, distinta sintaxis.

---

⬅️ Anterior: [3.4 arrow functions](/docs/typescript/m3-arrow-functions) · ➡️ Siguiente: [🚩 Reto M3](/docs/typescript/m3-reto)
