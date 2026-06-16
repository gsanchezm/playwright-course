# 4.2 — Límites de palabra `\b` y `\B`

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** `\b` es el botón "coincidir palabra completa" de tu editor. Buscar `ERROR` sin él te resalta también `ERRORLEVEL` y `terror`; con `\bERROR\b` solo cae la palabra suelta. En logs eso es la diferencia entre "1 error real" y "47 falsos positivos".

---

## ¿Qué aprendes?

- Qué es un "borde de palabra" (`\b`) y su contrario, el "anti-borde" (`\B`).
- Cómo evitar falsos positivos al buscar palabras dentro de logs.
- A contar ocurrencias reales de una palabra suelta en un blob de texto.

---

## Concepto

- `\b` = "borde de palabra": la frontera entre un caracter de palabra `[A-Za-z0-9_]` y un NO-caracter de palabra (o el inicio/fin del texto).
- `\B` = lo contrario: una posición que **no** es borde de palabra.

Igual que `^` y `$`, son **posiciones** (cero ancho): no consumen letras.

---

## Código

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/02-limites-de-palabra.ts
const rePalabraSuelta = /\bERROR\b/;
const reSubcadena = /ERROR/;

// "ERRORLEVEL": entre la 'R' de ERROR y la 'L' NO hay borde (ambas son
// caracteres de palabra), así que \b después de "ERROR" NO existe ahí.
checkMatch(rePalabraSuelta, "ERRORLEVEL", false); // la lección del módulo
checkMatch(reSubcadena, "ERRORLEVEL", true); // sin \b sí "matchea" (falso positivo)

// "ERROR" suelta sí tiene bordes a ambos lados (inicio/fin de texto).
checkMatch(rePalabraSuelta, "ERROR", true);
// Rodeada de NO-letras también: en "[ERROR]" los corchetes son bordes.
checkMatch(rePalabraSuelta, "[ERROR] algo falló", true);
// Pegada a otra letra por la izquierda tampoco: "XERROR".
checkMatch(rePalabraSuelta, "XERROR", false);
```

---

## Contar palabras sueltas en un log real

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/02-limites-de-palabra.ts
// En el blob, la única ocurrencia es "[ERROR]". Los corchetes son
// no-palabra, así que \bERROR\b cae justo ahí. Con flag g contamos todas.
const reErrorGlobal = /\bERROR\b/g;
const erroresEncontrados = LOG_BLOB.match(reErrorGlobal); // string[] | null
check("hay matches de \\bERROR\\b en el blob", erroresEncontrados !== null, true);
check("ERROR aparece exactamente 1 vez", erroresEncontrados?.length ?? 0, 1);

// Contraste: WARN aparece 2 veces como palabra suelta ("[WARN]").
const warnsEncontrados = LOG_BLOB.match(/\bWARN\b/g);
check("WARN aparece exactamente 2 veces", warnsEncontrados?.length ?? 0, 2);
```

---

## `\B`: el "anti-borde" para fragmentos internos

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/02-limites-de-palabra.ts
// /\Bcat\B/ exige que "cat" esté rodeado de letras por AMBOS lados
// (en medio de una palabra), no como palabra suelta.
const reInterna = /\Bcat\B/;
checkMatch(reInterna, "education", true); // ...du[cat]ion... → cat interno
checkMatch(reInterna, "cat", false); // palabra suelta → tiene bordes, no \B
checkMatch(reInterna, "cats", false); // 'cat' al inicio → ^ es borde a la izq.
```

---

## Por qué importa en QA: `pass` vs `password`

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/02-limites-de-palabra.ts
// Buscar "pass" sin \b en un reporte resaltaría "password", "passed",
// "bypass"... \bpass\b solo cae en la palabra exacta "pass".
const rePass = /\bpass\b/;
checkMatch(rePass, "3 tests pass", true);
checkMatch(rePass, "wrong password", false);
checkMatch(rePass, "all tests passed", false);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/02-limites-de-palabra.ts
```

---

## Qué observar

- En `"ERRORLEVEL"` no hay borde entre la `R` y la `L`: ambas son caracteres de palabra, así que `\bERROR\b` **no** cae ahí.
- Los corchetes, espacios y signos cuentan como NO-palabra, por eso `[ERROR]` sí tiene bordes.
- `\B` es justo lo opuesto: útil para encontrar `cat` **dentro** de `education`, pero no como palabra suelta.
- Buscar `pass` sin `\b` resaltaría `password`, `passed`, `bypass`... un clásico generador de falsos positivos.

⬅️ Anterior: [4.1 Anclas](/docs/regex/m4-anclas) · ➡️ Siguiente: [4.3 Flags `i` y `g`](/docs/regex/m4-flags-i-g)
