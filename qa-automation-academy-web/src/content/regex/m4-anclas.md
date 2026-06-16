# 4.1 — Anclas `^` y `$`

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** sin anclas, una regex es un detector de metales que pita si encuentra UNA moneda en tu maleta. Con `^` y `$` es el control de aduana que abre TODA la maleta y exige que NADA más esté dentro. Un validador sin anclas pasa "por las razones equivocadas".

---

## ¿Qué aprendes?

- La diferencia entre "contiene" (`/\d+/`) y "es exactamente" (`/^\d+$/`).
- Por qué un validador sin anclas produce falsos positivos en QA.
- Que `^` y `$` son **posiciones** (cero ancho): no consumen caracteres.

---

## Concepto

- `^` = inicio del texto (o de línea, con la flag `m` — lo verás en 4.4).
- `$` = fin del texto (o de línea, con la flag `m`).

Por sí solas no consumen ningún caracter: marcan **una posición**, no una letra.

---

## Código

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/01-anclas.ts
// ^  = inicio del texto (o de línea, con flag m — ver 4.4)
// $  = fin del texto    (o de línea, con flag m — ver 4.4)
// Por sí solas no consumen ningún caracter: son POSICIONES, no letras.

// El BUG de validación clásico: "contiene un número" vs "ES un número"
const reContiene = /\d+/; // "contiene al menos un dígito"
const reEsExacto = /^\d+$/; // "el texto COMPLETO son solo dígitos"

// Mismo input, dos veredictos opuestos: ahí vive el bug.
check("/\\d+/ .test('abc123') (contiene)", reContiene.test("abc123"), true);
check("/^\\d+$/ .test('abc123') (exacto)", reEsExacto.test("abc123"), false);

// Con un input que SÍ es solo dígitos, ambas coinciden.
check("/\\d+/ .test('12345')", reContiene.test("12345"), true);
check("/^\\d+$/ .test('12345')", reEsExacto.test("12345"), true);
```

El input `"abc123"` **contiene** `"123"`, así que `/\d+/.test()` devuelve `true`. Eso parece validación... pero NO lo es: un campo "cantidad" aceptaría `"abc123"`.

---

## Anclar texto literal

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/01-anclas.ts
// /PROD/ matchea "PRODUCTION" (lo contiene). /^PROD$/ exige el dato exacto.
const reAmbienteFlojo = /PROD/;
const reAmbienteEstricto = /^PROD$/;
checkMatch(reAmbienteFlojo, "PRODUCTION", true); // contiene "PROD"
checkMatch(reAmbienteEstricto, "PRODUCTION", false); // no es exactamente "PROD"
checkMatch(reAmbienteEstricto, "PROD", true);
// Trampa de espacios: "PROD " (con espacio final) NO es exactamente "PROD".
checkMatch(reAmbienteEstricto, "PROD ", false);
```

---

## Las anclas no aparecen en lo capturado

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/01-anclas.ts
// match() de /^\d+$/ sobre "12345" devuelve la cadena entera, sin que
// las anclas añadan caracteres.
const m = "12345".match(/^\d+$/);
check("match no es null", m !== null, true);
check("lo capturado es el texto completo", m ? m[0] : null, "12345");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/01-anclas.ts
```

---

## Qué observar

- `/\d+/` pregunta "¿hay en ALGÚN lugar uno o más dígitos?"; `/^\d+$/` exige que el **texto completo** sea solo dígitos.
- Sin anclas, los inputs "casi válidos" (`"abc123"`, `"12px"`) pasan como **falsos positivos**.
- `^` y `$` no añaden caracteres a la coincidencia: son posiciones, no letras.
- Cuidado con los espacios al final: `"PROD "` NO es exactamente `"PROD"`.

➡️ Siguiente: [4.2 Límites de palabra](/docs/regex/m4-limites-de-palabra)
