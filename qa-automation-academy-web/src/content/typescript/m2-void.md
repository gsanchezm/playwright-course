# 2.8 — void

> **Módulo 2 · Tipos**

> **Analogía QA:** una acción que **no devuelve nada**, como hacer click en un botón. La acción ocurre, pero no esperas un valor de vuelta — igual que `page.click()` en Playwright.

---

## ¿Qué aprendes?

- Qué significa el tipo de retorno `void`.
- Cuándo usarlo: funciones que solo ejecutan efectos (click, log, navigate).

---

## Código

```ts
// @file modulo-02-types/08-void.ts
function clickButton(selector: string): void {
  console.log(`Clicking on: ${selector}`);
  // No hay "return". La función solo ejecuta la acción.
}

clickButton("#submit-btn");
clickButton("#cancel-btn");

// void es el tipo de retorno por defecto de una función que no usa return.
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/08-void.ts
```

---

## Qué observar

- `void` ≠ `undefined`: `void` es un **contrato** ("esta función no produce valor útil"); `undefined` es un **valor** concreto.
- Si intentas hacer `const x = clickButton("#btn")`, TypeScript permite la asignación pero `x` es del tipo `void` — no puedes usarlo como si fuera algo.
- Los métodos de acción en un Page Object (click, fill, hover) casi siempre retornan `void` o `Promise<void>`.

---

⬅️ Anterior: [2.7 enums](/docs/typescript/m2-enums) · ➡️ Siguiente: [2.9 null y undefined](/docs/typescript/m2-null-undefined)
