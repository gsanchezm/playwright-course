# 2.5 — Arrays

> **Módulo 2 · Tipos**

> **Analogía QA:** listas de usuarios de prueba, códigos HTTP esperados, pasos de un caso de prueba, resultados de una suite… los arrays son la estructura más usada en automatización.

---

## ¿Qué aprendes?

- Cómo declarar arrays tipados (`string[]`, `number[]`).
- Iterar con `forEach` (usarás este patrón en cada test data-driven).
- Qué pasa si accedes a un índice que **no existe**.

---

## Código

```ts
let testUsers: string[] = [
  "admin@test.com",
  "viewer@test.com",
  "editor@test.com",
];
let responseCodes: number[] = [200, 201, 404, 500];

console.log(`Test users: ${testUsers.join(", ")}`);
console.log(`Cantidad de usuarios: ${testUsers.length}`);
testUsers.push("qa@test.com");

// Iterar con forEach: un caso de prueba por usuario.
testUsers.forEach((user, index) => {
  console.log(`Usuario #${index + 1}: ${user}`);
});

// Acceder a un índice que NO existe devuelve undefined en runtime.
let colors: string[] = ["red", "green", "blue"]; // 3 elementos
console.log(`Índice 3 (no existe): ${colors[3]}`); // undefined
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/05-arrays.ts
```

---

## Qué observar

- `testUsers[3]` devuelve `undefined` **en runtime** — TypeScript no lo marca como error por defecto. Si luego haces `colors[3].toUpperCase()`, el test explota.
- `forEach` recibe un callback con `(elemento, índice)`. Úsalo para lanzar el mismo test con distintos datos.
- Métodos útiles que verás mucho: `push`, `length`, `join`, `forEach`, `map`, `filter`.

⬅️ Anterior: [2.4 any](/docs/typescript/m2-any) · ➡️ Siguiente: [2.6 tuples](/docs/typescript/m2-tuples)
