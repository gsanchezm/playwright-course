# 1.3 — Agrupación y selector universal

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** dos atajos para abarcar más con menos. La **agrupación** (`h1, h2`) es un "esto **o** aquello": la coma une varios selectores en una sola consulta (como un OR). El **universal** (`*`) es el comodín que matchea cualquier elemento. Útiles para contar y auditar; peligrosos si los usas como locator real.

---

## ¿Qué aprendes?

- La **coma** como unión (OR) de selectores: `h1, h2` = todos los h1 **más** todos los h2.
- Que la coma une selectores **enteros**, no condiciones dentro de un mismo elemento.
- El **selector universal** `*` y su uso real como descendiente (`section *`).
- Por qué `*` sirve para **auditar/contar** pero no como locator de un test.

---

## Agrupación: la coma es un OR entre selectores

`h1, h2` matchea todo elemento que sea `<h1>` **o** `<h2>`. El resultado es la **unión** de ambos conjuntos. En OmniPizza hay 1 `<h1>` (el hero de login) y 4 `<h2>` (títulos de sección): 5 en total.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/03-agrupacion-universal.ts
check("h1 → 1 (el hero de login)", countCss("h1"), 1);
check("h2 → 4 (títulos de sección)", countCss("h2"), 4);
check("h1, h2 → 5 (la unión de ambos)", countCss("h1, h2"), 5);

// Puedes encadenar cuantos quieras. Sumamos los <h3> (4 nombres de pizza).
check("h1, h2, h3 → 9 (todos los encabezados)", countCss("h1, h2, h3"), 9);
```

La coma une selectores **enteros**, no es "y dentro del mismo elemento": `.badge, .price` = (todos los badge) ∪ (todos los price) = 3 + 4 = 7.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/03-agrupacion-universal.ts
check(".badge, .price → 7 (3 badges + 4 precios)", countCss(".badge, .price"), 7);
```

---

## Selector universal: `*` matchea cualquier elemento

`*` por sí solo es el comodín: cuenta **todos** los elementos del documento.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/03-agrupacion-universal.ts
check("* → 143 elementos en toda la página", countCss("*"), 143);
```

Su uso real es como **descendiente**: `section *` = "cualquier elemento dentro de un `<section>`". OmniPizza tiene 2 `<section>` (el market-picker y el catálogo); `*` abarca **todos** sus descendientes, sumados — no es "los hijos del catálogo", son ambas secciones.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/03-agrupacion-universal.ts
check("section * → 51 (descendientes de las 2 <section>)", countCss("section *"), 51);

// Acotado al grid: todo lo que vive dentro de las 4 tarjetas.
check(".pizza-grid * → 30 (todo lo que cuelga del grid)", countCss(".pizza-grid *"), 30);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/03-agrupacion-universal.ts
```

---

## Qué observar

- La **coma** es un OR: une selectores **completos** y devuelve la unión de sus matches.
- `*` solo cuenta **todo**; su valor real es como descendiente (`contenedor *`).
- `section *` abarca **las dos** `<section>` del documento, no solo una.
- Agrupar y `*` son ideales para **auditar/contar**, no para apuntar a un elemento en un test.

➡️ Siguiente: [1.4 querySelector vs querySelectorAll](/docs/css-xpath/m1-queryselector-vs-all)
