# 3.4 — :not(), :is(), :where()

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** estas tres pseudo-clases son los **operadores lógicos** de tus selectores. `:not()` es el "**excepto**" (todo menos X). `:is()` es el "**cualquiera de**" (X o Y o Z) que ahorra repetir. `:where()` es `:is()` pero "callado": no suma especificidad, ideal para reglas base que otra cosa deba sobreescribir.

---

## ¿Qué aprendes?

- `:not()` para **negar** una condición, encadenado o con **lista**.
- `:is()` para **agrupar** una lista de selectores (OR) sin repetir el prefijo.
- `:where()`: mismo match que `:is()` pero con **especificidad 0**.
- El **parseo forgiving** de `:is()` / `:where()` frente al parseo **estricto** de `:not()`.

---

## `:not()` — el complemento de una condición

`:not([data-sold-out])` = cards que **no** tienen ese atributo. La única agotada es Suprema, así que quedan **3** disponibles. `:not()` también niega por clase.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check("cards NO agotadas = 3", countCss(".pizza-card:not([data-sold-out])"), 3);
check("y son Pepperoni, Cuatro Quesos y Pan de Ajo", $$(".pizza-card:not([data-sold-out]) .pizza-name").map(text), ["Pepperoni", "Cuatro Quesos", "Pan de Ajo"]);

check("article:not(.is-soldout) = 3", countCss("article:not(.is-soldout)"), 3);
```

---

## `:not()` encadenado ≡ `:not()` con lista

Encadenar `:not():not()` es un **AND de negaciones** ("ni esto **ni** aquello"). CSS moderno también acepta una **lista** dentro de un solo `:not(a, b)` con el mismo efecto. De los 3 badges (popular, sin-gluten, new), excluir *popular* y *new* deja **1**.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check(":not(.badge--popular):not(.badge--new) = 1 badge", countCss(".badge:not(.badge--popular):not(.badge--new)"), 1);
check(":not(.badge--popular, .badge--new) = mismo 1 badge", countCss(".badge:not(.badge--popular, .badge--new)"), 1);
check("ese badge restante es 'Sin Gluten'", text($$(".badge:not(.badge--popular):not(.badge--new)")[0]), "Sin Gluten");

check("nav links que no son el activo = 2", countCss(".main-nav a:not(.is-active)"), 2);
```

---

## `:is()` — agrupa una lista (OR) y ahorra repetición

`:is(h1, h2, h3)` = "cualquier encabezado de esos tres". Equivale a escribir `h1, h2, h3` por separado, pero compone bien dentro de un selector más grande. En OmniPizza hay 1 `h1` + 4 `h2` + 4 `h3` = **9** encabezados.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check(":is(h1,h2,h3) = 9 encabezados", countCss(":is(h1, h2, h3)"), 9);

// El poder real: usar :is() en MEDIO de un selector, sin duplicar el sufijo.
check("article:is(.is-soldout, [data-category=veggie]) = 2", countCss("article:is(.is-soldout, [data-category=veggie])"), 2);
check("y son Cuatro Quesos (veggie) y Suprema (agotada)", $$("article:is(.is-soldout, [data-category=veggie]) .pizza-name").map(text), ["Cuatro Quesos", "Suprema de Carnes"]);
```

---

## `:where()` — mismo match, especificidad 0

`:where(...)` selecciona **lo mismo** que `:is(...)`. La diferencia **no** se ve al contar nodos (es la misma cuenta), se ve en la **cascada**: `:where()` aporta especificidad 0, así una regla posterior puede ganarle sin pelear. Por eso `:where()` es para estilos base/reset.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check(":where(h1,h2,h3) = 9 (igual que :is)", countCss(":where(h1, h2, h3)"), 9);
```

---

## Parseo forgiving: `:is()` / `:where()` perdonan; `:not()` **no**

`:is()` y `:where()` usan una lista **tolerante a fallos**: si una parte es basura, la **ignora** y sigue con el resto. `:not()` usa una lista **estricta**: una parte inválida invalida **todo** el `:not()`. Aquí `:is(h2, ::basura-xyz)` sigue matcheando los `h2` reales (4) pese al selector falso.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check(":is(h2, ::basura-xyz) ignora lo inválido y matchea 4 h2", countCss(":is(h2, ::basura-xyz)"), 4);
```

> ⚠️ Lo contrario con `:not()`: un selector inválido dentro de `:not(::basura-xyz)` hace que **toda** la consulta lance error (no "ignora la parte mala"). Es la diferencia entre lista *forgiving* (`:is`/`:where`) y lista estricta (`:not`).

---

## Aplicación QA: condensar selectores repetidos

`:is()` reduce el "selector copy-paste". En vez de `.pizza-card.is-soldout .add-to-cart, .pizza-card[data-sold-out] .add-to-cart`, agrupas con `:is()` y queda una sola intención clara.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/04-not-is-where.ts
check("botón de card no disponible vía :is()", countCss(".pizza-card:is(.is-soldout, [data-sold-out]) button:disabled"), 1);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-css-pseudoclases/04-not-is-where.ts
```

---

## Qué observar

- `:not(a):not(b)` y `:not(a, b)` dan el **mismo** resultado: AND de negaciones.
- `:is()` agrupa (OR) y compone en medio de un selector; evita repetir el sufijo.
- `:is()` y `:where()` matchean **igual**; su diferencia (especificidad) se nota en la **cascada CSS**, no al contar nodos.
- `:is()` / `:where()` son **forgiving** (ignoran selectores inválidos); `:not()` es **estricto** (uno malo rompe todo).

➡️ Siguiente: [3.5 :has(), el selector relacional](/docs/css-xpath/m3-has)
