# 5.5 — position() y last()

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** a veces quieres "la **última** fila" de una tabla (el total), "la **primera**" o "la **penúltima**", sin conocer cuántas hay. `position()` te dice en qué índice va un nodo dentro de su grupo; `last()` te da el índice del último. Son las funciones para navegar listas por posición — con cuidado, porque la posición es lo **menos estable** que existe.

---

## ¿Qué aprendes?

- Que el índice de XPath es **1-based**: `[1]` es el primero, no `[0]`.
- `[position()=N]` es idéntico a `[N]`; la forma larga sirve al combinar con otras funciones.
- `last()` te da el último **sin contar a mano**; y `[last()-1]` es la penúltima.
- Que `[N]` cuenta **por padre**, no global — la trampa clásica de la indexación posicional.

---

## Índice posicional: [N] (1-based)

El carrito tiene **3** filas de resumen (`.summary-row`): subtotal, IVA, total. El índice empieza en `1`, no en `0`. `[1]` es la primera (subtotal). `[position()=2]` es idéntico a `[2]` (la fila de IVA); la forma larga es útil al combinar con otras funciones (p.ej. `position() < 3`).

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/05-position-last.ts
check('//div[contains(@class,"summary-row")] son 3', countXpath('//div[contains(@class,"summary-row")]'), 3);
check(
  'summary-row[1] es Subtotal',
  text($x('//div[contains(@class,"summary-row")][1]')[0] as Element),
  "Subtotal$553.00",
);
check(
  'summary-row[position()=2] es la fila de IVA',
  text($x('//div[contains(@class,"summary-row")][position()=2]')[0] as Element),
  "IVA (16%)$88.48",
);
```

---

## last() = la última fila (aquí, el total)

`[last()]` toma la última fila de resumen: la del **total**. No necesitas saber que son 3; `last()` lo resuelve dinámicamente. Este es el idiom estrella: `//div[contains(@class,"summary-row")][last()]` = la fila total.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/05-position-last.ts
check(
  'summary-row[last()] es la fila Total',
  text($x('//div[contains(@class,"summary-row")][last()]')[0] as Element),
  "Total$641.48",
);
```

---

## Aritmética sobre last(): [last()-1] = la penúltima

`last()-1` retrocede una posición desde el final. La penúltima fila es el IVA. Y en otra lista (la nav principal, 3 enlaces), `[last()]` es "Ayuda".

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/05-position-last.ts
check(
  'summary-row[last()-1] es la fila de IVA',
  text($x('//div[contains(@class,"summary-row")][last()-1]')[0] as Element),
  "IVA (16%)$88.48",
);

check('//nav[@class="main-nav"]/a son 3', countXpath('//nav[@class="main-nav"]/a'), 3);
check(
  'main-nav/a[last()] es "Ayuda"',
  text($x('//nav[@class="main-nav"]/a[last()]')[0] as Element),
  "Ayuda",
);
```

---

## [N] cuenta POR PADRE, no global

`//a[1]` **no** es "el primer `<a>` del documento": es "todo `<a>` que sea el **1er `<a>` de su padre**". Como hay varios padres con enlaces (nav, footer, carrito), devuelve **varios** nodos. Dentro de un solo padre (la nav) sí hay exactamente un "primer `<a>`": Catálogo.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/05-position-last.ts
const primerosPorPadre = countXpath("//nav[@class='main-nav']/a[1]");
check('main-nav/a[1] (un solo padre) es 1 nodo', primerosPorPadre, 1);
check(
  'main-nav/a[1] es "Catálogo"',
  text($x("//nav[@class='main-nav']/a[1]")[0] as Element),
  "Catálogo",
);
```

Para "el primero del documento **entero**" se envuelve la expresión en paréntesis: `(//a)[1]`. Esa forma **sí** es correcta en el navegador / Playwright / Selenium.

> ⚠️ **Divergencia jsdom:** el motor offline del curso (jsdom) evalúa `(//x)[n]` como si fuera `//x[n]` (por-padre), así que `(//a)[1]` te devolvería **varios** nodos en jsdom, no uno. Por eso **no** verificamos `(//x)[n]` con `check()` aquí: la regla del curso es **jsdom = sintaxis, navegador = verdad del comportamiento**. En un navegador real (y en `page.locator('xpath=(//a)[1]')` de Playwright) el paréntesis funciona como esperas.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/05-position-last.ts
```

---

## Qué observar

- El índice de XPath es **1-based**: `[1]` = primero, `[last()]` = último, `[last()-1]` = penúltima.
- `[position()=N]` y `[N]` son equivalentes; la forma larga brilla al combinar con comparaciones.
- `[N]` cuenta **por padre**: `//a[1]` matchea el primer `<a>` de **cada** padre, no uno solo.
- El paréntesis `(//x)[n]` da el N-ésimo **global** en navegadores, pero **diverge en jsdom** — por eso solo lo explicamos, no lo verificamos con check().
- En Playwright prefiere `.first()` / `.last()` / `.nth(i)` (que cuenta desde **0**) sobre el locator.

➡️ Siguiente: [🚩 Reto M5](/docs/css-xpath/m5-reto)
