# 7.3 — Unicode y propiedades (`\p{...}`, la flag `u` y los emojis)

> **Módulo 7 · Avanzado y seguro**

> **Analogía QA:** un test que solo prueba datos en inglés (`"John"`, `"Smith"`) es un test **sesgado**: pasa en tu máquina y falla con clientes reales de México, Zürich o Tōkyō. `\w` y `\d` son "ASCII-céntricos" por defecto y rechazan acentos y otros alfabetos. Tratar bien los datos internacionales es parte de la **cobertura**, no un lujo.

---

## ¿Qué aprendes?

- Por qué `\w` rechaza nombres válidos como `"México"` (el bug clásico de i18n).
- Cómo arreglarlo con **Unicode property escapes**: `\p{L}` + la flag `u`.
- `\p{N}` para números Unicode y cómo combinar letra + número internacional.
- Por qué `.length` **te miente** con emojis (surrogate pairs) y cómo contar de verdad.

---

## El problema: `\w` es ASCII

`\w` en JS equivale a `[A-Za-z0-9_]`. La `'é'` (U+00E9) no está ahí. Entonces `/^\w+$/` **falla** sobre `"México"`: el validador "letras y números" rechaza un nombre perfectamente válido.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
const reAsciiWord = /^\w+$/;
checkMatch(reAsciiWord, "Mexico", true); // sin acento: \w sí lo acepta
checkMatch(reAsciiWord, "México", false); // con acento: \w lo RECHAZA (bug)
```

---

## La solución: `\p{L}` con la flag `u`

`\p{L}` significa "cualquier **letra** Unicode" (Letter), de cualquier alfabeto. **Requiere** la flag `u` (Unicode); sin ella es un error de sintaxis. Con ella, `"México"` pasa como debe.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
const reLetraUnicode = /^\p{L}+$/u;
checkMatch(reLetraUnicode, "México", true); // ahora SÍ acepta la 'é'
checkMatch(reLetraUnicode, "Tokyo", true);

// Contraste directo sobre el MISMO dato — esta es la lección clave:
check("\\w   rechaza 'México' (ASCII)", reAsciiWord.test("México"), false);
check("\\p{L} acepta  'México' (Unicode)", reLetraUnicode.test("México"), true);
```

> 💡 Cuidado con los espacios: `/^\p{L}+$/u` acepta letras pero **no** espacios, así que fallaría en `"São Paulo"`. Para nombres compuestos amplía a letra **o** espacio: `/^[\p{L}\s]+$/u`.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
const reNombreCompleto = /^[\p{L}\s]+$/u;
check("\\p{L}+ falla en 'São Paulo' por el espacio", reLetraUnicode.test("São Paulo"), false);
check("[\\p{L}\\s]+ acepta 'São Paulo'", reNombreCompleto.test("São Paulo"), true);
```

---

## `\p{N}` para números y "alfanumérico Unicode"

`\p{N}` significa "cualquier **número**" Unicode. Para los dígitos ASCII normales `\d` basta, pero `\p{N}` es útil si tus datos pueden traer numerales de otros sistemas. Combinando letra + número obtienes un "alfanumérico" seguro a nivel internacional.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
const reAlfanumUnicode = /^[\p{L}\p{N}]+$/u;
checkMatch(reAlfanumUnicode, "Pizza2026", true);
checkMatch(reAlfanumUnicode, "Zürich2", true); // acento + dígito: ok
checkMatch(reAlfanumUnicode, "Zürich 2", false); // espacio: rechazado
```

---

## Emojis y surrogate pairs: por qué `.length` te miente

JavaScript guarda strings en **UTF-16**. Los emojis como 🍕 y 🎉 están fuera del rango básico (son "astral"): cada uno ocupa **dos** unidades de código (un *surrogate pair*). Por eso `str.length` (cuenta unidades UTF-16) es **mayor** que el número real de caracteres percibidos. El iterador de strings (`[...str]` o `for..of`) sí respeta los *code points*.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
// TEXTO_CON_EMOJI = "Pedido confirmado 🍕🎉 para México"
const porUnidadesUTF16 = TEXTO_CON_EMOJI.length;
const porCodePoints = [...TEXTO_CON_EMOJI].length;
// No adivinamos los conteos; afirmamos la RELACIÓN robusta: 2 emojis astral,
// cada uno aporta 1 unidad EXTRA en .length.
check("hay exactamente 2 emojis astral (diff de 2)", porUnidadesUTF16 - porCodePoints, 2);
```

Para **contar caracteres reales** de cara al usuario (p. ej. un límite de campo "comentario"), usa el spread, no `.length`:

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
function longitudReal(s: string): number {
  return [...s].length;
}
check("longitud real de '🍕' es 1, no 2", longitudReal("🍕"), 1);
check("'🍕'.length cruda es 2 (surrogate pair)", "🍕".length, 2);
```

La misma flag `u` arregla el `.` con emojis: con `u`, un `.` cuenta cada emoji como **una** coincidencia; sin `u`, parte el *surrogate pair* en dos.

```ts
// @file regex-qa-course/modulo-07-avanzado-seguro/03-unicode-y-propiedades.ts
const soloEmojis = "🍕🎉";
check("'.' con flag u cuenta 2 emojis", soloEmojis.match(/./gu)?.length ?? 0, 2);
check("'.' sin flag u cuenta 4 (parte surrogates)", soloEmojis.match(/./g)?.length ?? 0, 4);
```

---

## Qué observar

- `\w`/`\d` son ASCII; con datos internacionales son un **bug** esperando a pasar.
- `\p{L}` y `\p{N}` resuelven i18n, pero **exigen** la flag `u`.
- Con emojis, `.length` cuenta unidades UTF-16; usa `[...str].length` para caracteres reales.

➡️ Siguiente: [7.4 Regex mantenible](/docs/regex/m7-regex-mantenible)
