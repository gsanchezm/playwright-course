# 6.5 — El patrón ancla-y-navega

> **Módulo 6 · XPath Ejes**

> **Analogía QA:** este es el patrón **pro** que junta todo el módulo. En vez de describir la **ruta** completa hasta un elemento (frágil: cualquier `<div>` intermedio que cambie la rompe), anclas en el dato más **estable** que ves en pantalla (un texto humano: "Pepperoni", "Cuatro Quesos") y de ahí **navegas por eje** hasta el elemento accionable. Texto estable + salto por eje = localizador legible y resistente.

---

## ¿Qué aprendes?

- A pasar del texto de una **línea del carrito** a su `<li>` completo (y de ahí a sus datos).
- A saltar del **nombre** de una pizza a su **precio** hermano y a su **botón** accionable.
- Por qué ancla-y-navega le gana a la ruta absoluta posicional.
- Cómo se escribe el mismo patrón en **Playwright**, y por qué XPath no atraviesa el shadow DOM.

---

## Caso 1: del texto de una línea a su `<li>` completo

"Pepperoni" aparece **dos** veces: como `<h3>` en el catálogo y como `<span class="line-name">` en el carrito. Para la **línea del carrito** anclamos en el span (su texto es limpio, `text()` vale) y subimos al `<li>`. Desde ahí bajamos a su cantidad, sin contar posiciones.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/05-ancla-y-navega.ts
check("span 'Pepperoni' del carrito existe", countXpath(`//span[@class="line-name"][text()="Pepperoni"]`), 1);
const linea = $x(`//span[@class="line-name"][text()="Pepperoni"]/ancestor::li`)[0] as Element;
check("ancestor::li desde el nombre = la linea 101", attr(linea, "data-testid"), "cart-line-101");
// Y desde la linea bajamos a su cantidad, sin contar posiciones:
const qty = text($x(`//span[@class="line-name"][text()="Pepperoni"]/ancestor::li//span[@data-testid="qty-101"]`)[0]);
check("la cantidad de esa linea es 'x2'", qty, "x2");
```

---

## Caso 2: del nombre de la pizza a su precio, por hermano

En la tarjeta, el `<h3>` y el `<span class="price">` son hermanos. Anclamos en el nombre y saltamos al precio siguiente. Así el precio "pertenece" al nombre, no a una posición arbitraria del grid. Ese span tiene whitespace deliberado: `normalize-space()` (vía `text()` del helper) lo limpia.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/05-ancla-y-navega.ts
const precioSpan = $x(`//h3[normalize-space()="Pepperoni"]/following-sibling::span[@class="price"]`)[0] as Element;
// Ese span tiene whitespace deliberado: normalize-space lo limpia.
check("precio hermano de Pepperoni (normalizado) = $189.00", text(precioSpan), "$189.00");
```

---

## Caso 3: del nombre de la pizza a su botón accionable

El botón de "Suprema de Carnes" está **disabled** (está agotada). Anclar por nombre y subir a la tarjeta nos deja verificar el estado del control real.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/05-ancla-y-navega.ts
const btnSuprema = $x(`//h3[normalize-space()="Suprema de Carnes"]/ancestor::article//button[contains(@data-testid,"add-to-cart")]`)[0] as Element;
check("boton de Suprema = add-to-cart-103", attr(btnSuprema, "data-testid"), "add-to-cart-103");
check("ese boton esta deshabilitado (agotado)", btnSuprema?.hasAttribute("disabled"), true);
check("su texto es 'Agotado'", text(btnSuprema), "Agotado");
```

---

## Por qué ancla-y-navega gana a la ruta absoluta

La ruta posicional "la 4a tarjeta del grid" depende del **orden** y de que no haya nodos de otro tipo intercalados. Ancla-y-navega depende solo del texto humano + la relación estructural local, mucho más estable ante rediseños.

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/05-ancla-y-navega.ts
const porAncla = attr($x(`//h3[normalize-space()="Pan de Ajo"]/ancestor::article`)[0] as Element, "data-testid");
check("ancla('Pan de Ajo') + ancestor::article = pizza-card-104", porAncla, "pizza-card-104");
```

---

## El mismo patrón en Playwright

En Playwright el patrón se escribe encadenando un locator base (estable, por rol/texto) con un salto por eje en XPath:

```ts
// @file css-xpath-qa-course/modulo-06-xpath-ejes/05-ancla-y-navega.ts
// page.getByRole("heading", { name: "Pepperoni" })
//     .locator("xpath=ancestor::li")
```

El motor de Playwright **delega el XPath en el `document.evaluate` del navegador real**, así que el comportamiento de los ejes es idéntico al que practicas aquí.

> 🔷 **Puente a Playwright.** `getByRole(...).locator("xpath=ancestor::li")` ancla en el dato accesible estable y sube por eje al contenedor. Una limitación clave: **XPath no atraviesa el shadow DOM**. Para componentes con shadow root, ancla con `getByRole` / `getByText` (que sí perforan el shadow DOM porque **todos** los locators de Playwright lo hacen por diseño del motor) y navega **dentro** del mismo árbol, no con un salto XPath que cruce el límite del shadow root.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-06-xpath-ejes/05-ancla-y-navega.ts
```

---

## Qué observar

- Ancla en el **texto humano** estable y salta por eje: ese es el patrón resistente del módulo.
- Elige el ancla correcta según el contexto: `<h3>` para el catálogo, `<span class="line-name">` para el carrito.
- Subir con `ancestor::` y volver a bajar con `descendant::` (o `//`) localiza datos relacionados sin contar posiciones.
- En Playwright el patrón es `getByRole(...).locator("xpath=...")`; recuerda que XPath **no** cruza el shadow DOM.

➡️ Siguiente: [🚩 Reto M6](/docs/css-xpath/m6-reto)
