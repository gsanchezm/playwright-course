# 2.2 — number

> **Módulo 2 · Tipos**

> **Analogía QA:** códigos HTTP (200, 404, 500), tiempos de respuesta, cantidad de retries, número de tests ejecutados… todo lo que puedas contar o medir es un `number`.

---

## ¿Qué aprendes?

- Que TypeScript tiene **un solo** tipo para enteros y decimales: `number`.
- Cómo tipar mediciones reales del test (códigos, tiempos, contadores).

---

## Código

```ts
let statusCode: number = 200;
let responseTime: number = 1.35; // segundos
let retries: number = 3;

console.log(`Status: ${statusCode}`);
console.log(`Response time: ${responseTime}s`);
console.log(`Retries configurados: ${retries}`);

// TypeScript acepta enteros y decimales en el mismo tipo "number".
const totalTime: number = responseTime * retries;
console.log(`Tiempo total estimado: ${totalTime}s`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/02-numbers.ts
```

---

## Qué observar

- No existen tipos separados `int` y `float` como en otros lenguajes.
- Las operaciones aritméticas (`*`, `/`, `+`, `-`) funcionan sin casteos raros.

⬅️ Anterior: [2.1 boolean](/docs/typescript/m2-booleans) · ➡️ Siguiente: [2.3 string](/docs/typescript/m2-strings)
