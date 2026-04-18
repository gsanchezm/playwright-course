# 🚩 Reto — Módulo 2: "Defining the Dataset"

> **Módulo 2 · Tipos**

> **Analogía QA:** vas a modelar un **Bug Report** usando los tipos del módulo. Cada campo que escribirías en Jira (ID, descripción, severidad, evidencia) tiene su tipo de TypeScript correspondiente.

---

## Instrucciones

1. Declara `bugId` como `number` con un valor correlativo.
2. Declara `description` como `string` con el título del bug.
3. Declara `isResolved` como `boolean`.
4. Crea un `enum Severity` con `LOW`, `MEDIUM`, `HIGH` y una variable `bugSeverity` de ese tipo.
5. Declara `reproductionSteps` como `string[]` con al menos 3 pasos.
6. Declara `evidence` como `string | null` (aún sin captura).
7. Imprime todas las variables en consola de forma legible.

---

## Plantilla

```ts
// @file modulo-02-types/reto.ts
// 🚩 Reto QA - Módulo 2: "Defining the Dataset"

// TODO 1: Declara "bugId" como número con un valor correlativo
// Ejemplo: let bugId: number = ...;


// TODO 2: Declara "description" como string con el título del bug


// TODO 3: Declara "isResolved" como boolean


// TODO 4: Crea un Enum llamado "Severity" con opciones: LOW, MEDIUM, HIGH
// y declara una variable "bugSeverity" de ese tipo


// TODO 5: Declara "reproductionSteps" como un array de strings
// con al menos 3 pasos para reproducir el bug


// TODO 6: Declara "evidence" como string | null
// (null porque aún no hay captura de pantalla)


// TODO 7: Imprime todas las variables en consola de forma legible
// Ejemplo: console.log(`Bug #${bugId}: ${description}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/reto.ts
```

---

## Checklist de auto-corrección

- [ ] Todas las variables tienen **tipo explícito** declarado.
- [ ] `Severity` es un `enum` (no un array ni un objeto).
- [ ] `reproductionSteps` tiene al menos 3 strings.
- [ ] `evidence` arranca en `null` y puede cambiar a un path más adelante.
- [ ] El output del `console.log` es legible (usa template literals con `${}`).

---

## Pistas (sólo si te atoras)

<details>
<summary>Ver pistas</summary>

- Un enum se declara así: `enum Nombre { OPCION_A = "A", OPCION_B = "B" }`.
- Un array tipado se declara `let arr: string[] = ["a", "b"]`.
- Para `string | null`, inicialízala con `null` y después podrás asignarle una ruta tipo `"/tmp/shot.png"`.

</details>

---

⬅️ Anterior: [2.9 null y undefined](/docs/typescript/m2-null-undefined) · ➡️ Siguiente: [3.1 función login](/docs/typescript/m3-login)
