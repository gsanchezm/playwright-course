# 6.2 — `parent`, `ancestor`, `ancestor-or-self`

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** encontraste el dato que te importa (el **nombre** de la pizza), pero el elemento accionable está más **arriba** (la **tarjeta** completa, o su botón). Los ejes "hacia arriba" te dejan subir del texto al contenedor. Este es el corazón del patrón pro de localización: anclar por el texto estable y subir por eje al contenedor.

---

## ¿Qué aprendes?

- `parent::` sube **un** nivel (atajo `..`); `ancestor::` sube a **cualquier** contenedor.
- `ancestor-or-self::` hace lo mismo que `ancestor::` pero **incluye** al nodo de partida.
- La diferencia entre "un nivel" y "cualquier nivel" cuando el contenedor está anidado.
- Cómo pasar del texto estable al contenedor accionable sin contar posiciones.

---

## `ancestor::` — sube a cualquier contenedor

El `<h3>` "Cuatro Quesos" vive dentro de **exactamente** un `<article>`. Esa es la tarjeta completa: el contenedor accionable que querías. Anclamos en el `<h3>` del catálogo (no en el `<span>` del carrito) usando `normalize-space()`, porque es el texto **limpio** del elemento.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/02-padre-ancestro.ts
const anclaCuatroQuesos = `//h3[normalize-space()="Cuatro Quesos"]`;

// El <h3> "Cuatro Quesos" vive dentro de EXACTAMENTE un <article>.
check("ancestor::article desde el h3 = 1", countXpath(`${anclaCuatroQuesos}/ancestor::article`), 1);
const tarjeta = $x(`${anclaCuatroQuesos}/ancestor::article`)[0] as Element;
check("ese article es la tarjeta 102", attr(tarjeta, "data-testid"), "pizza-card-102");
```

---

## `parent::` y el atajo `..` — sube exactamente un nivel

Para este `<h3>`, el padre directo **ya es** el `<article>`, así que `parent::` y `ancestor::article` coinciden. Pero no siempre: `parent::` es "un nivel", no "el contenedor de tipo X".

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/02-padre-ancestro.ts
check("parent::article = 1", countXpath(`${anclaCuatroQuesos}/parent::article`), 1);
check(".. (atajo de parent) tambien sube 1 nivel", countXpath(`${anclaCuatroQuesos}/..`), 1);
const porParent = $x(`${anclaCuatroQuesos}/parent::article`)[0] as Element;
const porAtajo = $x(`${anclaCuatroQuesos}/..`)[0] as Element;
check("parent::article y .. devuelven el MISMO nodo", porParent === porAtajo, true);
```

---

## `parent` no es `ancestor`: la diferencia con anidación

La diferencia se ve cuando el contenedor que buscas está a **varios** niveles. El `<span class="amount">` del total del carrito está anidado: `.summary-row--total` → `span.amount`. Su **padre** es el `div.summary-row`; su **ancestor** incluye además el `<aside>` del carrito.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/02-padre-ancestro.ts
const anclaTotal = `//div[@data-testid="cart-total"]/span[@class="amount"]`;
check("amount existe", countXpath(anclaTotal), 1);
check("su parent es el summary-row del total", countXpath(`${anclaTotal}/parent::div[@data-testid="cart-total"]`), 1);
check("su parent NO es el aside (esta mas arriba)", countXpath(`${anclaTotal}/parent::aside`), 0);
check("ancestor::aside SI lo alcanza", countXpath(`${anclaTotal}/ancestor::aside`), 1);
```

---

## `ancestor-or-self::` — incluye el nodo de partida

Si partimos del **propio** `<article>` y pedimos `ancestor::article`, el resultado es **0** (un nodo no es ancestro de sí mismo). Con `ancestor-or-self::` sí cuenta.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/02-padre-ancestro.ts
const anclaArticle = `//article[@data-testid="pizza-card-102"]`;
check("ancestor::article desde el propio article = 0", countXpath(`${anclaArticle}/ancestor::article`), 0);
check("ancestor-or-self::article = 1 (se incluye a si mismo)", countXpath(`${anclaArticle}/ancestor-or-self::article`), 1);
```

---

## El resultado: del texto estable al contenedor accionable

"El nombre de la pizza" es estable; "la 2a tarjeta" es frágil. Anclar por nombre y subir por `ancestor::` te da la tarjeta correcta sin contar posiciones.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/02-padre-ancestro.ts
const nombreEnTarjeta = text($x(`${anclaCuatroQuesos}/ancestor::article//h3`)[0]);
check("ancla + subir + bajar al nombre = 'Cuatro Quesos'", nombreEnTarjeta, "Cuatro Quesos");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/02-padre-ancestro.ts
```

---

## Qué observar

- `ancestor::X` sube a cualquier contenedor de tipo `X`; `parent::` (y `..`) suben **un** nivel.
- Cuando el padre directo ya es el contenedor buscado, `parent::` y `ancestor::` coinciden — pero no en general.
- `ancestor::X` desde el propio `X` da **0**; usa `ancestor-or-self::` si el nodo de partida debe contar.
- Anclar por texto y subir por `ancestor::` es más estable que "la N-ésima tarjeta".

➡️ Siguiente: [6.3 following-sibling y preceding-sibling](/docs/css-xpath/m6-hermanos)
