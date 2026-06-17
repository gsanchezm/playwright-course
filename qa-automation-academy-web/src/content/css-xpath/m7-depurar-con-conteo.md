# 7.5 — Depurar contando matches

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** antes de afirmar un bug, reproduces y **cuentas**. Lo mismo con un selector: antes de meterlo en un test, cuenta cuántos nodos matchea. El conteo te dice de inmediato qué pasa — y te ahorra una prueba *flaky*.

---

## ¿Qué aprendes?

- A usar `countCss()`/`countXpath()` (o `$$()`/`$x()`) como el **`console.log` del selector**.
- A leer el conteo: **0** = contexto/sintaxis mal; **1** = ideal; **N>1** = ambiguo.
- El gotcha del **whitespace**: `text()` crudo vs `normalize-space(.)`.
- Cómo **afinar** un selector ambiguo anclándolo por testid hasta dejarlo en 1.

---

## La regla de los tres conteos

| Conteo | Significado | Acción |
| --- | --- | --- |
| **0** | Contexto o sintaxis mal: tu ancla no existe o el selector está roto. | Arregla el ancla / revisa el DOM. |
| **1** | Ideal: un único objetivo, sin ambigüedad. | Listo. |
| **N > 1** | Ambiguo: el test tomaría el primero (o *strict mode violation* en Playwright). | Afina. |

---

## Conteo 0: el contexto equivocado

`.is-soldout` está sobre el `<article>`, **no** sobre un descendiente. Por eso *"la tarjeta que contiene un `.is-soldout`"* da **0** (ningún hijo tiene esa clase). Conteo 0 = señal de que tu modelo mental del DOM está equivocado. La intención correcta — *"tarjeta cuyo botón está deshabilitado"* — sí da 1.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
const cero = countCss("article.pizza-card:has(.is-soldout)");
check(":has(.is-soldout) cuenta 0 (la clase está en el article, no dentro)", cero, 0);

const uno = countCss("article.pizza-card:has(button[disabled])");
check(":has(button[disabled]) cuenta 1 (la tarjeta agotada)", uno, 1);
check("y ese único nodo es la Suprema de Carnes", text($$("article.pizza-card:has(button[disabled])")[0]?.querySelector("h3")), "Suprema de Carnes");
```

> 🔷 **`:has()` mira hacia adentro.** `card:has(X)` selecciona la tarjeta **si contiene** un `X` descendiente. Como `is-soldout` vive en el `<article>` mismo (no dentro de él), `:has(.is-soldout)` da 0. Para condicionar por estado del propio elemento usa `article.is-soldout`; para condicionar por un descendiente (el botón deshabilitado) usa `:has(button[disabled])`.

---

## Conteo 0 por whitespace: `text()` vs `normalize-space`

El precio de la 101 tiene whitespace deliberado: `"\n   $189.00\n  "`. En XPath, `text()='$189.00'` compara nodos de texto **crudos** → 0 matches. `normalize-space(.)='$189.00'` recorta y colapsa → 1. Si cuentas 0 donde esperabas 1, **sospecha del whitespace** antes de dudar de tu selector.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
const crudoFalla = countXpath("//span[text()='$189.00']");
const normalizado = countXpath("//span[normalize-space(.)='$189.00']");
check("text()='$189.00' cuenta 0 (whitespace crudo)", crudoFalla, 0);
check("normalize-space(.)='$189.00' cuenta 1 (recortado)", normalizado, 1);
```

> ⚠️ Recuerda además que `text()=X` tiene semántica **existencial**: compara contra **cada** nodo de texto hijo y matchea si *alguno* es igual a `X`, no "el texto del elemento". Para el texto completo y limpio usa siempre `normalize-space(.)`.

---

## Conteo N>1: el selector es ambiguo

`span.price` cuenta **4** (un precio por tarjeta). Si tu intención era **un** precio concreto, 4 es ambiguo: el test tomaría el primero por accidente. Afinas anclando en la tarjeta correcta por testid → vuelves a 1.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
const ambiguo = countCss("span.price");
check("span.price cuenta 4 (ambiguo si querías UNO)", ambiguo, 4);
const afinado = countCss('[data-testid="pizza-card-101"] span.price');
check("anclado por testid de la tarjeta vuelve a 1", afinado, 1);
```

El mismo método en XPath: cuenta antes de confiar.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
const todosLosBotones = countXpath("//button[contains(concat(' ', normalize-space(@class), ' '), ' add-to-cart ')]");
check("todos los add-to-cart cuentan 4", todosLosBotones, 4);
const botonAgotado = countXpath("//button[@data-testid='add-to-cart-103']");
check("el botón de la tarjeta agotada se afina a 1", botonAgotado, 1);
```

---

## La rutina: cuenta → 1 listo · 0 arregla el ancla · N afina

Cierre vivo: tomar un target ambiguo (4 nombres) y reducirlo a exactamente 1.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
const antes = countCss(".pizza-name");          // 4: todos los nombres
const despues = countCss('[data-testid="pizza-card-104"] .pizza-name'); // 1: Pan de Ajo
check("de 4 nombres ambiguos a 1 nombre concreto", [antes, despues], [4, 1]);
check("y ese único nombre es 'Pan de Ajo'", text($$('[data-testid="pizza-card-104"] .pizza-name')[0]), "Pan de Ajo");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/05-depurar-con-conteo.ts
```

---

## Qué observar

- Cuenta **antes** de codificar: el conteo es el `console.log` más barato de un selector.
- **0** casi siempre es ancla/contexto mal (o whitespace): revisa el DOM antes de reescribir todo.
- **N>1** es ambigüedad: ánclalo por testid hasta dejarlo en **1**.
- `text()` crudo muerde con whitespace y tiene semántica existencial: usa `normalize-space(.)`.

➡️ Siguiente: [Reto M7](/docs/css-xpath/m7-reto)
