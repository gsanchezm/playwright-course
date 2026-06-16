# 5.3 — Lookbehind `(?<=...)` y `(?<!...)`

> **Módulo 5 · Lookaround**

> **Analogía QA:** el lookahead mira **adelante**; el lookbehind mira **atrás**. Es el "esto debe venir DESPUÉS de una etiqueta" de tu parser de logs. Como leer la cifra de un recibo: te interesa el monto que va justo tras `total=`, no la etiqueta en sí. Capturas el valor, no su rótulo.

---

## ¿Qué aprendes?

- Cómo afirmar lo que viene **justo antes** de una posición con `(?<=...)` (positivo) y `(?<!...)` (negativo).
- Cómo extraer un valor que sigue a una etiqueta **sin llevarte la etiqueta**.
- Que el lookbehind de JavaScript admite **ancho variable** (algo que otros motores no permiten).
- El "sándwich" clásico: lookbehind + lookahead para capturar lo que está **entre** dos delimitadores.

---

## Concepto

- `(?<=...)` afirma "**justo antes** de aquí venía este patrón" (positivo).
- `(?<!...)` afirma "**justo antes** de aquí NO venía este patrón" (negativo).

Ambos son de **ancho cero**: la etiqueta NO entra en el resultado.

---

## Código

```ts
// @file regex-qa-course/modulo-05-lookaround/03-lookbehind.ts
// 1) Extraer el MONTO que va tras "total=" (sin llevarse "total=")
// LINEA_LOG_ORDEN = "... order ORD-2026-0456 created total=249.00 MXN".
// (?<=total=) afirma que antes del número venía "total=", pero no lo
// captura. Resultado limpio: "249.00", listo para Number() y comparar.
const reMonto = /(?<=total=)\d+\.\d{2}/;
const mMonto = LINEA_LOG_ORDEN.match(reMonto);
check("monto tras 'total=' (lookbehind)", mMonto ? mMonto[0] : null, "249.00");
check("el lookbehind no se llevó 'total='", mMonto ? mMonto[0].includes("total") : true, false);

// Contraste: con un GRUPO de captura normal lograrías lo mismo, pero
// tendrías que leer m[1] en vez de m[0] (más ruido).
const mGrupo = LINEA_LOG_ORDEN.match(/total=(\d+\.\d{2})/);
check("mismo monto vía grupo de captura (m[1])", mGrupo ? mGrupo[1] : null, "249.00");
```

```ts
// @file regex-qa-course/modulo-05-lookaround/03-lookbehind.ts
// 2) Lookbehind NEGATIVO: número que NO va precedido de "$"
// Queremos las CANTIDADES (dígitos sin "$" detrás), no los precios.
// (?<!\$) afirma "antes no hay un signo de dólar".
const reCantidad = /(?<!\$)\b\d+/g;
const cantidades = "compra $100 de 3 pizzas y $20 de 2 refrescos".match(reCantidad);
// "$100" tiene $ detrás del 1 → descartado; "3" y "2" no → se quedan.
check("cantidades sin '$' detrás", cantidades, ["3", "2"]);
```

```ts
// @file regex-qa-course/modulo-05-lookaround/03-lookbehind.ts
// 3) Lookbehind de ANCHO VARIABLE (válido en V8 / Node 18+)
// El lookbehind de JavaScript admite patrones de longitud variable (con
// *, +, {m,n}...). Aquí la etiqueta puede traer espacios variables tras
// los dos puntos: "Precio:" seguido de \s* (cero o más espacios).
const rePrecioVar = /(?<=Precio:\s*)\d+/;
check("lookbehind variable (1 espacio)",  "Precio: 42".match(rePrecioVar)?.[0] ?? null, "42");
check("lookbehind variable (3 espacios)", "Precio:   99".match(rePrecioVar)?.[0] ?? null, "99");
check("lookbehind variable (0 espacios)", "Precio:7".match(rePrecioVar)?.[0] ?? null, "7");
```

> ⚠️ **Portabilidad:** este lookbehind de ancho variable funciona en Node/V8, pero **NO** en motores que exigen lookbehind de ancho fijo (como Python `re`). Lo retomamos en la síntesis del módulo.

```ts
// @file regex-qa-course/modulo-05-lookaround/03-lookbehind.ts
// 4) Combinar lookbehind + lookahead: el valor "entre etiquetas"
// Extraer lo que está ENTRE "id=" y un punto y coma, sin llevarse ninguno
// de los dos delimitadores. Lookbehind detrás, lookahead delante, y en
// medio "uno o más caracteres que no sean ;". Es el sándwich clásico.
const reEntre = /(?<=id=)[^;]+(?=;)/;
const mEntre = "params: id=ORD-789; status=ok".match(reEntre);
check("valor entre 'id=' y ';'", mEntre ? mEntre[0] : null, "ORD-789");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-lookaround/03-lookbehind.ts
```

---

## Qué observar

- Con `(?<=total=)\d+\.\d{2}` el monto sale directo en `m[0]` (`"249.00"`), sin la etiqueta `total=`. Es más limpio que leer `m[1]` de un grupo de captura.
- El lookbehind **negativo** `(?<!\$)` distingue cantidades de precios sin tener que partir el string a mano.
- El "sándwich" `(?<=id=)[^;]+(?=;)` captura el valor entre delimitadores dejando ambos fuera del resultado: una técnica que usarás muchísimo al parsear logs y query strings.

---

⬅️ Anterior: [5.2 Lookahead negativo](/docs/regex/m5-lookahead-negativo) · ➡️ Siguiente: [5.4 Política de contraseñas](/docs/regex/m5-password-policy)
