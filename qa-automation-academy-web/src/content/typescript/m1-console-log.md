# 1.1 — console.log

> **Módulo 1 · Hello World**

> **Analogía QA:** escribir un caso de prueba manual y ver en consola que el resultado esperado coincide con el real. `console.log` es tu primera herramienta de depuración.

---

## ¿Qué aprendes?

- Cómo imprimir valores en la terminal.
- Por qué `console.log` es tu mejor amigo al empezar a automatizar.

---

## Código

```ts
// @file modulo-01-hello-world/01-console-log.ts
// Mini-clase 1.1: Nuestro primer "Test" con console.log
console.log("\n===== 1.1 console.log =====");

// console.log() es la forma más simple de "imprimir" un resultado.
// Lo usarás mucho para depurar tus tests de automatización.
console.log("Hello, Automation!");

// Puedes imprimir varios valores en la misma línea.
console.log("Test ejecutado correctamente");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-hello-world/01-console-log.ts
```

---

## Qué observar

- Cada `console.log` imprime una línea nueva.
- El argumento puede ser un string, un número, un objeto… lo que sea.
- Más adelante usarás `console.log` para imprimir los pasos de un test fallido y saber dónde murió.

➡️ Siguiente: [1.2 Variables](/docs/typescript/m1-variables)
