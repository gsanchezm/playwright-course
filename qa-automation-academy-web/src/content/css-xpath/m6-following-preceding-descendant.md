# 6.4 — `following`, `preceding`, `descendant`

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** los ejes de hermanos solo ven a quienes comparten padre. A veces necesitas mirar **todo** lo que viene después (o antes) en el documento, sin importar el contenedor; o todo lo que **cuelga** de un nodo. `following::` es "todo lo que abre a mi derecha leyendo el HTML", `preceding::` es "a mi izquierda", y `descendant::` es "todo lo que está dentro de mí".

---

## ¿Qué aprendes?

- `descendant::` alcanza todo lo que cuelga de un nodo (hijos, nietos, ...).
- `following::` / `preceding::` recorren el documento en **orden de documento**, cruzando contenedores.
- La diferencia entre `following::` y `following-sibling::`.
- Cómo pedir "el primero hacia adelante" **sin** caer en la trampa de `(//...)[n]`.

---

## `descendant::` — todo lo que está dentro

La tarjeta de Pepperoni (`card-101`) contiene 2 `<span>`: el badge "Popular" y el `<span class="price">`. `descendant::` los alcanza a cualquier profundidad. Un nodo **no** es descendiente de sí mismo.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/04-following-preceding-descendant.ts
const card101 = `//article[@data-testid="pizza-card-101"]`;
check("descendant::span dentro de la tarjeta 101 = 2", countXpath(`${card101}/descendant::span`), 2);
check("descendant::button dentro de la tarjeta 101 = 1", countXpath(`${card101}/descendant::button`), 1);
// descendant:: NO se incluye a si mismo (un nodo no es descendiente propio).
check("descendant::article desde la propia tarjeta = 0", countXpath(`${card101}/descendant::article`), 0);
```

---

## `following::` — todo lo que viene después

Anclamos en el `<h3>` "Suprema de Carnes" (la 3a tarjeta del grid). Después de ella en el HTML solo queda una pizza: "Pan de Ajo". Por eso `following::h3` devuelve **1** (no incluye su propio `<h3>` ni los de las pizzas anteriores).

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/04-following-preceding-descendant.ts
const anclaSuprema = `//h3[normalize-space()="Suprema de Carnes"]`;
check("following::h3 desde Suprema = 1 (solo Pan de Ajo)", countXpath(`${anclaSuprema}/following::h3`), 1);
const h3Siguiente = $x(`${anclaSuprema}/following::h3`)[0] as Element;
check("ese h3 siguiente es 'Pan de Ajo'", h3Siguiente?.textContent?.trim(), "Pan de Ajo");
```

---

## `preceding::` — todo lo que vino antes

Antes de "Suprema" hay 2 `<h3>` de pizza: Pepperoni y Cuatro Quesos. (En el header/login hay `<h1>` y `<h2>`, no `<h3>`, así que no cuentan.)

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/04-following-preceding-descendant.ts
check("preceding::h3 desde Suprema = 2 (Pepperoni y Cuatro Quesos)", countXpath(`${anclaSuprema}/preceding::h3`), 2);
```

---

## `following` no es `following-sibling`

`following-sibling::h3` desde Suprema = **0** (su único contenedor es su `article`; no tiene un `<h3>` hermano). Pero `following::h3` = **1** porque **cruza el límite** del `article` y ve el documento entero hacia adelante. Eje correcto = pregunta correcta.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/04-following-preceding-descendant.ts
check("following-sibling::h3 desde Suprema = 0 (mismo padre)", countXpath(`${anclaSuprema}/following-sibling::h3`), 0);
check("following::h3 desde Suprema = 1 (todo el documento adelante)", countXpath(`${anclaSuprema}/following::h3`), 1);
```

---

## "El primero que viene después": indexa en el paso de eje

Desde el `<h3>` de Pepperoni, el primer `<button>` que abre después en el documento es su propio add-to-cart. `following::button[1]`, con **un** nodo de contexto, es seguro y portátil: el `[1]` filtra **dentro del resultado del eje** desde ese único nodo.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/04-following-preceding-descendant.ts
const primerBoton = $x(`//h3[normalize-space()="Pepperoni"]/following::button[1]`)[0] as Element;
check("following::button[1] desde Pepperoni = add-to-cart-101", attr(primerBoton, "data-testid"), "add-to-cart-101");
```

> ⚠️ **No confundas `axis::nodo[1]` con `(//nodo)[1]`.** Indexar en el paso de eje (`following::button[1]`) significa "el primero **por cada** nodo de contexto". Envolver con paréntesis (`(//button)[1]`) significa "el primero **del conjunto global** ya ordenado" — semánticas distintas. Además, este curso corre **offline con jsdom**, y jsdom evalúa `(//x)[n]` como si fuera `//x[n]` (por-padre), que **no** es el comportamiento estándar. En el **navegador / Playwright / Selenium** `(//x)[n]` sí selecciona el n-ésimo global. Por eso aquí solo verificamos la forma `axis::nodo[1]` (idéntica en jsdom y en el navegador) y dejamos `(//x)[n]` para explicarla en prosa. Marco del curso: **jsdom = aproximador de sintaxis; el navegador / Playwright = la verdad del comportamiento.**

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/04-following-preceding-descendant.ts
```

---

## Qué observar

- `descendant::` baja a cualquier profundidad; no incluye al nodo de partida.
- `following::` / `preceding::` cruzan contenedores y recorren el documento en orden de lectura.
- `following::h3` ≠ `following-sibling::h3`: el primero ve todo el documento adelante; el segundo, solo el mismo padre.
- Para "el primero hacia adelante" usa `axis::nodo[1]`; reserva `(//nodo)[n]` para el navegador, no para jsdom.

➡️ Siguiente: [6.5 El patrón ancla-y-navega](/docs/css-xpath/m6-ancla-y-navega)
