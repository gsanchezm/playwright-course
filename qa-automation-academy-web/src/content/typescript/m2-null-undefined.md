# 2.9 — null y undefined

> **Módulo 2 · Tipos**

> **Analogía QA:**
> - `null` → un campo que **intencionalmente dejaste vacío** (aún no se tomó la captura).
> - `undefined` → un campo al que **olvidaste asignarle valor**.

---

## ¿Qué aprendes?

- Cómo declarar un **Union Type** con `|` para permitir `null` o `undefined`.
- La diferencia semántica entre ambos valores.
- Una pista del tipo avanzado `never`.

---

## Código

```ts
// @file modulo-02-types/09-null-undefined.ts
// El tipo "string | null" significa: puede ser un string O null.
let screenshot: string | null = null; // todavía no se tomó la captura
console.log(`Screenshot: ${screenshot}`);

// Después de tomar la captura, asignamos la ruta.
screenshot = "/tmp/screenshot-001.png";
console.log(`Screenshot actual: ${screenshot}`);

// undefined: la variable existe pero no tiene valor asignado.
let uninitializedValue: string | undefined = undefined;
console.log(`Sin inicializar: ${uninitializedValue}`);

// --- Nota sobre "never" (concepto avanzado) ---
// El tipo "never" representa algo que NUNCA debe ocurrir,
// como una función que siempre lanza un error:
//   function fatalError(msg: string): never { throw new Error(msg); }
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-types/09-null-undefined.ts
```

---

## Qué observar

- Con `strict: true` en `tsconfig.json`, TypeScript **obliga** a incluir `null`/`undefined` en el tipo si los vas a usar. `let x: string = null` no compila.
- `string | null` es un **Union Type**: el primer ejemplo de algo que verás todo el tiempo en reportes de test (una evidencia que puede existir o aún no).
- Regla práctica: usa `null` cuando el vacío es **intencional** y `undefined` cuando aún no se ha asignado.

---

⬅️ Anterior: [2.8 void](/docs/typescript/m2-void) · ➡️ Siguiente: [🚩 Reto M2](/docs/typescript/m2-reto)
