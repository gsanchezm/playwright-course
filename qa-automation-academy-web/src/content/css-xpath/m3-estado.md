# 3.1 — Pseudo-clases de estado

> **Módulo 3 · CSS Pseudo-clases**

> **Analogía QA:** una pseudo-clase de **estado** afirma sobre la **condición** de un control, no sobre su HTML. No preguntas "¿este input tiene el atributo `checked` en el markup?", preguntas "¿está **marcado** ahora?". Es la diferencia entre leer el código fuente y leer la pantalla: el estado es lo que el usuario ve y lo que tú asiertas en una prueba.

---

## ¿Qué aprendes?

- `:checked` para checkboxes y radios **marcados**.
- `:disabled` y `:enabled` para controles **bloqueados** o **disponibles**.
- `:focus` como estado **dinámico** (vacío en un fixture estático).
- Por qué **no** debes localizar con `:hover`, y por qué en Playwright prefieres los matchers `toBeChecked()` / `toBeDisabled()`.

---

## `:checked` — controles marcados

`:checked` matchea cualquier control marcado: checkbox **o** radio. En OmniPizza hay un checkbox marcado (Queso extra) y un radio marcado (Tarjeta), así que el total es **2**.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/01-estado.ts
// :checked matchea checkbox Y radio marcados.
check("input:checked (checkbox queso + radio card)", countCss("input:checked"), 2);
check("checkbox marcado en toppings", countCss(".toppings input:checked"), 1);
check("radio marcado en payment", countCss(".payment input:checked"), 1);

// No basta contar: verificamos CUÁL está marcado.
check("el checkbox marcado es 'queso'", attr($$(".toppings input:checked")[0], "value"), "queso");
```

---

## `:disabled` — controles bloqueados

`:disabled` matchea inputs **y** botones con el atributo `disabled`. Hay 2 inputs deshabilitados (Jalapeño y Transferencia) y 2 botones (la card agotada y *Place order*): `:disabled` total = **4**.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/01-estado.ts
check("input:disabled (jalapeño + transferencia)", countCss("input:disabled"), 2);
check("button:disabled (add-to-cart-103 + place-order)", countCss("button:disabled"), 2);
check(":disabled total (inputs + botones)", countCss(":disabled"), 4);

// El botón de la pizza agotada está deshabilitado: "no se puede agregar".
check("add-to-cart de la card agotada está disabled", countCss('button[data-testid^="add-to-cart-"]:disabled'), 1);
```

---

## `:enabled` — el complemento de `:disabled`

`:enabled` matchea **todo** control interactuable que **no** está deshabilitado. Hay 13 inputs en el documento; 2 están `disabled`, así que **11** quedan habilitados. Y las pseudo-clases se **combinan**: el radio Tarjeta está marcado *y* habilitado.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/01-estado.ts
check("inputs habilitados (13 totales − 2 disabled)", countCss("input:enabled"), 11);
check("radio marcado y habilitado", countCss(".payment input:enabled:checked"), 1);
```

---

## `:focus` — estado dinámico, vacío en un fixture estático

`:focus` matchea el elemento que **tiene el foco ahora**. En un fixture estático (sin interacción) nadie tiene el foco, así que da **0**. El foco aparece tras `.focus()` / `.click()`; no es algo que viva en el markup.

```ts
// @file css-xpath-qa-course/modulo-03-css-pseudoclases/01-estado.ts
check(":focus en fixture estático = 0", countCss(":focus"), 0);
```

> ⚠️ **`:hover` no es para localizar.** `:hover` describe "el mouse está encima": un estado que solo existe durante una **interacción**. En Playwright **no** localizas con `:hover`; ejecutas la acción `page.hover(...)` y luego asiertas el **efecto** (un tooltip visible, una clase). Y aunque el *selector* `:checked` / `:disabled` funciona, en Playwright el idiomático es el **matcher de estado**, que reintenta y da mejores mensajes:
> ```ts
> await expect(page.getByRole("checkbox", { name: "Queso extra" })).toBeChecked();
> await expect(page.getByTestId("place-order-desktop")).toBeDisabled();
> ```
> El selector cuenta; el matcher **afirma**. En una prueba real, prefiere afirmar.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-03-css-pseudoclases/01-estado.ts
```

---

## Qué observar

- `:checked` no distingue checkbox de radio: cuenta **ambos** (total 2 en OmniPizza).
- `:disabled` abarca inputs **y** botones (total 4); `:enabled` es exactamente su complemento.
- `:focus` da 0 sin interacción: el foco es **dinámico**, no está en el HTML.
- Las pseudo-clases de estado se **encadenan** (`:enabled:checked`) para afirmar combinaciones.

➡️ Siguiente: [3.2 Estructurales: nth-child y nth-of-type](/docs/css-xpath/m3-estructurales)
