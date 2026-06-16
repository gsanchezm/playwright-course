# 2.2 — Clases predefinidas: `\d` `\w` `\s` y sus negaciones

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** son los "atajos de teclado" del regex. En vez de escribir a mano `[0-9]` o `[A-Za-z0-9_]`, usas `\d` y `\w`. Como cualquier atajo, son cómodos, PERO hay que conocer su letra chica: `\d` y `\w` son **ASCII** (no entienden acentos ni alfabetos no latinos). En QA eso es una bomba de tiempo si tu app es multi-mercado (OmniPizza: MX/US/CH/JP).

---

## ¿Qué aprendes?

- Los atajos `\d`, `\w`, `\s` y sus negaciones `\D`, `\W`, `\S`.
- Sus equivalencias exactas con clases escritas a mano.
- **La trampa grande:** la flag `u` (Unicode) NO arregla `\w`/`\d`. El arreglo real son las propiedades `\p{L}`.

---

## 1) `\d` = dígito ASCII ≡ `[0-9]`

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\d$/, "5", true);
checkMatch(/^\d$/, "a", false);
// Equivalencia: \d se comporta igual que [0-9] en estos casos.
checkMatch(/^[0-9]$/, "5", true);
```

---

## 2) `\w` = "word char" ASCII ≡ `[A-Za-z0-9_]`

> ⚠️ Trampa #1: `\w` **incluye** el guion bajo `_` pero **NO** el guion medio `-`.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\w$/, "a", true);
checkMatch(/^\w$/, "_", true);  // el guion BAJO sí es \w
checkMatch(/^\w$/, "-", false); // el guion MEDIO NO es \w
checkMatch(/^\w$/, " ", false);
// Equivalencia explícita con la clase larga:
checkMatch(/^[A-Za-z0-9_]$/, "_", true);
```

---

## 3) `\s` = espacio en blanco (espacio, tab, salto de línea, etc.)

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\s$/, " ", true);
checkMatch(/^\s$/, "\t", true);
checkMatch(/^\s$/, "x", false);
// A diferencia de \d y \w, \s SÍ reconoce algunos espacios Unicode
// (p.ej. el espacio duro NBSP). Por eso NO digas "todo lo predefinido es ASCII":
// la regla ASCII aplica a \d y \w, no a \s.
checkMatch(/^\s$/, " ", true); // NBSP cuenta como espacio en blanco
```

---

## 4) Negaciones — `\D` `\W` `\S` = "lo contrario"

Mnemotecnia: **MAYÚSCULA = NEGACIÓN**. `\D` = no-dígito, `\W` = no-word-char, `\S` = no-espacio. Útiles para afirmar "aquí NO debe haber X".

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\D$/, "a", true);   // 'a' no es dígito
checkMatch(/^\D$/, "5", false);  // '5' es dígito → \D lo rechaza
checkMatch(/^\W$/, "-", true);   // '-' no es word-char → es \W
checkMatch(/^\W$/, "a", false);
checkMatch(/^\S$/, "x", true);   // 'x' no es espacio
checkMatch(/^\S$/, " ", false);  // ' ' es espacio → \S lo rechaza
```

Relación de complemento: para CUALQUIER caracter, o es `\d` o es `\D` (nunca ambos, nunca ninguno). Lo verificamos como propiedad:

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
const muestra = ["7", "a", " ", "_", "-"];
const todoEsDoDmayus = muestra.every((c) => /\d/.test(c) !== /\D/.test(c));
check("\\d y \\D son complementarios (XOR) para cada caracter", todoEsDoDmayus, true);
```

---

## 5) 🪤 La trampa grande: `\w` y `\d` son ASCII — y la flag `u` NO los arregla

Esto sorprende a casi todos: mucha gente cree que poner la flag `u` (Unicode) hace que `\w` entienda acentos. **No es así.** `\w` sigue siendo `[A-Za-z0-9_]` incluso con `u`. Lo demostramos con `"café"` (la `é` no es `\w`):

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\w+$/, "café", false);  // sin flag: la 'é' rompe → NO coincide
checkMatch(/^\w+$/u, "café", false); // CON flag u: ¡SIGUE sin coincidir!
// 👆 Esa segunda línea es el punchline: 'u' no rescata a \w.

// Lo mismo con \d y dígitos no-ASCII (arábigo-índicos ٠١). \d los ignora:
checkMatch(/^\d+$/, "٠١", false);
checkMatch(/^\d+$/u, "٠١", false); // 'u' tampoco rescata a \d
```

✅ El arreglo **real** (gancho a M07) son las **propiedades Unicode** `\p{...}`, que EXIGEN la flag `u`. `\p{L}` = "cualquier letra Unicode" (con acentos y todos los alfabetos). Aquí `"café"` SÍ coincide:

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
checkMatch(/^\p{L}+$/u, "café", true);      // letras Unicode reales
checkMatch(/^\p{L}+$/u, "México", true);    // acento incluido
checkMatch(/^\p{L}+$/u, "Tōkyō", true);     // macrones también
```

> 🔭 En M07 (avanzado) profundizamos en `\p{...}`, `\p{N}`, scripts, etc. Por ahora recuerda: si tu app es internacional, `\w`/`\d` ASCII **no bastan**.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-clases-cuantificadores/02-clases-predefinidas.ts
```

---

## Qué observar

- `\d` ≡ `[0-9]` y `\w` ≡ `[A-Za-z0-9_]`: son atajos ASCII, nada mágico.
- `\w` incluye `_` pero no `-`; `\s` sí reconoce algunos espacios Unicode (NBSP).
- La flag `u` **no** convierte `\w`/`\d` en Unicode; para letras acentuadas usa `\p{L}` con `u`.

⬅️ Anterior: [2.1 Clases de caracteres](/docs/regex/m2-clases-de-caracteres) · ➡️ Siguiente: [2.3 Cuantificadores](/docs/regex/m2-cuantificadores)
