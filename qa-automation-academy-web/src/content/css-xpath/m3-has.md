# 3.5 — :has(), el selector relacional

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** `:has()` invierte la pregunta. Los selectores normales **bajan** ("dame el hijo X dentro del padre"); `:has()` **sube** ("dame el padre que **tenga** un hijo X"). Es el "selector del padre" que CSS no tuvo por años: ahora puedes decir "la card que contenga un badge agotado" en una sola expresión. Y no solo padres: con combinadores (`>`, `+`, `~`) expresa **cualquier** relación.

---

## ¿Qué aprendes?

- `:has(descendiente)` para el caso "**padre que contiene**".
- Cómo `:has()` **compone** con pseudo-clases de estado (`:disabled`, `:checked`).
- `:has()` **relacional** con hermanos (`+`, `~`), no solo "contiene".
- Por qué `:has-text()` / `:text-is()` **no** son CSS estándar (son de Playwright).

---

## `:has(descendiente)` — el padre que contiene

`.pizza-card:has(> h3)` = cards que tienen un `<h3>` como **hijo directo**. Las 4 cards llevan su nombre en un `h3`, así que da **4**. El filtro útil: pasar de **contar** badges a **seleccionar la card** que tiene uno.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/05-has.ts
check("cards con un h3 hijo directo = 4", countCss(".pizza-card:has(> h3)"), 4);

// "La card que contiene el badge Sin Gluten" → 1 (Cuatro Quesos).
check("la card que tiene badge Sin Gluten = 1", countCss("article:has(.badge--sin-gluten)"), 1);
check("y es Cuatro Quesos", text($$("article:has(.badge--sin-gluten) .pizza-name")[0]), "Cuatro Quesos");

check("cards con algún badge = 3", countCss("article:has(.badge)"), 3);
```

---

## `:has()` compone con estado

"La card que contiene un botón deshabilitado" = la agotada (Suprema). `:has()` se combina con `:disabled`: relación + estado en un solo paso.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/05-has.ts
check("la card con un botón disabled = 1 (la agotada)", countCss("article:has(button:disabled)"), 1);
check("y es Suprema de Carnes", text($$("article:has(button:disabled) .pizza-name")[0]), "Suprema de Carnes");

// OJO: :has() mira DESCENDIENTES, no al elemento mismo.
check("article:has([data-sold-out]) = 0 (el atributo está en el article, no en un hijo)", countCss("article:has([data-sold-out])"), 0);
check("article[data-sold-out] = 1 (atributo en el propio elemento)", countCss("article[data-sold-out]"), 1);

check("fieldsets con algún :checked = 2", countCss("fieldset:has(:checked)"), 2);
```

> ⚠️ `:has()` mira lo que está **adentro** (descendientes). El atributo `data-sold-out` vive en el `<article>` mismo, no en un hijo, así que `article:has([data-sold-out])` da **0**. Para "el elemento tiene el atributo" usa `article[data-sold-out]`; reserva `:has()` para lo que cuelga dentro.

---

## `:has()` relacional con hermanos (`+` y `~`)

`:has()` no se limita a hijos. Con el combinador `+` describe **hermanos adyacentes**. `h1:has(+ .market-picker)` = "el `h1` seguido inmediatamente por el `market-picker`". En el login, el hero `<h1>` precede al selector de mercado, así que da **1**.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/05-has.ts
check("h1 seguido del market-picker = 1", countCss("h1:has(+ .market-picker)"), 1);
check("y ese h1 es el hero del login", text($$("h1:has(+ .market-picker)")[0]).startsWith("Crafting"), true);

// "El article cuyo h3 es seguido por un párrafo" (nombre + descripción) → las 4.
check("cards con 'h3 + p' (nombre seguido de descripción) = 4", countCss("article:has(h3 + p)"), 4);
```

---

## `:has-text()` / `:text-is()` **no** son CSS estándar

> ⚠️ **Guardrail.** Playwright implementa `:has()` en su **propio** motor de selectores, y ahí también ofrece pseudos **custom** como `:has-text()` y `:text-is()`. Esos **no** existen en CSS: si los pasas a `querySelectorAll` (como aquí, offline) **lanzan error**. En `.ts` usa **siempre** `:has()` estándar. Si quieres filtrar por texto en Playwright, usa su API (`getByText` / `{ hasText }`), no un pseudo dentro de un CSS que vaya a correr en el navegador crudo.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/05-has.ts
let lanzo = false;
try {
  // :has-text() NO es CSS: querySelectorAll lo rechaza.
  countCss(".pizza-card:has-text('Pepperoni')");
} catch {
  lanzo = true;
}
check(":has-text() lanza error en CSS estándar (no es del lenguaje)", lanzo, true);

// La forma estándar: :has() + un hook estructural (el texto se filtra en código o con la API de PW).
check("forma estándar: card cuyo nombre vive en un h3", countCss('.pizza-card:has(h3.pizza-name)'), 4);
```

---

## Aplicación QA: aserciones relacionales de un vistazo

`:has()` permite afirmar relaciones sin recorrer el DOM a mano: "el resumen que contiene el monto total", "la línea de carrito que tiene botón de eliminar".

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/05-has.ts
check("la fila de resumen que tiene .amount (el total) = 1", countCss(".summary-row:has(.amount)"), 1);
check("líneas de carrito con botón eliminar = 2", countCss("li.cart-line:has(.line-remove)"), 2);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-css-pseudoclases/05-has.ts
```

---

## Qué observar

- `:has()` selecciona el **ancestro/elemento de la izquierda**, no el descendiente: es el "selector del padre".
- Compone con estado (`:has(button:disabled)`) y con combinadores de hermano (`h1:has(+ .market-picker)`).
- `:has()` mira **descendientes**: para "tiene el atributo en sí mismo" usa `[attr]`, no `:has([attr])`.
- `:has-text()` / `:text-is()` son **de Playwright**, no CSS: en `querySelectorAll` lanzan error. Usa `:has()` estándar.

➡️ Siguiente: [Reto M3](/docs/css-xpath/m3-reto)
