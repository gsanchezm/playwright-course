# 4.1 — Objeto básico (sin tipo personalizado)

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** un **payload JSON** con los datos de un usuario de prueba. Sin un "contrato" (`type`), TypeScript infiere los tipos pero no puedes reutilizar esa forma en otros lugares.

---

## ¿Qué aprendes?

- Cómo declarar un **objeto literal** y acceder a sus propiedades con notación `.`.
- Qué es la **inferencia de tipos**: TypeScript adivina el tipo de cada campo sin que lo declares.
- Por qué la inferencia no basta cuando quieres reutilizar la misma forma en otros archivos.

---

## Código

```ts
// @file modulo-04-objects-types/01-basic-object.ts
const testUser = {
  name: "John Doe",
  age: 30,
  role: "admin",
};

console.log(`User: ${testUser.name}`);
console.log(`Role: ${testUser.role}`);
console.log(`Edad: ${testUser.age}`);

// Problema: si quieres otro usuario con la MISMA estructura,
// tendrías que repetir la forma. Solución → "type" (siguiente archivo).
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/01-basic-object.ts
```

---

## Qué observar

- TypeScript **infiere** que `testUser.name` es `string`, `testUser.age` es `number` y `testUser.role` es `string`.
- Si intentas `testUser.age = "treinta"` el compilador te lo marca, aunque no escribiste el tipo a mano.
- El problema aparece cuando quieres declarar un segundo usuario igual: tienes que **repetir** las claves y los tipos. Eso lo resuelve `type` en la siguiente mini-clase.

---

⬅️ Anterior: [🚩 Reto M3](/docs/typescript/m3-reto) · ➡️ Siguiente: [4.2 type alias](/docs/typescript/m4-type-alias)
