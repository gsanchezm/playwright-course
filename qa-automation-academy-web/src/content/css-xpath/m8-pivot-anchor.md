# 8.1 — Selector pivot / ancla

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** cuando un elemento no tiene un hook propio estable (un botón icon-only, un precio sin id), no lo persigas de arriba hacia abajo con una cadena frágil. **Ánclate en el nodo estable más cercano** —casi siempre un **texto único** y visible para el usuario— y navega desde ahí hacia tu objetivo. Es el mismo instinto que usas al reportar un bug: te refieres al elemento por su etiqueta visible, no por "el tercer div del segundo contenedor".

---

## ¿Qué aprendes?

- Qué es un selector **pivot/ancla** y por qué se construye **bottom-up** (del texto al elemento), no de la raíz al fondo.
- A subir desde un texto único con el eje XPath `ancestor::` para alcanzar el contenedor.
- El equivalente en CSS moderno: `:has()` como "selecciona el contenedor por lo que contiene".
- Por qué un ancla de texto **sobrevive al reordenamiento** y un selector posicional no.

---

## El problema: el objetivo no tiene hook propio

El botón "agregar al carrito" de cada pizza es icon-only: su `data-testid` es dinámico (`add-to-cart-101`, `-102`...) y su `aria-label` está vacío. Lo único 100% estable y legible de esa tarjeta es el **nombre** de la pizza (un `<h3>`). Ese `<h3>` es nuestra **ancla**.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/01-pivot-anchor.ts
// 1) Anclamos en el texto unico "Cuatro Quesos" y SUBIMOS al <article> padre.
//    ancestor:: recorre hacia arriba; nos da la tarjeta completa desde el nombre.
const cardCuatroQuesos = "//h3[normalize-space()='Cuatro Quesos']/ancestor::article";
check("ancla de texto sube a 1 sola tarjeta", countXpath(cardCuatroQuesos), 1);
check(
  "la tarjeta anclada es pizza-card-102",
  attr($x(cardCuatroQuesos)[0] as Element, "data-testid"),
  "pizza-card-102",
);

// 2) Desde el ancla, BAJAMOS al objetivo real (el boton add-to-cart de ESA card).
const btnDesdeAncla =
  "//h3[normalize-space()='Cuatro Quesos']/ancestor::article//button[contains(@class,'add-to-cart')]";
check("del ancla bajamos a 1 boton", countXpath(btnDesdeAncla), 1);
check(
  "y es exactamente el boton add-to-cart-102",
  attr($x(btnDesdeAncla)[0] as Element, "data-testid"),
  "add-to-cart-102",
);
```

> 🔷 **El patrón bottom-up en dos pasos:** (1) ancla en un texto único y sube con `ancestor::` hasta el contenedor; (2) desde el contenedor, baja al objetivo real. Nunca dependes de la posición del objetivo, solo de un texto que el usuario también ve.

---

## El mismo patrón en CSS: `:has()` como "ancestor:: de los pobres"

CSS no tiene ejes hacia arriba. Pero `:has()` te deja seleccionar un **ancestro por lo que contiene**: "el `article` que **tiene dentro** tal cosa". Es la forma CSS de anclar en el contenido y quedarte con el contenedor.

CSS no matchea el texto de los nodos, así que anclamos en un hook de contenido estable de esa tarjeta: su badge "Sin Gluten" (solo la Cuatro Quesos lo tiene).

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/01-pivot-anchor.ts
check(
  "article:has(.badge--sin-gluten) -> 1 tarjeta",
  countCss("article:has(.badge--sin-gluten)"),
  1,
);
check(
  "es la misma pizza-card-102",
  attr($$("article:has(.badge--sin-gluten)")[0], "data-testid"),
  "pizza-card-102",
);

// Y desde ese contenedor anclado, descendemos al boton (sintaxis descendiente normal).
const btnCss = "article:has(.badge--sin-gluten) .add-to-cart";
check("del contenedor :has() al boton -> 1", countCss(btnCss), 1);
check(
  "boton CSS == boton XPath == add-to-cart-102",
  attr($$(btnCss)[0], "data-testid"),
  "add-to-cart-102",
);
```

---

## Por qué el ancla gana: sobrevive al reordenamiento

Un selector posicional ("la 3ª tarjeta", `nth-...`) se rompe si el catálogo reordena. El ancla de texto sigue al **contenido**: mientras "Cuatro Quesos" exista y sea único, el selector apunta a su tarjeta sin importar la posición. Y desde el ancla puedes alcanzar a sus hermanos:

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/01-pivot-anchor.ts
const precioAnclado =
  "//h3[normalize-space()='Cuatro Quesos']/following-sibling::span[contains(@class,'price')]";
check(
  "tambien alcanzamos el precio de ESA pizza por hermano",
  text($x(precioAnclado)[0] as Element),
  "$175.00",
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/01-pivot-anchor.ts
```

---

## Qué observar

- El ancla es **un texto único** (`Cuatro Quesos`): estable, legible y no depende de la posición.
- `ancestor::article` **sube** desde el ancla; `:has(...)` en CSS hace lo mismo seleccionando el contenedor por su contenido.
- Una vez tienes el contenedor, **bajas** al objetivo con sintaxis descendiente normal.
- CSS y XPath llegan al **mismo** `add-to-cart-102`: son dos rutas al mismo nodo.

➡️ Siguiente: [8.2 :has() alcanza a XPath](/docs/css-xpath/m8-has-alcanza-xpath)
