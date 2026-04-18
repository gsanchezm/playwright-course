# 2.7 — Enums

> **Módulo 2 · Tipos**

> **Analogía QA:** un `enum` es un conjunto cerrado de opciones que **no deberían cambiar** — los ambientes de prueba (`QA / STAGING / PROD`) o los estados de un bug (`NEW / IN_PROGRESS / RESOLVED`). Te protege de escribir `"Prodd"` por error: el compilador se quejará antes de que el typo llegue al reporte.

---

## ¿Qué aprendes?

- Cómo declarar un **enum de strings** y usar sus miembros como valores válidos.
- Cómo declarar un **enum numérico** (por defecto inicia en 0 y auto-incrementa).
- Cómo usar el **reverse mapping** en enums numéricos para obtener el nombre desde el número.

---

## Código

```ts
// @file modulo-02-types/07-enums.ts
enum Environment {
  QA = "QA",
  STAGING = "STAGING",
  PROD = "PROD",
}

enum BugStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

let currentEnv: Environment = Environment.QA;
let bugState: BugStatus = BugStatus.NEW;

console.log(`Current environment: ${currentEnv}`);
console.log(`Bug status: ${bugState}`);

// Un enum protege contra typos: solo se aceptan los valores declarados.
// currentEnv = "DEV"; // ❌ Error: "DEV" no existe en Environment

// Enum numérico por defecto (comienza en 0 y se autoincrementa)
enum StatusCode {
  SUCCESS,       // 0
  NOT_FOUND,     // 1
  SERVER_ERROR,  // 2
}

let code: StatusCode = StatusCode.SUCCESS;
console.log(`SUCCESS = ${code}`);          // 0
console.log(`NOT_FOUND = ${StatusCode.NOT_FOUND}`); // 1

// Enum numérico con un valor inicial específico (auto-incrementa desde ahí)
enum Priority {
  LOW = 1,
  MEDIUM, // 2
  HIGH,   // 3
}

console.log(`LOW = ${Priority.LOW}`);
console.log(`HIGH = ${Priority.HIGH}`);

// Reverse Mapping: en enums numéricos puedes pasar el número y obtener el nombre
let textCode: string = StatusCode[0];
console.log(`StatusCode[0] = ${textCode}`); // "SUCCESS"

let priorityText: string = Priority[3];
console.log(`Priority[3] = ${priorityText}`); // "HIGH"
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/07-enums.ts
```

---

## Qué observar

- `currentEnv = "DEV"` **no compila**: el enum cierra el conjunto de valores posibles.
- En enums de **strings**, el valor coincide con el nombre — no hay reverse mapping.
- En enums **numéricos**, TypeScript crea automáticamente la inversa: `StatusCode[0]` te devuelve `"SUCCESS"`. Muy útil para loguear el nombre de un estado en un reporte.

---

⬅️ Anterior: [2.6 tuples](/docs/typescript/m2-tuples) · ➡️ Siguiente: [2.8 void](/docs/typescript/m2-void)
