# 3.2 — Estructurales: nth-child y nth-of-type

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** localizar por **posición** es como decir "el primer renglón de la tabla" en vez de "el renglón con id 101". Es frágil (si cambia el orden, se rompe), pero a veces es lo único que tienes. Lo **peligroso** es confundir dos posiciones que suenan iguales pero cuentan distinto: `nth-child` cuenta **todos** los hermanos; `nth-of-type` cuenta solo los del **mismo tipo** de etiqueta.

---

## ¿Qué aprendes?

- `:first-child` / `:last-child`: el primero y el último hermano.
- La diferencia entre `:nth-child` (todos los hermanos) y `:nth-of-type` (solo del mismo tipo).
- Cómo los **hermanos de tipo mixto** hacen que ambas cuentas **diverjan** dentro de una misma `.pizza-card`.
- Por qué prefieres un **hook estable** (data-testid) sobre la posición para identificar un dato.

---

## `:first-child` / `:last-child`

`:first-child` matchea un elemento **solo si** es el primer hijo de su padre. En la lista del carrito, la primera línea es Pepperoni y la última Cuatro Quesos (solo hay 2 líneas).

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/02-estructurales.ts
check("primera línea del carrito = Pepperoni", text($$(".cart-lines li:first-child .line-name")[0]), "Pepperoni");
check("última línea del carrito = Cuatro Quesos", text($$(".cart-lines li:last-child .line-name")[0]), "Cuatro Quesos");

check("primer chip = Todas", text($$(".category-bar .chip:first-child")[0]), "Todas");
check("último chip = Acompañamientos", text($$(".category-bar .chip:last-child")[0]), "Acompañamientos");

// En el grid (todos los hijos son <article>):
check("primera card del grid = Pepperoni", text($$(".pizza-grid article:first-child .pizza-name")[0]), "Pepperoni");
check("última card del grid = Pan de Ajo", text($$(".pizza-grid article:last-child .pizza-name")[0]), "Pan de Ajo");
```

---

## Hermanos homogéneos: las dos cuentas coinciden

Cuando **todos** los hermanos son del mismo tipo (4 `<article>`), las dos formas de contar coinciden: el 1er hijo **es** el 1er article.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/02-estructurales.ts
check(".pizza-grid > article:nth-child(1)", countCss(".pizza-grid > article:nth-child(1)"), 1);
check(".pizza-grid > article:nth-of-type(1)", countCss(".pizza-grid > article:nth-of-type(1)"), 1);
check(".pizza-grid > article:first-of-type", countCss(".pizza-grid > article:first-of-type"), 1);
```

---

## Mixed-type siblings: dentro de una card las cuentas **divergen**

Los hijos de una `.pizza-card` **no** son homogéneos. En las cards **con** badge el orden es:

```
img · span.badge · h3 · p · span.price · button
```

y en Pan de Ajo (**sin** badge):

```
img ·            h3 · p · span.price · button
```

El precio (`span.price`) cae en **posiciones distintas** según haya badge:

- **con** badge: es el **5º hijo** (`nth-child(5)`) y el **2º span** (`nth-of-type(2)`).
- **sin** badge: es el **4º hijo** (`nth-child(4)`) y el **1er span** (`nth-of-type(1)`).

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/02-estructurales.ts
// nth-child cuenta TODOS los hermanos:
check(".price como 5º HIJO (3 cards con badge)", countCss(".pizza-card .price:nth-child(5)"), 3);
check(".price como 4º HIJO (solo Pan de Ajo)", countCss(".pizza-card .price:nth-child(4)"), 1);

// nth-of-type cuenta SOLO entre <span>:
check(".price como 2º SPAN (3 cards con badge)", countCss(".pizza-card span.price:nth-of-type(2)"), 3);
check(".price como 1er SPAN (solo Pan de Ajo)", countCss(".pizza-card span.price:nth-of-type(1)"), 1);

// El contraste más limpio:
check("span:first-of-type existe en las 4 cards", countCss(".pizza-card span:first-of-type"), 4);
check(".badge NUNCA es :first-child (siempre va <img> antes)", countCss(".pizza-card .badge:first-child"), 0);
```

El `.badge` nunca es `:first-child` porque el primer hijo siempre es la `<img>`. Pero **sí** es `span:first-of-type` en las cards con badge: cambiar `nth-child` por `nth-of-type` cambia el resultado en cuanto los tipos de hermano se mezclan.

---

## Moraleja QA: no pidas un dato por posición

Las posiciones se desfasan en cuanto el markup mezcla tipos o agrega/quita un nodo (un badge, un banner). `nth-child` / `nth-of-type` son útiles para **afirmar estructura** ("hay exactamente 4 cards", "el precio va tras el nombre"), no para identificar **un** dato. Para eso usa un hook estable: el `data-testid`.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/02-estructurales.ts
check("la card 101 se localiza sin contar posiciones", text($$('[data-testid="pizza-card-101"] .pizza-name')[0]), "Pepperoni");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-css-pseudoclases/02-estructurales.ts
```

---

## Qué observar

- `:first-child` exige ser **el primer hijo**, no "el primero de su tipo".
- En hermanos homogéneos (4 article) `nth-child` y `nth-of-type` **coinciden**.
- En cuanto se mezclan tipos (img/span/h3/p dentro de una card) **divergen**: el mismo `.price` es `nth-child(5)` con badge pero `nth-child(4)` sin él.
- Para identificar un registro concreto, prefiere `data-testid`; deja las posiciones para aserciones de estructura.

➡️ Siguiente: [3.3 La fórmula An+B](/docs/css-xpath/m3-formula-anb)
