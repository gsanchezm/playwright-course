# 6.4 — Interfaz para funciones (`AssertionFn`)

> **Módulo 6 · Interfaces**

> **Analogía QA:** obligar a que **toda función de aserción** reciba la misma firma `(actual, expected) => boolean`. Así, todas las aserciones de tu framework son intercambiables y consistentes.

---

## ¿Qué aprendes?

- Que una interfaz **no solo tipa objetos**: también puede tipar la firma de una **función**.
- Cómo asignar una arrow function a un tipo de función y dejar que TypeScript infiera los argumentos.
- Cómo este patrón te permite mantener una **librería de aserciones** uniforme.

---

## Código

```ts
// @file modulo-06-interfaces/04-assertion-fn.ts
export interface AssertionFn {
  (actual: string, expected: string): boolean;
}

// La arrow function cumple el contrato de AssertionFn.
// Nota: no hace falta repetir los tipos en los parámetros, TS los infiere.
export const expectToEqual: AssertionFn = (actual, expected) => {
  const passed = actual === expected;
  console.log(`Assert: "${actual}" === "${expected}" → ${passed ? "PASSED" : "FAILED"}`);
  return passed;
};

expectToEqual("Hello", "Hello");
expectToEqual("200", "201");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-interfaces/04-assertion-fn.ts
```

---

## Qué observar

- La interfaz `AssertionFn` describe **una firma de función**, no un objeto. Cualquier función que reciba `(string, string)` y devuelva `boolean` la cumple.
- Al usar `const expectToEqual: AssertionFn = ...`, TS infiere los tipos de `actual` y `expected` automáticamente — menos ruido, mismo type-safety.
- Puedes crear un arreglo `const asserts: AssertionFn[] = [expectToEqual, expectContains, ...]` y ejecutarlo en bucle: todas las funciones cumplen el mismo contrato.

---

## Nota: `type` vs `interface`

- **`interface`**: objetos / clases, `extends`/`implements`, declaration merging.
- **`type`**: union types, intersecciones (`&`), primitivos, tuples.

Regla práctica: objetos y clases → `interface`; lo demás → `type`.

---

⬅️ Anterior: [6.3 implements WebActions](/docs/typescript/m6-web-actions) · ➡️ Siguiente: [🚩 Reto M6](/docs/typescript/m6-reto)
