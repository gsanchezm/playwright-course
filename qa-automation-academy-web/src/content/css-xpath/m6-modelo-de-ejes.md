# 6.1 — El modelo de ejes

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** hasta ahora navegaste el DOM "hacia abajo" (de padre a hijo). Los **ejes** (axes) de XPath son las **direcciones** en las que te puedes mover por el árbol desde un nodo: hacia arriba (ancestros), a los lados (hermanos), hacia abajo (descendientes) y en orden de documento (following / preceding). Es como navegar las **relaciones** de un grafo de datos: no solo "los hijos", sino "los tíos", "los hermanos mayores", etc.

---

## ¿Qué aprendes?

- Que un paso de XPath se escribe `eje::nodo[predicado]`, y que el eje por defecto es `child::`.
- Que los **nombres de eje** son palabras clave **case-sensitive** (`ancestor::`, no `ANCESTOR::`).
- Los cuatro grupos de ejes del módulo: arriba (ancestros), a los lados (hermanos), abajo (descendientes) y en orden de documento (following / preceding).
- Que `..` es el atajo de `parent::node()`: sube un nivel.

---

## La idea central: un paso es `eje::nodo[predicado]`

Un paso de XPath tiene tres partes: el **eje** (la dirección), el **nodo** (el tipo de elemento a quedarte) y un **predicado** opcional (el filtro). Cuando no escribes el eje, el eje por defecto es `child::`. Es decir, `//article/h3` es azúcar de `//article/child::h3`.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/01-modelo-de-ejes.ts
// Un paso de XPath tiene tres partes:
//   eje::      la DIRECCION (child, parent, ancestor, following-sibling, ...)
//   nodo       el tipo de nodo a quedarte (article, h3, *, ...)
//   [pred]     un filtro opcional
// Cuando NO escribes eje, el eje por defecto es `child::`. Es decir,
// `//article/h3` es azucar de `//article/child::h3`.
check(
  "//div[@data-testid='pizza-grid']/article == /child::article",
  countXpath(`//div[@data-testid="pizza-grid"]/article`),
  countXpath(`//div[@data-testid="pizza-grid"]/child::article`),
);
// Hay 4 tarjetas dentro del grid.
check(
  "el grid tiene 4 article hijos directos",
  countXpath(`//div[@data-testid="pizza-grid"]/child::article`),
  4,
);
```

---

## Los nombres de eje son palabras clave case-sensitive

`child::`, `ancestor::`, `following-sibling::` se escriben en minúsculas. Escribir `CHILD::` o `Ancestor::` es un **error de sintaxis**: el parser de XPath no reconoce el eje y la expresión no compila. Por convención, escribe siempre los **nombres de elemento** en minúsculas (`//article`, no `//ARTICLE`): es lo que el navegador espera para documentos HTML.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/01-modelo-de-ejes.ts
check("child:: (minuscula) es un eje valido", countXpath(`//div[@data-testid="pizza-grid"]/child::article`), 4);

let ejeEnMayusculaCompila = true;
try {
  // CHILD:: no es un eje reconocido -> el parser lanza error al evaluar.
  countXpath(`//div[@data-testid="pizza-grid"]/CHILD::article`);
} catch {
  ejeEnMayusculaCompila = false;
}
check("CHILD:: (mayuscula) NO es un eje valido (error de sintaxis)", ejeEnMayusculaCompila, false);
```

---

## Un mismo nodo, varias direcciones

Partiendo del `<h3>` "Cuatro Quesos" como nodo de contexto, podemos movernos en distintas direcciones. Cada eje cambia el **significado** del paso, no solo el resultado.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/01-modelo-de-ejes.ts
const anclaCuatroQuesos = `//h3[normalize-space()="Cuatro Quesos"]`;

// ARRIBA: su <article> contenedor (lo veras a fondo en 6.2).
check("ancestor::article (arriba) = 1", countXpath(`${anclaCuatroQuesos}/ancestor::article`), 1);
// LADOS: el <p> de descripcion es un hermano siguiente (lo veras en 6.3).
check("following-sibling::p (lado) = 1", countXpath(`${anclaCuatroQuesos}/following-sibling::p`), 1);
// ORDEN-DOC: hay 2 h3 mas adelante en el documento (Suprema y Pan de Ajo).
check("following::h3 (orden de doc) = 2", countXpath(`${anclaCuatroQuesos}/following::h3`), 2);
```

---

## `..` es el atajo de `parent::`

`..` sube exactamente un nivel: es el atajo de `parent::node()`. Desde el `<h3>` de una tarjeta, el padre es su `<article>`.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/01-modelo-de-ejes.ts
const padre = $x(`${anclaCuatroQuesos}/..`)[0] as Element;
check("el padre del h3 es un <article>", padre?.tagName.toLowerCase(), "article");
check("ese article es la tarjeta 102", attr(padre, "data-testid"), "pizza-card-102");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/01-modelo-de-ejes.ts
```

---

## Qué observar

- El eje por defecto es `child::`: `//article/h3` y `//article/child::h3` son lo mismo.
- Los **nombres de eje** son case-sensitive (`ancestor::`, no `ANCESTOR::`); escribe los nombres de elemento en minúsculas por convención.
- Desde un mismo nodo puedes ir **arriba**, a los **lados** y en **orden de documento** según el eje que elijas.
- `..` es el atajo de `parent::`: sube un nivel.

➡️ Siguiente: [6.2 parent, ancestor, ancestor-or-self](/docs/css-xpath/m6-padre-ancestro)
