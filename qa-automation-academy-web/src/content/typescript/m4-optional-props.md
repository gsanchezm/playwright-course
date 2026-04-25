# 4.3 — Propiedades opcionales (`?`)

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** un **bug report** donde algunos campos son obligatorios (id, título, severidad) y otros pueden faltar (assignee, screenshot). El `?` modela esa realidad sin tener que duplicar tipos.

---

## ¿Qué aprendes?

- Cómo marcar una propiedad como opcional con `?`.
- La diferencia entre `string | undefined` (opcional) y `string | null` (presente pero "vacío").
- Cómo el operador `??` da un valor por defecto cuando una propiedad opcional viene `undefined`.

---

## Código

```ts
// @file modulo-04-objects-types/03-optional-props/bug-report.type.ts
export type BugReport = {
  id: number;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee?: string;           // puede no estar asignado aún
  screenshot?: string | null;  // opcional Y puede ser null
};
```

```ts
// @file modulo-04-objects-types/03-optional-props/bugs.ts
import type { BugReport } from "./bug-report.type";

export const bug: BugReport = {
  id: 1042,
  title: "Submit button unresponsive on mobile",
  severity: "HIGH",
  // assignee se omite porque es opcional
  screenshot: null,
};
```

```ts
// @file modulo-04-objects-types/03-optional-props/index.ts
import { bug } from "./bugs";

console.log(`Bug #${bug.id}: ${bug.title} [${bug.severity}]`);
console.log(`Asignado a: ${bug.assignee ?? "sin asignar"}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/03-optional-props/index.ts
```

---

## Qué observar

- `severity` usa un **union de strings** (`"LOW" | "MEDIUM" | ...`) para limitar los valores aceptados — un mini-enum sin declarar `enum`.
- `assignee?: string` es equivalente a `assignee: string | undefined`, pero con `?` puedes **omitirlo** al construir el objeto.
- `bug.assignee ?? "sin asignar"` solo cae al default si el valor es `undefined` o `null`. Si fuera un string vacío `""` también caería; usa `||` solo cuando ese comportamiento te convenga.

---

⬅️ Anterior: [4.2 type alias](/docs/typescript/m4-type-alias) · ➡️ Siguiente: [4.4 union types](/docs/typescript/m4-union-types)
