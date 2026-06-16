# 4.4 — Banderas `m` (multilínea) y `s` (dotAll)

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** un log multilínea es una hoja de cálculo de texto. `m` dice "trata cada LÍNEA como su propia fila" (`^` y `$` por línea). `s` dice lo opuesto: "ignora los saltos de línea, es todo UN párrafo" (el punto `.` también se traga los `\n`). Son herramientas OPUESTAS.

---

## ¿Qué aprendes?

- Cómo `m` cambia `^` y `$` para anclar al inicio/fin de **cada línea**.
- Cómo `s` (dotAll) hace que `.` también matchee el salto de línea `\n`.
- A parsear un blob de log línea por línea con `^...$` y `/m`.

---

## Flag `m`: `^` y `$` por línea

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/04-flags-m-s.ts
// Sin `m`, ^ es solo el inicio del TEXTO completo. Con `m`, ^ ancla al
// inicio de cada línea → podemos capturar cada timestamp de inicio de línea.
const reTimestampMul = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/gm;
const timestamps = LOG_BLOB.match(reTimestampMul); // string[] | null
check("con /m hay un timestamp por línea (6)", timestamps?.length ?? 0, 6);
check("primer timestamp", timestamps ? timestamps[0] : null, "2026-06-16T14:30:00Z");

// Sin `m`, ^ solo calza en el inicio del blob → 1 sola coincidencia.
const reTimestampSinM = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g;
const soloPrimero = LOG_BLOB.match(reTimestampSinM);
check("sin /m ^ solo ve el inicio del blob (1)", soloPrimero?.length ?? 0, 1);
```

---

## Parsear el log línea por línea con `^...$` y `/m`

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/04-flags-m-s.ts
// Con /m y $, podemos describir UNA línea completa: timestamp, [NIVEL]
// y el resto hasta el FIN DE LÍNEA. Como NO usamos `s`, el . NO cruza el
// "\n", así que ".*" se detiene al final de cada línea.
const reLinea = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) \[(\w+)\] (.*)$/gm;
const filas = [...LOG_BLOB.matchAll(reLinea)];
check("matchAll con /m devuelve 6 filas", filas.length, 6);
// La 4.ª línea (índice 3) es el ERROR del checkout:
const filaError = filas[3];
check("nivel de la 4ª línea", filaError[2], "ERROR");
check(
  "mensaje de la 4ª línea (.* se detuvo en el \\n)",
  filaError[3],
  "test 'checkout flow' failed: TimeoutError"
);
```

---

## Flag `s` (dotAll): el `.` también cruza `\n`

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/04-flags-m-s.ts
// MISMO patrón, resultado OPUESTO según la flag. Queremos abarcar desde
// "started" (1ª línea) hasta "finished" (última). Entre medio hay \n.
const reAbarca = /started.*finished/; // . NO cruza \n → falla en multilínea
const reAbarcaDotAll = /started.*finished/s; // s: . SÍ cruza \n → matchea todo

// Sin `s`: el . se topa con el primer "\n" y no puede continuar → no hay match.
checkMatch(reAbarca, LOG_BLOB, false);
// Con `s`: el . atraviesa los saltos de línea → matchea de inicio a fin.
checkMatch(reAbarcaDotAll, LOG_BLOB, true);

// Sobre un blob local mínimo:
const blobMini = "INICIO\nmedio\nFINAL";
check("sin s: . no cruza \\n", /INICIO.FINAL/.test(blobMini), false);
const conS = /INICIO.*FINAL/s.exec(blobMini); // RegExpExecArray | null
check("con s: . cruza \\n y captura todo", conS ? conS[0] : null, "INICIO\nmedio\nFINAL");
```

---

## `m` y `s` son independientes

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/04-flags-m-s.ts
// m → ^/$ por línea; s → . incluye \n. No se anulan, puedes combinarlas.
// "^[\s\S]*$" abarca todo el blob (clásico truco pre-dotAll: [\s\S] = "todo").
const todo = LOG_BLOB.match(/^[\s\S]*$/);
check("[\\s\\S]* abarca el blob completo", todo ? todo[0].length : -1, LOG_BLOB.length);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/04-flags-m-s.ts
```

---

## Qué observar

- Con `m`, `^` y `$` significan "inicio/fin de **cada línea**", no del texto completo: por eso aparecen 6 timestamps y no 1.
- Para parsear renglón por renglón quieres `/m` **sin** `s`, así `.*` se detiene en cada `\n`.
- `s` hace lo opuesto: `.` se traga los saltos de línea y puedes abarcar de la primera a la última línea.
- `m` y `s` son herramientas distintas e independientes: una cambia las anclas, la otra cambia el punto.

⬅️ Anterior: [4.3 Flags `i` y `g`](/docs/regex/m4-flags-i-g) · ➡️ Siguiente: [4.5 Flags `u` y `y`](/docs/regex/m4-flag-u-y-y)
