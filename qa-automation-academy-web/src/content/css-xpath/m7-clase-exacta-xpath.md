# 7.2 — Clase exacta en XPath

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** en CSS, `.is-soldout` ya significa *"tiene esa clase, sin importar qué otras tenga"*. XPath 1.0 **no** tiene selector de clase: `@class` es un **string crudo**. Si comparas con `=` exiges que el atributo **completo** sea ese valor — y como las clases son multi-valor, casi siempre falla.

---

## ¿Qué aprendes?

- Por qué `[@class="pizza-card"]` **falla** cuando el elemento tiene varias clases.
- El idioma correcto en XPath: la **clase acolchada** `contains(concat(' ', normalize-space(@class), ' '), ' X ')`.
- Por qué el `contains(@class, 'X')` **ingenuo** es peligroso (matchea substrings).
- Que en CSS todo esto es gratis: `.X` ya es coincidencia exacta de token.

---

## El error clásico: igualdad estricta con multi-clase

Las tarjetas tienen `class="pizza-card css-7h3k1p"` (y la 103 además `is-soldout`). Como `@class` **nunca** es exactamente `"pizza-card"`, la igualdad estricta devuelve **0**. Es el bug más común al portar un `.pizza-card` de CSS a XPath.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/02-clase-exacta-xpath.ts
const exactaFalla = countXpath("//*[@class='pizza-card']");
check("[@class='pizza-card'] NO encuentra nada (multi-clase)", exactaFalla, 0);
```

---

## El idioma correcto: la "clase acolchada"

`concat(' ', normalize-space(@class), ' ')` convierte `"pizza-card css-7h3k1p"` en `" pizza-card css-7h3k1p "` y buscamos el token **rodeado de espacios** `' pizza-card '`. Coincide exacto y no se confunde con prefijos/sufijos. Cuenta **4** (las 4 tarjetas).

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/02-clase-exacta-xpath.ts
const acolchada = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]",
);
check("clase acolchada ' pizza-card ' cuenta 4", acolchada, 4);

const enCss = countCss(".pizza-card");
check("CSS .pizza-card cuenta 4 (sin acolchar)", enCss, 4);
check("XPath acolchado y CSS coinciden", acolchada === enCss, true);
```

> 🔷 **El patrón, paso a paso.** `normalize-space(@class)` recorta y colapsa espacios → `"pizza-card css-7h3k1p"`. `concat(' ', ..., ' ')` lo rodea de espacios → `" pizza-card css-7h3k1p "`. Buscar `' pizza-card '` (con sus espacios) garantiza que sea un **token completo**, no un fragmento. Es la forma canónica de decir "tiene la clase X" en XPath 1.0.

---

## Por qué el `contains()` ingenuo es peligroso

`contains(@class, 'is-soldout')` parece funcionar... hasta que existe una clase como `is-soldout-pending` o `was-soldout`: el **substring** colaría. En el fixture `is-soldout` es única, así que el ingenuo da 1 igual que el acolchado — pero el **hábito** correcto es siempre acolchar. El token acolchado de un fragmento inventado **no** existe rodeado de espacios:

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/02-clase-exacta-xpath.ts
const soldoutAcolchada = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
);
check("clase acolchada ' is-soldout ' cuenta 1", soldoutAcolchada, 1);

const fragmentoNoCuela = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' soldou ')]",
);
check("un fragmento ' soldou ' NO cuela con acolchado", fragmentoNoCuela, 0);
```

Y el remate: la clase exacta de CSS y el acolchado de XPath aterrizan en el **mismo nodo**.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/02-clase-exacta-xpath.ts
const csNode = $$(".is-soldout")[0];
const xpNode = $x(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
)[0] as Element;
check("CSS .is-soldout y XPath acolchado son el mismo nodo", csNode === xpNode, true);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/02-clase-exacta-xpath.ts
```

---

## Qué observar

- `[@class="X"]` con multi-clase devuelve **0**: `@class` es el string completo, no un conjunto.
- La **clase acolchada** `contains(concat(' ', normalize-space(@class), ' '), ' X ')` es la forma exacta de `.X`.
- El `contains(@class,'X')` ingenuo matchea **substrings**: usa siempre el acolchado para no atrapar `X-pending`.
- En CSS no hay nada que recordar: `.X` ya es exacto por diseño. Esto es ventaja pura de CSS.

➡️ Siguiente: [7.3 Rendimiento y fragilidad](/docs/css-xpath/m7-rendimiento)
