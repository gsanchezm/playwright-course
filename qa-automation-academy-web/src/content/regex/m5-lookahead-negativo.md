# 5.2 — Lookahead negativo `(?!...)`

> **Módulo 5 · Lookaround**

> **Analogía QA:** es la **lista negra** de tu validador. Dices "esto debe ir seguido de cualquier cosa MENOS X". Como el guardia que deja pasar a todos excepto a los que traen cierto distintivo: confirma una **ausencia** en el contexto que viene, sin consumir nada.

---

## ¿Qué aprendes?

- Cómo afirmar que lo que viene a continuación **NO** cumple un patrón con `(?!...)`.
- Por qué el lookahead negativo también es de **ancho cero** (comprueba la ausencia, no consume texto).
- Patrones QA muy útiles: rechazar un prefijo prohibido (`PROD`) o filtrar logs ("contiene `order` pero NO `failed`").

---

## Concepto

`(?!...)` afirma "lo que viene a continuación **NO** cumple este patrón". Igual que el lookahead positivo, es de **ancho cero**: comprueba una ausencia, no consume texto. El truco mental: lookahead positivo = "tiene que venir X"; negativo = "no puede venir X".

---

## Código

```ts
// @file regex-qa-course/modulo-05-lookaround/02-lookahead-negativo.ts
// 1) Un número que NO va seguido de "px" (rechazar un contexto)
// En "z-index: 10" el 10 no va seguido de px → coincide.
// En "16px" el 16 SÍ va seguido de px → el lookahead negativo lo rechaza.
const reNumSinPx = /\d+(?!\d*px)/;
const okZ = "z-index: 10".match(reNumSinPx);
check("número que NO precede 'px' coincide", okZ ? okZ[0] : null, "10");
// ¿Por qué (?!\d*px) y no solo (?!px)? Porque \d+ es codicioso y haría
// backtracking dígito a dígito buscando una posición que satisfaga el
// lookahead. El \d*px dentro del lookahead cierra esa puerta.
checkMatch(/^\d+(?!\d*px)$/, "16px", false); // anclado: "16px" entero NO valida
checkMatch(/^\d+(?!\d*px)$/, "10", true);    // "10" suelto sí valida
```

```ts
// @file regex-qa-course/modulo-05-lookaround/02-lookahead-negativo.ts
// 2) Palabra prohibida: rechazar ambientes que empiecen con "PROD"
// Caso QA: un script de limpieza JAMÁS debe correr contra producción.
// (?!PROD) al inicio afirma "NO empieza con PROD". Lo combinamos con \w+
// para exigir que sí sea un nombre de ambiente.
const reNoProd = /^(?!PROD)\w+/;
checkMatch(reNoProd, "QA", true);
checkMatch(reNoProd, "UAT", true);
checkMatch(reNoProd, "PROD", false);       // empieza con PROD → bloqueado
checkMatch(reNoProd, "PRODUCTION", false); // también empieza con PROD
```

> ⚠️ **Ojo con el prefijo:** `(?!PROD)` bloquea cualquier cadena que **empiece** con `PROD`, no solo la palabra exacta. Por eso `PROD-EU` o `PRODUCTION` también caen. Si quisieras bloquear solo la palabra exacta, anclarías el final del lookahead.

```ts
// @file regex-qa-course/modulo-05-lookaround/02-lookahead-negativo.ts
// 3) "Contiene una palabra pero NO otra" en la misma cadena
// Patrón útil para filtrar logs: "líneas que mencionan 'order' pero que
// NO contienen 'failed'". El (?!.*failed) ancla en ^ y escanea TODA la
// línea afirmando que la subcadena 'failed' no aparece en ningún lado.
const reOrderOk = /^(?!.*failed).*order.*$/;
checkMatch(reOrderOk, "INFO order ORD-1 created", true);    // tiene order, sin failed
checkMatch(reOrderOk, "ERROR order ORD-2 failed", false);   // tiene failed → rechazada
checkMatch(reOrderOk, "INFO retry GET /api/pizzas", false); // no menciona order

// El lookahead negativo no añade nada a lo capturado: capturamos el id de
// orden con un grupo y confirmamos que (?!.*failed) no contaminó la captura.
const mId = "INFO order ORD-1 created".match(/^(?!.*failed).*(ORD-\d+).*$/);
check("captura el id pese al lookahead negativo", mId ? mId[1] : null, "ORD-1");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/02-lookahead-negativo.ts
```

---

## Qué observar

- `\d+(?!\d*px)` necesita `\d*px` (no solo `px`) para cerrar el backtracking: si solo pusieras `(?!px)`, el motor encontraría una posición intermedia donde el lookahead pasa. Ese detalle es típico de los bugs sutiles de regex.
- `^(?!PROD)\w+` es un patrón de seguridad: una sola línea evita que un script destructivo corra contra producción.
- El filtro `^(?!.*failed).*order.*$` combina dos condiciones en una regex: presencia de `order` y ausencia de `failed`. Aun así, los grupos de captura siguen limpios.

---

⬅️ Anterior: [5.1 Lookahead positivo](/docs/regex/m5-lookahead-positivo) · ➡️ Siguiente: [5.3 Lookbehind](/docs/regex/m5-lookbehind)
