# 2.3 — string

> **Módulo 2 · Tipos**

> **Analogía QA:** URLs, mensajes de error, nombres de ambientes, selectores CSS… casi todo lo que ves en un test de automatización es un `string`.

---

## ¿Qué aprendes?

- Cómo declarar strings con tipo explícito.
- Template literals con backticks (`` ` ``) para interpolar variables en logs de tests.

---

## Código

```ts
let baseUrl: string = "https://qa.myapp.com";
let errorMessage: string = "Element not found";
let cssSelector: string = "#submit-btn";

console.log(`Base URL: ${baseUrl}`);
console.log(`Error: ${errorMessage}`);
console.log(`Selector: ${cssSelector}`);

// Template literals: interpolan variables con backticks y ${...}.
const testName: string = "Login válido";
const duration: number = 850;
console.log(`[PASSED] ${testName} en ${duration}ms`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/03-strings.ts
```

---

## Qué observar

- Los backticks permiten incrustar variables y expresiones con `${...}` sin concatenar con `+`.
- Este patrón es exactamente el que usarás para generar logs de tests y mensajes de assert.

⬅️ Anterior: [2.2 number](/docs/typescript/m2-numbers) · ➡️ Siguiente: [2.4 any](/docs/typescript/m2-any)
