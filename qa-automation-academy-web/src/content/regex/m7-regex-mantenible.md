# 7.4 — Regex mantenible (construir por partes, test-driven)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** nadie escribe un test gigante de 200 líneas sin nombres ni comentarios; lo divides en pasos legibles. Una regex monstruosa de una línea es **deuda técnica**: nadie se atreve a tocarla. La construimos por **piezas con nombre**, igual que armarías un Page Object: cada parte se entiende y se prueba sola, y luego las ensamblas.

---

## ¿Qué aprendes?

- Que JS **no** tiene flag `x` (verbose), y cuál es la alternativa idiomática.
- La trampa del **doble backslash** al usar `new RegExp(...)`.
- Cómo armar un patrón complejo desde **piezas con nombre** legibles y reutilizables.
- Un enfoque **test-driven**: define los casos primero, la regex después.

---

## JS NO tiene flag `x` (verbose), pero podemos comentar igual

En PCRE/Python existe la flag `x` que ignora espacios y permite comentarios **dentro** del patrón. JavaScript no la tiene: una regex literal `/.../` no admite comentarios ni espacios decorativos. La alternativa idiomática es construir el patrón desde **strings con nombre** y armarlo con `new RegExp(...)`. Así cada pieza lleva su comentario en el código.

---

## ⚠️ Trampa: el doble backslash en `new RegExp`

En una regex **literal** escribes `/\d/`. Pero dentro de un **string**, `"\d"` no es `\d`: JavaScript interpreta `"\d"` como una `'d'` (la barra se pierde). Para que el patrón vea `\d` debes escribir `"\\d"` en el string. **Regla: en `new RegExp` duplica cada `\`.**

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/04-regex-mantenible.ts
const malString = "\\d"; // CORRECTO: el string contiene los 2 caracteres \ y d
check("el string '\\\\d' tiene 2 caracteres", malString.length, 2);
check("new RegExp('\\\\d') matchea un dígito", new RegExp("^" + malString + "$").test("7"), true);
```

---

## Construir una fecha ISO por PIEZAS con nombre

Objetivo: validar `"YYYY-MM-DD"` con rangos reales (mes 01-12, día 01-31). En vez de un churro ilegible, nombramos cada parte (ojo a los `\\d`):

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/04-regex-mantenible.ts
const ANIO = "\\d{4}"; // 4 dígitos
const MES = "(0[1-9]|1[0-2])"; // 01..12
const DIA = "(0[1-9]|[12]\\d|3[01])"; // 01..31
const SEP = "-"; // separador literal

// Ensamblamos el patrón completo, anclado. Se LEE como la regla.
const patronFecha = `^${ANIO}${SEP}${MES}${SEP}${DIA}$`;
const reFechaISO = new RegExp(patronFecha);
```

---

## Enfoque TEST-DRIVEN: define los casos PRIMERO

Igual que TDD en código: escribes los ejemplos esperados (válidos e inválidos) y construyes/ajustas la regex hasta que **todos** pasan. Los casos son la **especificación viva**; la regex es la implementación.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/04-regex-mantenible.ts
const fechasValidas = ["2026-06-16", "2026-01-01", "2026-12-31"];
const fechasInvalidas = [
  "2026-13-01", // mes 13 fuera de rango
  "2026-00-10", // mes 00 inválido
  "2026-06-32", // día 32 fuera de rango
  "2026-6-1",   // sin cero a la izquierda
  "26-06-16",   // año de 2 dígitos
];
for (const f of fechasValidas) checkMatch(reFechaISO, f, true);
for (const f of fechasInvalidas) checkMatch(reFechaISO, f, false);
```

---

## Reusar piezas: armar OTRA regex con los mismos bloques

La gran ventaja de las piezas con nombre es la **reutilización**. Aquí armamos un "año-mes" (`YYYY-MM`, sin día) reusando `ANIO`, `SEP` y `MES`:

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/04-regex-mantenible.ts
const reAnioMes = new RegExp(`^${ANIO}${SEP}${MES}$`);
checkMatch(reAnioMes, "2026-06", true);
checkMatch(reAnioMes, "2026-13", false);    // reusa el rango de mes: 13 cae
checkMatch(reAnioMes, "2026-06-16", false); // tiene día: no calza año-mes
```

Las flags (`i`, `g`, `u`, `m`, `s`) van como **segundo argumento** string, útil cuando la regex es dinámica:

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/04-regex-mantenible.ts
const rePieza = "[A-Z]{2}-\\d{4}"; // 2 letras may + guion + 4 dígitos
const reSkuInsensible = new RegExp(`^${rePieza}$`, "i"); // 'i' → ignora mayús/minús
checkMatch(reSkuInsensible, "PZ-1234", true);
checkMatch(reSkuInsensible, "pz-1234", true); // gracias a la flag 'i'
```

---

## Qué observar

- JS no tiene `x`/verbose: la mantenibilidad la logras con **piezas con nombre** + `new RegExp`.
- Dentro de strings, **duplica cada `\`** (`"\\d"`, no `"\d"`).
- Define los **casos primero** (TDD); las piezas con nombre se **reusan** y se **revisan** sin miedo.

➡️ Siguiente: [7.5 Cuándo NO usar regex](/docs/regex/m7-cuando-no-usar-regex)
