# 4.5 — Banderas `u` (Unicode) y `y` (sticky)

> **Módulo 4 · Anclas y banderas**

> **Analogía QA:** `u` enseña a la regex que un emoji 🍕 es UN caracter, no dos cachos sueltos de bytes. `y` (sticky/pegajosa) es un cabezal lector que solo acepta match EXACTAMENTE donde dejó el cursor — ideal para tokenizers/parsers que avanzan caracter por caracter sin huecos.

---

## ¿Qué aprendes?

- Cómo `u` hace que la regex razone por **punto de código** Unicode (emojis, `\u{...}`, `\p{...}`).
- Cómo `y` (sticky) ancla el match a `lastIndex` sin "saltar" huecos.
- Por qué `y` es la flag ideal para escribir un tokenizer.

---

## Flag `u`: razonar por puntos de código Unicode

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/05-flag-u-y-y.ts
// Sin `u`, JavaScript ve los caracteres "fuera del BMP" (como 🍕) como
// DOS unidades UTF-16 ("surrogate pair"). Por eso /^.$/ (un solo caracter)
// FALLA con "🍕": el . solo matchea una de las dos mitades.
// Con `u`, el motor entiende que 🍕 es UN punto de código → /^.$/u sí casa.
checkMatch(/^.$/, "🍕", false); // sin u: 🍕 cuenta como 2 → "un caracter" falla
checkMatch(/^.$/u, "🍕", true); // con u: 🍕 es 1 caracter → casa

// .length de la cadena sigue siendo 2 (unidades UTF-16), pero la regex
// con `u` razona por punto de código.
check("'🍕'.length es 2 unidades UTF-16", "🍕".length, 2);

// `u` también habilita escapes Unicode como \u{...} y propiedades \p{...}.
const reCodepoint = /^\u{1F355}$/u; // 1F355 = 🍕
checkMatch(reCodepoint, "🍕", true);
// 👉 Profundizamos en Unicode (\p{...}, \w vs letras acentuadas) en M07.
```

---

## Flag `y` (sticky): match anclado a `lastIndex`

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/05-flag-u-y-y.ts
// Recordatorio (4.3): con `g`, .exec() BUSCA hacia adelante desde
// lastIndex (puede saltarse caracteres que no calzan). Con `y`, el match
// debe ocurrir JUSTO en lastIndex; si ahí no calza, devuelve null.
const entrada = "12ab34";

// --- Con g: salta el "ab" y encuentra ambos grupos de dígitos ---
const reG = /\d+/g;
const g1 = reG.exec(entrada);
check("g: 1er exec captura '12'", g1 ? g1[0] : null, "12");
const g2 = reG.exec(entrada); // SALTA "ab" y sigue buscando → "34"
check("g: 2do exec SALTA 'ab' y captura '34'", g2 ? g2[0] : null, "34");

// --- Con y: tras "12", en lastIndex hay 'a' → NO calza → null ---
const reY = /\d+/y;
const y1 = reY.exec(entrada); // calza en índice 0 → "12", lastIndex → 2
check("y: 1er exec captura '12'", y1 ? y1[0] : null, "12");
check("y: lastIndex avanzó a 2", reY.lastIndex, 2);
const y2 = reY.exec(entrada); // en índice 2 hay 'a', no \d → null (NO salta)
check("y: 2do exec devuelve null (no salta 'ab')", y2, null);
```

La rigidez de `y` es exactamente lo que necesita un tokenizer: "consume el siguiente token AQUÍ o falla".

---

## Mini-tokenizer con `y`: avanzar sin huecos

```ts
// @file regex-qa-course/modulo-04-anclas-banderas/05-flag-u-y-y.ts
// "K=12;V=34" → leemos tokens contiguos. y garantiza que no haya basura
// silenciosamente saltada: cada token empieza donde terminó el anterior.
const fuente = "K=12;V=34";
const reToken = /([A-Z])=(\d+);?/y; // letra, '=', dígitos, ';' opcional
const tokens: Array<{ clave: string; valor: string }> = [];
let m: RegExpExecArray | null;
while ((m = reToken.exec(fuente)) !== null) {
  tokens.push({ clave: m[1], valor: m[2] });
}
check("tokenizado con y", tokens, [
  { clave: "K", valor: "12" },
  { clave: "V", valor: "34" },
]);
// Tras consumir todo, exec devolvió null y lastIndex volvió a 0.
check("y: lastIndex en 0 al terminar el tokenizado", reToken.lastIndex, 0);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-anclas-banderas/05-flag-u-y-y.ts
```

---

## Qué observar

- Sin `u`, un emoji 🍕 cuenta como **dos** unidades UTF-16, por eso `/^.$/` falla; con `u` razona por punto de código y casa.
- `u` habilita además `\u{...}` y las propiedades `\p{...}` (que verás a fondo en M07).
- Con `g`, `.exec()` **busca hacia adelante** y puede saltar caracteres; con `y` el match debe ocurrir **justo en `lastIndex`** o devuelve `null`.
- Esa rigidez de `y` (no saltar huecos) es la base de un tokenizer correcto.

⬅️ Anterior: [4.4 Flags `m` y `s`](/docs/regex/m4-flags-m-s) · ➡️ Siguiente: [🚩 Reto M4](/docs/regex/m4-reto)
