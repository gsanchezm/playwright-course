# 5.1 — Lookahead positivo `(?=...)`

> **Módulo 5 · Lookaround**

> **Analogía QA:** verificar que un botón **existe** en la página antes de hacer clic, pero **sin** hacer clic en él. El lookahead afirma "esto debe ir seguido de X" para confirmar el contexto, pero no toca (no consume) ese X.

---

## ¿Qué aprendes?

- Qué es una **aserción de ancho cero**: un patrón que comprueba el contexto pero **no consume** caracteres.
- Cómo usar `(?=...)` para extraer un valor sin llevarte lo que viene después.
- Cómo el lookahead es la base de las validaciones compuestas (la política de contraseñas de la clase 5.4).

---

## Concepto

Un lookahead `(?=...)` **NO consume caracteres**: comprueba que lo que viene a continuación cumple un patrón, pero deja el cursor donde estaba. Es como un `assert` sin efecto secundario: verifica y sigue. El texto que matchea `(?=...)` **NO aparece** en el resultado de `.match()`.

---

## Código

```ts
// @file regex-qa-course/modulo-05-lookaround/01-lookahead-positivo.ts
// 1) "Un número SEGUIDO de px" — extraer el número, NO la unidad
// Queremos el "16" de "16px", pero sin llevarnos "px". El lookahead
// (?=px) afirma "después de estos dígitos viene px", sin consumir "px".
const reAntesDePx = /\d+(?=px)/;
const m1 = "font-size: 16px".match(reAntesDePx);
check("extrae el número antes de 'px'", m1 ? m1[0] : null, "16");
// Prueba de que NO se consumió "px": el match tiene longitud 2 ("16"),
// no 4 ("16px"). El cursor quedó justo antes de la 'p'.
check("el lookahead no consume 'px'", m1 ? m1[0].length : -1, 2);

// Contraste DIDÁCTICO: sin lookahead, sí nos llevaríamos la unidad.
const mSinLook = "font-size: 16px".match(/\d+px/);
check("sin lookahead sí se lleva 'px'", mSinLook ? mSinLook[0] : null, "16px");
```

> 💡 **Guarda de null obligatoria:** en TypeScript estricto, `match()` devuelve `RegExpMatchArray | null`. Por eso escribimos `m1 ? m1[0] : null` antes de leer el resultado.

```ts
// @file regex-qa-course/modulo-05-lookaround/01-lookahead-positivo.ts
// 2) Insertar separadores de miles SIN borrar dígitos
// Caso QA clásico: formatear "1234567" → "1,234,567" para comparar contra
// la UI. (?=(\d{3})+$) = "lo que sigue son uno o más bloques de 3 dígitos
// y luego el fin". \B evita una coma al inicio. Como es ancho cero, NO
// borra ningún dígito: solo INSERTA.
const reMiles = /\B(?=(\d{3})+$)/g;
const formateado = "1234567".replace(reMiles, ",");
check("separador de miles con lookahead", formateado, "1,234,567");
```

```ts
// @file regex-qa-course/modulo-05-lookaround/01-lookahead-positivo.ts
// 3) Lookahead como "y además" en validación (preview de 5.4)
// Anclando con ^, el lookahead mira TODA la cadena desde el inicio:
// "la cadena contiene al menos un dígito en algún punto". No consume nada,
// solo confirma la condición. Esta es la base de la política de contraseñas.
const reTieneDigito = /^(?=.*\d)/;
checkMatch(reTieneDigito, "Pizza1", true);  // contiene un '1'
checkMatch(reTieneDigito, "Pizza", false);  // ningún dígito → falla
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/01-lookahead-positivo.ts
```

---

## Qué observar

- En `\d+(?=px)` la coincidencia es solo `"16"` (longitud 2), no `"16px"`. El `(?=px)` **confirma** el contexto pero el cursor no avanza sobre `px`.
- El separador de miles funciona porque el lookahead es de **ancho cero**: inserta comas en posiciones válidas sin borrar ni un solo dígito.
- Anclado con `^`, un `(?=.*X)` se convierte en un "y además contiene X". Apilando varios de estos construirás validaciones tipo AND en la clase 5.4.

---

➡️ Siguiente: [5.2 Lookahead negativo](/docs/regex/m5-lookahead-negativo)
