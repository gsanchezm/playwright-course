# 3.4 — Arrow functions

> **Módulo 3 · Funciones**

> **Analogía QA:** una forma **abreviada** de escribir funciones simples. Perfectas para validaciones pequeñas dentro de un test (matchers, filtros, predicados).

---

## ¿Qué aprendes?

- La sintaxis `const nombre = (params) => expresion`.
- Por qué no necesitas `return` ni `{}` cuando la función es una sola expresión.
- Cuándo conviene una arrow function vs. una `function` tradicional.

---

## Código

```ts
// @file modulo-03-functions/04-arrow-functions.ts
// Versión clásica:
//   function isSuccessCode(code: number): boolean { return code >= 200 && code < 300; }

// Versión arrow (más corta):
export const isSuccessCode = (code: number): boolean =>
  code >= 200 && code < 300;

export const isClientError = (code: number): boolean =>
  code >= 400 && code < 500;

console.log(`200 es éxito: ${isSuccessCode(200)}`);
console.log(`404 es éxito: ${isSuccessCode(404)}`);
console.log(`404 es error de cliente: ${isClientError(404)}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-functions/04-arrow-functions.ts
```

---

## Qué observar

- Al ser una **única expresión**, no hace falta `{ return ... }`: la arrow retorna automáticamente.
- El tipo `(code: number): boolean` sigue siendo el contrato; la sintaxis cambia pero el type-check no.
- Úsalas para predicados en `.filter()`, `.map()`, `.some()`, `.every()` — es el estilo dominante en tests modernos.

---

⬅️ Anterior: [3.3 valores por defecto](/docs/typescript/m3-navigate) · ➡️ Siguiente: [3.5 funciones void](/docs/typescript/m3-void-functions)
