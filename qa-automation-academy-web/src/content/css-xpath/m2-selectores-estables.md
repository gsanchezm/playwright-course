# 2.5 — Selectores estables con testid

> **Módulo 2 · CSS Atributos y combinadores**

> **Analogía QA:** un `data-testid` es un **contrato** entre dev y QA. Las clases de estilo cambian con cada rediseño; el testid es un hook puesto a propósito para automatización y, por convención, no se toca sin avisar. Tu trabajo es engancharte al **contrato estable**, no al andamiaje frágil del CSS.

---

## ¿Qué aprendes?

- Por qué un testid **dinámico** (`pizza-card-101`) exige un operador de prefijo, no `=`.
- Por qué el `=` exacto **fallaría** para enganchar "todos".
- El testid como contrato **estable** frente a las clases hash (`css-7h3k1p`) que cambian en cada build.
- Cómo **extraer el id de negocio** desde el propio testid.

---

## El `=` exacto solo toma una; el prefijo las toma todas

Las cards son `pizza-card-101`, `-102`, `-103`, `-104`. Un `=` exacto solo atrapa **una**: para enganchar las 4 a la vez necesitas el prefijo estable `[data-testid^="pizza-card-"]`. Lo mismo con los botones `add-to-cart`.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/05-selectores-estables.ts
import { countCss, $$, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

titulo("El '=' exacto solo toma una; el prefijo las toma todas");
check('[data-testid="pizza-card-101"] (exacto) → 1', countCss('[data-testid="pizza-card-101"]'), 1);
check('[data-testid^="pizza-card-"] (prefijo) → 4', countCss('[data-testid^="pizza-card-"]'), 4);

check('[data-testid="add-to-cart-101"] (exacto) → 1', countCss('[data-testid="add-to-cart-101"]'), 1);
check('[data-testid^="add-to-cart-"] (prefijo) → 4', countCss('[data-testid^="add-to-cart-"]'), 4);
```

---

## El testid como contrato: estable frente a las clases hash frágiles

Las cards también llevan una clase generada `css-7h3k1p` (estilo CSS-in-JS). Esa clase es **basura** para selectores: cambia en cada build. El testid no. Ambos cuentan 4 **hoy**, pero solo el testid es un contrato que **sobrevive** al próximo rediseño.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/05-selectores-estables.ts
titulo("Contrato estable (testid) vs clase hash frágil (css-*)");
check(".css-7h3k1p (clase hash, frágil) → 4 hoy", countCss(".css-7h3k1p"), 4);
check('[data-testid^="pizza-card-"] (contrato, estable) → 4', countCss('[data-testid^="pizza-card-"]'), 4);
```

> ⚠️ Un mismo conteo **hoy** no implica la misma resistencia **mañana**. `.css-7h3k1p` y `[data-testid^="pizza-card-"]` dan 4 ambos, pero la clase hash se regenera en cada build y el testid es un contrato explícito. Engánchate al contrato.

---

## Del hook al dato: extraer el id desde el contrato

Un buen testid es legible **y** parseable: el sufijo numérico **es** el id de negocio. Lo leemos sin tocar el texto visible ni el precio. Y para "la card agotada" no dependas de la clase visual `is-soldout`: cruza el testid con el atributo de estado `data-sold-out`.

```ts
// @file css-xpath-qa-course/modulo-02-css-atributos-combinadores/05-selectores-estables.ts
titulo("El testid contiene el id de negocio");
const ids = $$('[data-testid^="pizza-card-"]')
  .map((el) => attr(el, "data-testid")!.replace("pizza-card-", ""));
check("ids extraídos de los testids", ids, ["101", "102", "103", "104"]);

// Estado por contrato, no por clase visual:
const agotadas = $$('[data-testid^="pizza-card-"][data-sold-out="true"]');
check("card agotada por testid + data-sold-out → 1", agotadas.length, 1);
check("...y su id es 103", attr(agotadas[0], "data-testid"), "pizza-card-103");
```

> 🔷 **qa_transfer:** Playwright tiene azúcar para esto — `page.getByTestId('...')` usa `data-testid` por defecto, y `page.locator('[data-testid^="..."]')` engancha los dinámicos. El contrato del testid transfiere 1:1 a la app live.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-02-css-atributos-combinadores/05-selectores-estables.ts
```

---

## Qué observar

- Testid **dinámico** → usa `^=` (prefijo); el `=` exacto solo atrapa uno.
- Mismo conteo hoy ≠ misma estabilidad mañana: la clase hash se regenera, el testid es un contrato.
- El sufijo del testid suele ser el **id de negocio**: legible y parseable.
- Cruza testid + atributo de estado (`data-sold-out`) en vez de depender de clases visuales (`is-soldout`).

➡️ Siguiente: [🚩 Reto M2](/docs/css-xpath/m2-reto)
