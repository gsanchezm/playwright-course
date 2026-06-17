# 8.2 — :has() alcanza a XPath

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** un buen filtro de casos de prueba combina condiciones ("severos **Y** abiertos **Y** sin asignar"). Aquí hacemos lo mismo con el DOM: **componemos** un selector que exige varias condiciones a la vez. El CSS moderno (`:has` + `:not`) alcanza el mismo poder expresivo que un XPath multi-predicado: cada uno describe "el elemento que cumple **todo** esto", no "el que está en tal posición".

---

## ¿Qué aprendes?

- A componer un filtro CSS con `:has()` (mirar hacia adentro) + `:not()` (excluir).
- El XPath paralelo con un predicado `[ ... and not(...) ]` sobre el mismo elemento.
- Que ambos describen **condiciones**, no posiciones: por eso son resilientes.
- A aplicar la misma composición a controles de formulario (`:checked:not([disabled])`).

---

## CSS: `:has()` + `:not()` = filtro compuesto

Queremos: la tarjeta que **tiene** el badge "Sin Gluten" **y** que **no** está agotada.

- `:has(.badge--sin-gluten)` → condición sobre un **descendiente**.
- `:not([data-sold-out])` → condición negativa sobre el **propio** `article`.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/02-has-alcanza-xpath.ts
const cssCompuesto = "article:has(.badge--sin-gluten):not([data-sold-out])";
check("filtro CSS compuesto -> 1 tarjeta", countCss(cssCompuesto), 1);
check(
  "es la pizza-card-102 (sin gluten y disponible)",
  attr($$(cssCompuesto)[0], "data-testid"),
  "pizza-card-102",
);
```

---

## XPath paralelo: predicado `[ ... and not(...) ]`

`.//span[...]` es el equivalente de `:has()` (¿tiene dentro tal descendiente?). `not(@data-sold-out)` es el equivalente de `:not([...])`. El `and` une ambas condiciones: mismo resultado, otra sintaxis.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/02-has-alcanza-xpath.ts
const xpathCompuesto =
  "//article[.//span[contains(@class,'badge--sin-gluten')] and not(@data-sold-out)]";
check("filtro XPath compuesto -> 1 tarjeta", countXpath(xpathCompuesto), 1);
check(
  "apunta a la MISMA tarjeta que el CSS",
  attr($x(xpathCompuesto)[0] as Element, "data-testid"),
  "pizza-card-102",
);
```

> 🔷 **Tabla de equivalencias:** `:has(X)` ↔ `[.//X]` · `:not([a])` ↔ `[not(@a)]` · encadenar pseudos `:has():not()` ↔ `and` dentro del predicado. Aprendido uno, traduces al otro.

---

## El mismo poder en un control de formulario: `:checked` + `:not([disabled])`

"El método de pago **actualmente seleccionado** que además **se puede cambiar**": radio marcado (`:checked`) y no deshabilitado. `transfer` está `disabled`; `card` está `checked` y habilitado → exactamente 1.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/02-has-alcanza-xpath.ts
check(
  "radio seleccionado y habilitado -> 1 (Tarjeta)",
  countCss('input[type="radio"]:checked:not([disabled])'),
  1,
);
check(
  "su value es 'card'",
  attr($$('input[type="radio"]:checked:not([disabled])')[0], "value"),
  "card",
);
```

---

## Composición de catálogo: "tarjetas con botón de compra habilitado"

`:has(.add-to-cart:not([disabled]))` → el `article` **tiene** un add-to-cart **no** deshabilitado. Solo la Suprema (103) está agotada (botón `disabled`) → quedan 3. Su negación es la tarjeta agotada.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/02-has-alcanza-xpath.ts
check(
  "article:has(.add-to-cart:not([disabled])) -> 3 disponibles",
  countCss("article:has(.add-to-cart:not([disabled]))"),
  3,
);
// Su negacion: la tarjeta con boton deshabilitado (la agotada) -> 1.
check(
  "article:has(button[disabled]) -> 1 (la agotada)",
  countCss("article:has(button[disabled])"),
  1,
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/02-has-alcanza-xpath.ts
```

---

## Qué observar

- `:has()` mira **hacia adentro** (descendientes); `:not()` excluye sobre el **propio** elemento. Juntos componen un filtro completo.
- En XPath eso es un solo predicado `[ A and not(B) ]`: misma lógica, sintaxis distinta.
- Componer por **condiciones** (no por posición) es lo que hace al selector resiliente.
- El mismo patrón aplica a `input:checked:not([disabled])`: el estado del control es una condición más.

➡️ Siguiente: [8.3 XPath dinámico](/docs/css-xpath/m8-xpath-dinamico)
