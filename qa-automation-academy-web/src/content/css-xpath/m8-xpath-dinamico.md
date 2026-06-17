# 8.3 — XPath dinámico

> **Módulo 8 · Técnicas del 1%**

> **Analogía QA:** a veces el texto que buscas **tiene comillas o apóstrofes**, o tu condición combina varios criterios (data-driven). XPath 1.0 te da las piezas para construir esa consulta sin romperte: `concat()` para literales con comillas, predicados `and`/`or` para condiciones compuestas, y `translate()` para comparar sin distinguir mayúsculas. Son las herramientas para el XPath que **no** puedes escribir como una cadena estática simple.

---

## ¿Qué aprendes?

- A meter una comilla o apóstrofe en un literal XPath con `concat()` (XPath **no** tiene escape con `\`).
- A combinar condiciones con predicados `[ A and B ]` / `[ A or B ]`.
- A comparar **sin distinguir mayúsculas** con `translate()` (en el navegador no existe `lower-case()`).
- La trampa de jsdom con la indexación entre paréntesis `(//x)[n]` y por qué el **navegador es la verdad**.

---

## `concat()`: meter una comilla dentro de un literal XPath

XPath 1.0 **no** tiene escape con backslash. Si tu texto contiene un apóstrofe y delimitas con apóstrofes, no puedes "escaparlo": tienes que partir el literal en pedazos y unirlos con `concat()`, metiendo la comilla como su **propio** literal (delimitado con el **otro** tipo de comilla).

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/03-xpath-dinamico.ts
const xpConcat = "//h1[normalize-space()=concat('Crafting moments of pure flavor', '.')]";
check("h1 reconstruido con concat() -> 1", countXpath(xpConcat), 1);
```

El molde para un texto con **apóstrofe** (no hay uno así en el fixture, pero esta es la receta):

```text
concat("It", "'", "s gluten free")   ->   It's gluten free
  · "It" y "s gluten free" van con comillas dobles.
  · el apóstrofe va SOLO, delimitado con comillas dobles: "'".
```

> ⚠️ **Sin backslash en XPath.** No existe `'It\'s'`. Las comillas son **literales separados** que pegas con `concat()`. Esta es la única forma portable de buscar texto con apóstrofes/comillas en XPath 1.0 (navegador, Playwright, Selenium).

---

## Predicados compuestos: `[ A and B ]` / `[ A or B ]`

"El formulario que tiene un botón **deshabilitado** **y** además un input **inválido**": describe el checkout (`place-order` disabled + `zip` `aria-invalid`). El login **no** cumple (su botón no está disabled). → exactamente 1.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/03-xpath-dinamico.ts
const formBloqueado = "//form[.//button[@disabled] and .//input[@aria-invalid='true']]";
check("form con boton disabled Y input invalido -> 1", countXpath(formBloqueado), 1);
check(
  "es el checkout-form",
  attr($x(formBloqueado)[0] as Element, "data-testid"),
  "checkout-form",
);

// OR: "botones deshabilitados O presionados (aria-pressed)".
check(
  "//button[@disabled or @aria-pressed='true'] -> 3",
  countXpath("//button[@disabled or @aria-pressed='true']"),
  3,
);
```

---

## `translate()`: comparación case-insensitive

En el navegador **no** existen `lower-case()` ni `matches()` (eso es XPath 2.0+, que los navegadores **no** implementan). Para ignorar mayúsculas mapeas `A-Z` → `a-z` con `translate()` y comparas en minúsculas. Así `"Sign In"` matchea aunque escribamos `'sign in'`.

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/03-xpath-dinamico.ts
const botonInsensible =
  "//button[translate(normalize-space(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='sign in']";
check("boton 'sign in' (case-insensitive) -> 1", countXpath(botonInsensible), 1);
check(
  "es el login-button-desktop",
  attr($x(botonInsensible)[0] as Element, "data-testid"),
  "login-button-desktop",
);
```

> 🔷 **XPath del navegador = XPath 1.0.** No hay `lower-case()`, `matches()` ni `ends-with()`. Case-insensitive se hace con `translate()`; "termina con" se simula con `substring()`. Si copias un XPath 2.0 de internet, fallará silenciosamente.

---

## La trampa de jsdom: la indexación con paréntesis `(//x)[n]`

Hay una diferencia conceptual que **importa**:

- `(//x)[n]` = "aplana **todos** los `//x` en una sola lista y toma el n-ésimo **global**".
- `//x[n]` = "para **cada** padre, toma su n-ésimo hijo `//x`" (**por-padre**).

Cuando los `//x` cuelgan de varios padres, los dos **no** son lo mismo. En el carrito hay **6** `<span>` repartidos en 2 `<li>` (3 por `li`). Ese conteo total **sí** lo verificamos, porque todos los motores coinciden:

```ts
// @file css-xpath-qa-course/modulo-08-tecnicas-1-percent/03-xpath-dinamico.ts
const spansEnCarrito = "//li[contains(@class,'cart-line')]//span";
check("hay 6 <span> dentro de las cart-line (2 li x 3)", countXpath(spansEnCarrito), 6);
```

Pero el indexado parentizado **diverge según el motor**:

| Expresión | Navegador / Playwright / Selenium | jsdom (este runner) |
| --- | --- | --- |
| `(//li…//span)[1]` | **1** nodo (el 1º **global**) | **2** nodos (1 por `li`) |
| `//li…//span[1]` | 2 nodos (por-padre) | 2 nodos (por-padre) |

> ⚠️ **jsdom = aproximador de sintaxis; el navegador = verdad del comportamiento.** jsdom evalúa `(//x)[1]` como si fuera `//x[1]` (por-padre), así que **no** hacemos `check()` del resultado parentizado: jsdom mentiría. En un navegador real —y en `page.locator("xpath=(//x)[1]")` de Playwright, que delega en el `document.evaluate` del navegador— `(//x)[1]` sí selecciona **un solo** nodo global. Cuando quieras "el N-ésimo de toda la página", parentiza; y verifícalo en el navegador, no en jsdom.

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-08-tecnicas-1-percent/03-xpath-dinamico.ts
```

---

## Qué observar

- `concat()` es la **única** forma de meter comillas/apóstrofes en un literal XPath: literales separados, sin backslash.
- `and`/`or` en el predicado combinan condiciones; el conjunto sigue siendo "el elemento que cumple esto", no posicional.
- `translate()` cubre el case-insensitive que el navegador no trae como función dedicada.
- `(//x)[n]` ≠ `//x[n]` cuando hay varios padres; **jsdom no distingue los dos**, el navegador sí. Confía en el navegador.

➡️ Siguiente: [8.4 Shadow DOM](/docs/css-xpath/m8-shadow-dom)
