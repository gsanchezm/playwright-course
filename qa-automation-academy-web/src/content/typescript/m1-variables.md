# 1.2 — Variables básicas con tipo

> **Módulo 1 · Hello World**

> **Analogía QA:** una variable es como un campo dentro de tu reporte de pruebas: tiene un nombre y guarda un valor. Tipar la variable es igual que validar ese campo en un formulario — TypeScript no te deja guardar un número donde esperas un texto.

---

## ¿Qué aprendes?

- Diferencia entre `const` (no cambia) y `let` (sí cambia).
- Cómo declarar una variable con su tipo explícito.
- Por qué `const` es la elección por defecto.

---

## Código

```ts
// @file modulo-01-hello-world/02-variables.ts
// const = valor que NO cambia. Lo recomendado por defecto.
const suiteName: string = "Smoke Test Suite";
const totalTests: number = 5;

console.log(`Starting: ${suiteName}`);
console.log(`Total tests to run: ${totalTests}`);

// let para valores que SÍ cambian durante la prueba.
let testsExecuted: number = 0;
testsExecuted = testsExecuted + 1;
console.log(`Tests ejecutados: ${testsExecuted}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-hello-world/02-variables.ts
```

---

## Qué observar

- `const suiteName: string` obliga a que el valor sea un texto. Intentar asignarle un número da error en tiempo de compilación — el bug se caza antes de correr el test.
- `let` sí permite reasignar, pero el tipo declarado sigue aplicando.
- Los backticks (`` ` ``) permiten interpolar variables con `${...}` — perfecto para logs de tests.

⬅️ Anterior: [1.1 console.log](/docs/typescript/m1-console-log) · ➡️ Siguiente: [2.1 boolean](/docs/typescript/m2-booleans)
