# 6.3 — `following-sibling` y `preceding-sibling`

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** en una lista (líneas del carrito, campos de un formulario), el elemento que quieres suele estar **junto** al que sabes localizar, no dentro de él. Los ejes de hermanos se mueven a los **lados** dentro del **mismo padre**. Patrón clásico de QA: anclar en una etiqueta/celda conocida y saltar al control de al lado (el botón, el valor, la siguiente fila).

---

## ¿Qué aprendes?

- `following-sibling::` salta a los hermanos que vienen **después**; `preceding-sibling::`, a los de **antes**.
- El caso pro: anclar en un elemento conocido (un mensaje de error) y saltar al control de al lado (el botón).
- Que los hermanos **comparten padre**: cruzar de un contenedor a otro no funciona con estos ejes.

---

## `following-sibling::` — la siguiente línea del carrito

El carrito tiene 2 `<li>`: `cart-line-101` (Pepperoni) y `cart-line-102` (Cuatro Quesos). Desde la primera, su único hermano siguiente es la segunda.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/03-hermanos.ts
check(
  "cart-line-101 -> following-sibling::li = 1",
  countXpath(`//li[@data-testid="cart-line-101"]/following-sibling::li`),
  1,
);
const siguiente = $x(`//li[@data-testid="cart-line-101"]/following-sibling::li`)[0] as Element;
check("ese hermano siguiente es la linea 102", attr(siguiente, "data-testid"), "cart-line-102");
```

---

## `preceding-sibling::` — la línea anterior

Desde la segunda línea, su único hermano anterior es la primera.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/03-hermanos.ts
check(
  "cart-line-102 -> preceding-sibling::li = 1",
  countXpath(`//li[@data-testid="cart-line-102"]/preceding-sibling::li`),
  1,
);
const anterior = $x(`//li[@data-testid="cart-line-102"]/preceding-sibling::li`)[0] as Element;
check("ese hermano anterior es la linea 101", attr(anterior, "data-testid"), "cart-line-101");
```

---

## El caso pro: del mensaje de error al botón de al lado

En el formulario de login, el `<div data-testid="login-error">` y el botón "Sign In" son **hermanos** (ambos hijos directos del `<form>`). Anclar en el mensaje de error y saltar al botón siguiente lo localiza sin depender de su clase ni su posición absoluta.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/03-hermanos.ts
check(
  "login-error -> following-sibling::button = 1",
  countXpath(`//div[@data-testid="login-error"]/following-sibling::button`),
  1,
);
const boton = $x(`//div[@data-testid="login-error"]/following-sibling::button`)[0] as Element;
check("ese boton es el de login (Sign In)", text(boton), "Sign In");
check("...y su data-testid es login-button-desktop", attr(boton, "data-testid"), "login-button-desktop");
```

---

## Ojo: los hermanos comparten padre

El `<span class="price">` de la tarjeta de Pepperoni es hermano de su `<h3>`, pero el `<h3>` de **otra** tarjeta **no** es su hermano (viven en `article`s distintos). Cruzar de contenedor necesita otro eje (lo verás en 6.4).

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/03-hermanos.ts
// Dentro de la tarjeta de Pepperoni, el h3 y el span.price son hermanos:
check(
  "el h3 de Pepperoni tiene 1 span.price hermano",
  countXpath(`//h3[normalize-space()="Pepperoni"]/following-sibling::span[@class="price"]`),
  1,
);
// Pero el h3 de Pepperoni NO tiene como hermano al h3 de otra pizza:
check(
  "el h3 de Pepperoni NO tiene un h3 hermano (otra tarjeta = otro padre)",
  countXpath(`//h3[normalize-space()="Pepperoni"]/following-sibling::h3`),
  0,
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/03-hermanos.ts
```

---

## Qué observar

- `following-sibling::` y `preceding-sibling::` se mueven a los lados **dentro del mismo padre**.
- Anclar en un texto estable (un mensaje, una etiqueta) y saltar al control de al lado es un patrón muy resistente.
- Los hermanos comparten padre: el `<h3>` de una tarjeta **no** tiene como hermano al `<h3>` de otra.
- Para cruzar el límite de un contenedor necesitas `following::` / `preceding::` (siguiente lección).

➡️ Siguiente: [6.4 following, preceding, descendant](/docs/css-xpath/m6-following-preceding-descendant)
