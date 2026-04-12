# 2.1 — boolean

> **Módulo 2 · Tipos**

> **Analogía QA:** el resultado de tu caso de prueba: **PASSED** o **FAILED**. Sólo existen dos valores posibles: `true` o `false`.

---

## ¿Qué aprendes?

- Cómo declarar variables booleanas.
- Que las comparaciones (`===`, `!==`) también devuelven `boolean`.
- Por qué este tipo es la base de todo assert de automatización.

---

## Código

```ts
let testPassed: boolean = true;
let hasErrors: boolean = false;

console.log(`Test passed: ${testPassed}`);
console.log(`Tiene errores: ${hasErrors}`);

// Un boolean también puede venir de una comparación.
const expected: number = 200;
const actual: number = 200;
const assertionResult: boolean = expected === actual;
console.log(`Assertion (${expected} === ${actual}): ${assertionResult}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/01-booleans.ts
```

---

## Qué observar

- `assertionResult` no lo asignamos manualmente: TypeScript sabe que `===` devuelve `boolean`.
- En los tests reales, los asserts siempre terminan en un `boolean` — si es `false`, el test falla.

⬅️ Anterior: [1.2 Variables](/docs/typescript/m1-variables) · ➡️ Siguiente: [2.2 number](/docs/typescript/m2-numbers)
