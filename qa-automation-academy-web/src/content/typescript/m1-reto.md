# 🚩 Reto — Módulo 1: "The First Check"

> **Módulo 1 · Hello World**

> **Analogía QA:** tu primera tarea es imprimir por consola en qué ambiente vas a lanzar la suite. Suena trivial, pero es EXACTAMENTE lo que un framework hace al arrancar un test run.

---

## Instrucciones

1. Crea una variable llamada `environment` con tipo `string` y valor `"QA"`.
2. Usa `console.log` con un template literal para imprimir: `Starting tests in QA`.
3. Corre el archivo y verifica el output en terminal.

---

## Plantilla

```ts
// @file modulo-01-hello-world/reto.ts
// 🚩 Reto QA - Módulo 1: "The First Check"

// TODO: Declara la variable "environment" con tipo string y valor "QA"


// TODO: Imprime en consola usando template literals:
//       `Starting tests in ${environment}`
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-hello-world/reto.ts
```

**Output esperado:**

```bash
Starting tests in QA
```

---

## Checklist de auto-corrección

- [ ] La variable usa `const` (no vas a reasignarla).
- [ ] El tipo está declarado explícitamente como `string`.
- [ ] El `console.log` usa backticks (`` ` ``) y `${environment}`, no concatenación con `+`.
- [ ] Al correrlo, NO aparece ningún error de TypeScript.

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Las variables con tipo se declaran así: `const nombre: tipo = valor;`
- Los template literals van entre backticks (`` ` ``), no comillas normales.
- Si ves `Cannot find name 'environment'`, revisa que hayas declarado la variable antes de usarla en el `console.log`.

</details>

---

⬅️ Anterior: [1.2 Variables](/docs/typescript/m1-variables) · ➡️ Siguiente: [2.1 boolean](/docs/typescript/m2-booleans)
