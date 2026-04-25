# 4.5 — Intersection types (`&`)

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** combinar dos contratos en uno solo. "Es un `BugReport`" **Y TAMBIÉN** "tiene timestamps". Un `TrackedBug` cumple ambos a la vez.

---

## ¿Qué aprendes?

- Cómo unir dos tipos con `&` para crear un nuevo tipo que cumple **ambos** contratos.
- La diferencia conceptual con un **union (`|`)**: aquí no es "uno u otro", es "los dos a la vez".
- Cómo reutilizar un tipo existente (`BugReport` de la mini-clase 4.3) sin tener que reescribirlo.

---

## Código

```ts
// @file modulo-04-objects-types/05-intersection/timestamp.type.ts
export type HasTimestamp = {
  createdAt: string;
  updatedAt: string;
};
```

```ts
// @file modulo-04-objects-types/05-intersection/tracked-bug.type.ts
import type { BugReport } from "../03-optional-props/bug-report.type";
import type { HasTimestamp } from "./timestamp.type";

// Intersection: el tipo resultante cumple AMBOS contratos.
export type TrackedBug = BugReport & HasTimestamp;
```

```ts
// @file modulo-04-objects-types/05-intersection/tracked-bugs.ts
import type { TrackedBug } from "./tracked-bug.type";

export const trackedBug: TrackedBug = {
  id: 2001,
  title: "Cart total shows negative value",
  severity: "CRITICAL",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T14:00:00Z",
};
```

```ts
// @file modulo-04-objects-types/05-intersection/index.ts
import { trackedBug } from "./tracked-bugs";

console.log(`Tracked bug: #${trackedBug.id}`);
console.log(`Creado: ${trackedBug.createdAt}`);
console.log(`Actualizado: ${trackedBug.updatedAt}`);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/05-intersection/index.ts
```

---

## Qué observar

- `HasTimestamp` se diseña como un **mixin**: un tipo pequeño y reutilizable que se combina con otros mediante `&`.
- `TrackedBug` necesita **todas** las propiedades de `BugReport` (id, title, severity, ...) **y** todas las de `HasTimestamp`. Si faltara una sola, TypeScript marcaría error.
- Es el patrón natural para modelar entidades que vienen del backend con campos comunes (`createdAt`, `updatedAt`, `id`, ...) que se mezclan con datos específicos por dominio.

---

⬅️ Anterior: [4.4 union types](/docs/typescript/m4-union-types) · ➡️ Siguiente: [🚩 Reto M4](/docs/typescript/m4-reto)
