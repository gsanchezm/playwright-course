# 4.4 — Union types (`|`)

> **Módulo 4 · Objetos y Tipos**

> **Analogía QA:** un campo que SOLO acepta ciertas opciones cerradas — como el estado de un test (`PASS | FAIL | SKIP`) o el estado de un botón en la UI (`enabled | disabled | loading`).

---

## ¿Qué aprendes?

- Cómo combinar varios tipos con `|` para crear un **union type**.
- La diferencia entre union de **primitivos** (`string | number | boolean`) y union de **literales** (`"enabled" | "disabled"`).
- Cómo `typeof` ayuda a "estrechar" (narrowing) un union dentro de una función.

---

## Código

```ts
// @file modulo-04-objects-types/04-union-types/api-result.type.ts
export type ApiResult = string | number | boolean;
```

```ts
// @file modulo-04-objects-types/04-union-types/button-state.type.ts
export type ButtonState = "enabled" | "disabled" | "loading";
```

```ts
// @file modulo-04-objects-types/04-union-types/process-result.ts
import type { ApiResult } from "./api-result.type";

export function processResult(result: ApiResult): void {
  console.log(`Result: ${result} (type: ${typeof result})`);
}
```

```ts
// @file modulo-04-objects-types/04-union-types/index.ts
import type { ButtonState } from "./button-state.type";
import { processResult } from "./process-result";

let submitButton: ButtonState = "enabled";
console.log(`Button state: ${submitButton}`);
submitButton = "loading";
console.log(`Button state: ${submitButton}`);
// submitButton = "invisible"; // ❌ Error: valor no permitido

processResult("Success");
processResult(200);
processResult(true);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-objects-types/04-union-types/index.ts
```

---

## Qué observar

- `ButtonState` es un union de **string literals**: cualquier valor fuera de la lista falla en compilación. Es la base de los enums "ligeros" en TypeScript moderno.
- `ApiResult` acepta tipos **distintos** entre sí. Dentro de `processResult`, si necesitaras llamar `.toUpperCase()` solo cuando `result` es string, usarías `if (typeof result === "string") { ... }` para hacer **narrowing**.
- Los union types son la herramienta natural para modelar respuestas de API que vienen con varias formas posibles.

---

⬅️ Anterior: [4.3 propiedades opcionales](/docs/typescript/m4-optional-props) · ➡️ Siguiente: [4.5 intersection types](/docs/typescript/m4-intersection)
