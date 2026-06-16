# 1.3 — Métodos básicos: test, search, match, replace, split

> **Módulo 1 · Fundamentos**

> **Analogía QA:** una regex es la "regla"; los métodos son las distintas **preguntas** que le haces, como las distintas aserciones de tu kit de testing. `test` → ¿pasa sí/no?; `search` → ¿en qué posición?; `match` → ¿qué capturó?; `replace` → corrige/normaliza; `split` → trocea por patrón.

---

## ¿Qué aprendes?

- `RegExp.test(texto)` → boolean: el veredicto sí/no.
- `String.search(regex)` → número: la posición del primer match (o `-1`).
- `String.match(regex)` → array o `null`: lo que capturó, incluyendo grupos.
- `String.replace(regex, …)` → string nuevo: normaliza sin mutar el original.
- `String.split(regex)` → array: trocea por un patrón, no por un char fijo.

Todos los ejemplos parten de la misma línea de log:

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
const linea = "test=checkout.spec.ts:42 status=failed";
```

---

## 1) `test()` → boolean (¿hay match? sí/no)

El veredicto binario. Lo más usado para validar "cumple / no cumple".

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
const reFailed = /status=failed/;
check("test(): la línea reporta status=failed", reFailed.test(linea), true);
```

---

## 2) `search()` → number (índice del primer match, o -1)

Como `indexOf`, pero con patrón. Devuelve la **posición**, no el texto. Si no hay match, devuelve `-1`.

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
check("search(): posición de 'status='", linea.search(/status=/), 25);
check("search(): patrón ausente devuelve -1", linea.search(/aborted/), -1);
```

---

## 3) `match()` → array o `null`

Sin flag `g`, devuelve `[coincidenciaCompleta, ...gruposCapturados]` o `null`. Aquí capturamos archivo y línea con dos **grupos** `( )`:

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
const reUbicacion = /(\w+\.spec\.ts):(\d+)/;
const m = linea.match(reUbicacion);
//   m[0] = coincidencia completa  → "checkout.spec.ts:42"
//   m[1] = grupo 1 (archivo)      → "checkout.spec.ts"
//   m[2] = grupo 2 (línea)        → "42"  (siempre STRING, aunque sean dígitos)
check("match(): coincidencia completa", m ? m[0] : null, "checkout.spec.ts:42");
check("match(): grupo 1 = archivo", m?.[1] ?? null, "checkout.spec.ts");
check("match(): grupo 2 = línea (string)", m?.[2] ?? null, "42");

// Sin coincidencia, match() devuelve null (NO un array vacío).
check("match(): sin coincidencia devuelve null", "abc".match(reUbicacion), null);
```

⚠️ `match()` puede ser `null`, así que **guárdalo antes de indexarlo** (`m ? ... : ...` o `m?.[1]`). Y recuerda: los grupos capturados son siempre **strings**, aunque sean dígitos.

---

## 4) `replace()` → string nuevo

Útil para **normalizar / sanear** datos antes de compararlos. `replace()` **no muta** el string original (los strings son inmutables); devuelve uno nuevo.

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
const corregida = linea.replace(/failed/, "passed");
check("replace(): cambia failed→passed", corregida, "test=checkout.spec.ts:42 status=passed");
// El original sigue intacto: prueba de que replace() no muta.
check("replace(): el original NO se mutó", linea.endsWith("status=failed"), true);
```

---

## 5) `split()` → array (trocea por el patrón)

Como parsear una línea CSV, pero el separador es un **patrón**, no un char fijo. Aquí partimos por "uno o más espacios en blanco" (`\s+`), robusto ante espacios dobles:

```ts
// @file regex-qa-course/modulo-01-fundamentos/03-metodos-basicos.ts
const partes = "test=checkout.spec.ts:42   status=failed".split(/\s+/);
check("split(): trocea por espacios", partes, ["test=checkout.spec.ts:42", "status=failed"]);
check("split(): devolvió 2 trozos", partes.length, 2);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-fundamentos/03-metodos-basicos.ts
```

---

## Qué observar

- `test()` es la pregunta más barata: solo `true`/`false`.
- `search()` da la **posición**; `match()` da el **contenido** capturado.
- `match()` devuelve `null` (no un array vacío) cuando no hay coincidencia — protégete antes de indexar.
- `replace()` y `split()` no mutan: trabajan sobre una copia.
- `\s+` en `split()` es más robusto que un espacio fijo: tolera espacios dobles.

⬅️ Anterior: [1.2 Crear una regex](/docs/regex/m1-crear-regex) · ➡️ Siguiente: [1.4 Literales y el punto](/docs/regex/m1-literales-y-punto)
