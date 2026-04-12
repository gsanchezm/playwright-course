# 2.6 — Tuples

> **Módulo 2 · Tipos**

> **Analogía QA:** un par fijo "código HTTP + mensaje" de una respuesta. Una tupla tiene **cantidad** y **tipos** fijos en un orden específico — perfecto para representar un caso de prueba con valores esperados.

---

## ¿Qué aprendes?

- Cómo declarar una tupla y por qué no es lo mismo que un array.
- Cómo armar un arreglo de tuplas (tabla de casos de prueba).
- Cómo iterar un arreglo de tuplas con destructuring.

---

## Código

```ts
// @file modulo-02-types/06-tuples.ts
// Una tupla tiene CANTIDAD y TIPOS fijos en un orden específico.
let httpResponse: [number, string, boolean] = [404, "Not Found", true];
let loginResult: [boolean, string] = [true, "Login successful"];

console.log(`HTTP: ${httpResponse[0]} - ${httpResponse[1]}`);
console.log(`Login: passed=${loginResult[0]}, msg=${loginResult[1]}`);

// Arreglo de tuplas: una tabla de casos esperados.
let httpResponses: [number, string][] = [
  [200, "OK"],
  [201, "Created"],
  [400, "Bad Request"],
  [404, "Not Found"],
  [500, "Internal Server Error"],
];

httpResponses.forEach(([code, message], index) => {
  console.log(`Caso #${index + 1}: ${code} -> ${message}`);
});
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/06-tuples.ts
```

---

## Qué observar

- `httpResponse = ["Not Found", 404]` daría **error de compilación**: el orden importa.
- `httpResponse = [404]` también falla: faltan elementos.
- El destructuring `([code, message], index)` dentro de `forEach` es el patrón que usarás para tablas de casos de prueba (parameterized tests).

⬅️ Anterior: [2.5 arrays](/docs/typescript/m2-arrays)
