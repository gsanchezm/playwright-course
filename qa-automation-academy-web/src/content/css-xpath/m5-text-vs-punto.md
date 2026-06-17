# 5.1 — text() vs . (string-value)

> **Módulo 5 · XPath Texto y funciones**

> **Analogía QA:** `text()` y `.` son dos formas distintas de "leer la celda". `text()` lee **solo** los rótulos pegados directamente al elemento (sus nodos de texto hijos); `.` lee la celda **completa** (todo el texto que cuelga del elemento, incluido el de sus hijos). Elegir mal es la causa #1 de un locator que "debería matchear" y no matchea.

---

## ¿Qué aprendes?

- Que `text()=X` compara contra los **nodos de texto directos** del elemento, no contra el de sus descendientes.
- Que `text()=X` tiene semántica **existencial**: matchea si **alguno** de los nodos de texto hijos es igual a X (no "el primero").
- Que `.` (el punto) es el **string-value**: concatena el texto del elemento y de **todos** sus hijos.
- La regla práctica: usa `.` (o `normalize-space(.)`) para el texto completo; reserva `text()=X` para rótulos pegados directamente.

---

## text()=X mira los nodos de texto DIRECTOS

El `<h3>` de Pepperoni tiene **un solo** nodo de texto hijo (`"Pepperoni"`), así que `text()="Pepperoni"` matchea. Es el caso feliz: texto plano, un nivel.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/01-text-vs-punto.ts
check('//h3[text()="Pepperoni"] → 1', countXpath('//h3[text()="Pepperoni"]'), 1);
```

`text()=X` **no** significa "el primer texto". Compara contra **todos** los nodos de texto hijos con semántica **existencial**: matchea si **alguno** de ellos es igual a X. Con un único nodo de texto la distinción no se nota; se vuelve crítica cuando un elemento mezcla texto y elementos hijos.

---

## La trampa: text() NO desciende a los hijos

El `<li>` de la línea de carrito **no** tiene `"Pepperoni"` como texto directo: ese texto vive dentro de un `<span>` hijo. Por eso `text()="Pepperoni"` sobre el `<li>` da `0`. text() lee la celda padre, no las celdas anidadas. El `<span>` hijo sí lo tiene como texto directo → `1`.

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/01-text-vs-punto.ts
check(
  '//li[@data-testid="cart-line-101"][text()="Pepperoni"] → 0 (el texto está en un <span> hijo)',
  countXpath('//li[@data-testid="cart-line-101"][text()="Pepperoni"]'),
  0,
);

check(
  '//span[@class="line-name"][text()="Pepperoni"] → 1 (ahí sí es texto directo)',
  countXpath('//span[@class="line-name"][text()="Pepperoni"]'),
  1,
);
```

---

## . (punto) = string-value completo, hijos incluidos

El punto concatena el texto del elemento **y** de todos sus descendientes. Sobre el `<li>` de carrito, `.` incluye `"Pepperoni"`, `"x2"`, `"$378.00"` y la `"×"` del botón. Por eso `contains(., "Pepperoni")` **sí** matchea aunque `text()` no. Para el texto completo de un elemento usa `.` (o `normalize-space(.)`).

```ts
// @file css-xpath-qa-course/modulo-05-xpath-texto-funciones/01-text-vs-punto.ts
check(
  '//li[@data-testid="cart-line-101"][contains(., "Pepperoni")] → 1',
  countXpath('//li[@data-testid="cart-line-101"][contains(., "Pepperoni")]'),
  1,
);

check(
  '//h3[normalize-space(.)="Cuatro Quesos"] → 1',
  countXpath('//h3[normalize-space(.)="Cuatro Quesos"]'),
  1,
);
```

> 🔷 **qa_transfer:** en Playwright el equivalente de `text()` exacto es `page.getByText("Pepperoni", { exact: true })`; el de `contains(., ...)` es `page.getByText("Pepperoni")` (subcadena). Mismo dilema texto-directo vs string-value, distinto motor.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-xpath-texto-funciones/01-text-vs-punto.ts
```

---

## Qué observar

- `text()=X` solo ve los **nodos de texto directos** del elemento: el `<li>` da `0` porque su texto vive en un `<span>` hijo.
- Su semántica es **existencial** (matchea si **algún** nodo de texto hijo = X), no "el primero" — un punto sutil que importa cuando hay varios nodos de texto.
- `.` es el **string-value**: junta el texto de todos los descendientes; por eso `contains(., ...)` atrapa texto anidado.
- Para comparar el texto **completo y visible** de un elemento, prefiere `normalize-space(.)` antes que `text()`.

➡️ Siguiente: [5.2 contains() y starts-with()](/docs/css-xpath/m5-contains-starts-with)
