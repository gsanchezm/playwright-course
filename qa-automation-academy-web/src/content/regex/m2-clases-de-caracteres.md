# 2.1 — Clases de caracteres: `[abc]`, rangos y negación

> **Módulo 2 · Clases y cuantificadores**

> **Analogía QA:** una clase de caracteres es la "lista de invitados" de UNA posición del texto. Igual que un test parametrizado solo acepta ciertos valores en un campo, `[abc]` dice "en este hueco solo dejo pasar `a`, `b` o `o`". El rango `[a-z]` es esa lista escrita de forma compacta, y `[^...]` es la lista negra: "todos MENOS estos".

---

## ¿Qué aprendes?

- Que una clase `[...]` representa siempre **UN solo caracter**.
- Cómo escribir rangos (`[a-z]`, `[0-9]`) y negaciones (`[^abc]`).
- Por qué sin anclar (`^...$`) tu validación "pasa por la razón equivocada".

---

## 1) `[abc]` — un caracter de un CONJUNTO explícito

`[gato]` NO significa "la palabra gato": significa "una de las letras `g`, `a`, `t` u `o`". Una clase siempre representa **un solo caracter**.

> ⚠️ Recuerda el contrato: `checkMatch` usa `.test()`, que busca una **subcadena**. Por eso `/[abc]/` "matchea" cualquier texto que CONTENGA una `a`, `b` o `c` en algún lado. Para afirmar sobre TODO el dato, anclamos con `^...$`.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reVocalSimple = /[abc]/;
checkMatch(reVocalSimple, "a", true);   // contiene 'a'
checkMatch(reVocalSimple, "xby", true); // contiene 'b' en medio
checkMatch(reVocalSimple, "xyz", false); // ninguna de a/b/c

// Anclado: ahora exigimos que el dato sea EXACTAMENTE un caracter de [abc].
const reUnaSolaLetra = /^[abc]$/;
checkMatch(reUnaSolaLetra, "a", true);
checkMatch(reUnaSolaLetra, "ab", false); // dos caracteres → no calza ^...$
checkMatch(reUnaSolaLetra, "d", false);
```

---

## 2) Rangos — `[a-z]`, `[0-9]`, `[a-z0-9]`

El guion DENTRO de una clase y ENTRE dos caracteres significa "rango". `[a-z]` son las 26 minúsculas, `[0-9]` los 10 dígitos. Puedes combinar varios rangos en la misma clase.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reLetraMinuscula = /^[a-z]$/;
checkMatch(reLetraMinuscula, "q", true);
checkMatch(reLetraMinuscula, "Q", false); // mayúscula NO está en a-z
checkMatch(reLetraMinuscula, "5", false);

const reAlfanumerico = /^[a-z0-9]$/;
checkMatch(reAlfanumerico, "k", true);
checkMatch(reAlfanumerico, "7", true);
checkMatch(reAlfanumerico, "-", false); // el guion (fuera de rango) no entra
```

Caso QA típico: un "slug" de ambiente como `qa1` (minúsculas y dígitos). Aquí ya usamos un cuantificador (`+`, lo verás en 2.3) para aceptar varios caracteres:

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reSlugAmbiente = /^[a-z0-9]+$/;
checkMatch(reSlugAmbiente, "qa1", true);
checkMatch(reSlugAmbiente, "prod-2", false); // el guion rompe el slug
```

---

## 3) Negación — `[^...]` significa "cualquier caracter EXCEPTO estos"

El `^` AL INICIO de la clase la invierte.

> ⚠️ Trampa clásica: el `^` solo niega cuando está como **primer** caracter de la clase. `[a^b]` es la lista `a`, `^`, `b` (ahí el `^` es literal). En cambio `[^ab]` = "ni `a` ni `b`".

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reNoVocalAbc = /^[^abc]$/;
checkMatch(reNoVocalAbc, "z", true);  // z no es a/b/c → pasa
checkMatch(reNoVocalAbc, "a", false); // a está prohibida
```

Y aquí está el error de QA de "el test pasó por la razón equivocada". Sin anclar, `[^abc]` solo pide **UN** caracter que no sea `a`/`b`/`c` en algún lugar del texto:

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reContieneNoAbc = /[^abc]/;
checkMatch(reContieneNoAbc, "abcd", true);  // la 'd' cumple → coincide
checkMatch(reContieneNoAbc, "abc", false);  // todo es a/b/c → no hay "otro"
```

Uso real: detectar un campo "no vacío y sin espacios" con clase explícita ("todo menos espacio ni tab"):

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const reSinEspacios = /^[^ \t]+$/;
checkMatch(reSinEspacios, "OmniPizza", true);
checkMatch(reSinEspacios, "Omni Pizza", false); // tiene espacio → falla
```

---

## 4) Especiales que se vuelven literales dentro de `[]`

Dentro de una clase, muchos metacaracteres pierden su poder: el punto `.` es un punto literal, no "cualquier cosa". El guion al **final** (o al inicio) de la clase también es literal, no rango.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const rePuntoLiteral = /^[.]$/;
checkMatch(rePuntoLiteral, ".", true);
checkMatch(rePuntoLiteral, "x", false); // dentro de [] el punto NO es comodín

// [a-] = "la letra a, o un guion". Truco para incluir '-' sin ambigüedad.
const reLetraAoGuion = /^[a-]$/;
checkMatch(reLetraAoGuion, "a", true);
checkMatch(reLetraAoGuion, "-", true);
checkMatch(reLetraAoGuion, "b", false);
```

---

## 5) Extraer con clases: contar dígitos de un ID

`.match()` con la flag `g` devuelve TODAS las coincidencias o `null`. En modo estricto, hay que guardar el `null` antes de usar `.length`.

```ts
// @file regex-qa-course/modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
const idRuidoso = "ID#A7-B3-C9";
const digitos = idRuidoso.match(/[0-9]/g); // cada dígito por separado
check("dígitos encontrados en el ID", digitos ? digitos.length : 0, 3); // 7,3,9
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-clases-cuantificadores/01-clases-de-caracteres.ts
```

---

## Qué observar

- Una clase `[...]` siempre vale por **UN** caracter; para varios, necesitas un cuantificador (2.3).
- Sin `^...$`, validas "contiene", no "es exactamente": ese es el falso positivo más común.
- El `^` niega solo cuando va primero; el `-` y el `.` se vuelven literales dentro de `[]`.

➡️ Siguiente: [2.2 Clases predefinidas](/docs/regex/m2-clases-predefinidas)
