# 4.1 — Por qué XPath

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** CSS es un buscador por etiqueta y clase rapidísimo, pero **mudo** ante el contenido y **ciego** hacia arriba. XPath es la linterna que SÍ alumbra hacia atrás (al padre, al ancestro) y SÍ lee el **texto** del nodo. En QA, muchas veces el ancla más estable es "el botón que dice Sign In" o "la tarjeta que CONTIENE este `<h3>`": eso CSS clásico no lo sabe expresar.

---

## ¿Qué aprendes?

- Que XPath **no reemplaza** a CSS: es otra forma de direccionar el mismo árbol DOM.
- Las dos cosas que CSS clásico no puede y XPath sí: **leer el texto** del elemento y **subir al padre/ancestro**.
- La regla práctica del curso para elegir entre CSS y XPath.
- Que `countCss` y `countXpath` cuentan **lo mismo** cuando el target es alcanzable por ambos.

---

## 1) El mismo target, dos lenguajes

XPath no compite con CSS: **direcciona el mismo árbol** de otra forma. Para un target trivial (un `data-testid`), ambos cuentan exactamente lo mismo.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/01-por-que-xpath.ts
const cssLogin = countCss("button[data-testid='login-button-desktop']");
const xpLogin = countXpath("//button[@data-testid='login-button-desktop']");
check("CSS encuentra 1 botón de login", cssLogin, 1);
check("XPath encuentra ESE MISMO botón", xpLogin, 1);
check("CSS y XPath coinciden en el conteo", cssLogin === xpLogin, true);
```

---

## 2) Lo que CSS no puede #1: seleccionar por texto

CSS no tiene "selecciona el botón cuyo texto es `Sign In`". XPath sí, con `normalize-space()` (el texto del nodo, ya recortado). Esto es oro en QA: el rótulo visible suele ser más estable que una clase generada.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/01-por-que-xpath.ts
check(
  "XPath: el botón cuyo texto es 'Sign In'",
  countXpath("//button[normalize-space()='Sign In']"),
  1,
);
check(
  "XPath: el enlace cuyo texto es 'Checkout'",
  countXpath("//a[text()='Checkout']"),
  1,
);
```

---

## 3) Lo que CSS no puede #2: subir al padre

CSS selecciona hacia abajo y a los lados, **nunca hacia arriba** (y aun `:has` no "navega" como un eje). XPath tiene `..` (el padre) y ejes hacia atrás. Patrón clásico: "dame la TARJETA que contiene este `<h3>`".

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/01-por-que-xpath.ts
const tarjetaDePepperoni = $x("//h3[text()='Pepperoni']/..");
check("XPath: el padre del <h3> Pepperoni existe (1)", tarjetaDePepperoni.length, 1);
check(
  "ese padre es la <article> pizza-card",
  (tarjetaDePepperoni[0] as Element).getAttribute("data-testid"),
  "pizza-card-101",
);
```

---

## 4) Cuándo elegir cuál

Usa **CSS por defecto** (más corto y rápido). Cambia a **XPath** solo cuando necesites: (a) el **texto** del elemento, (b) **navegar hacia arriba/atrás**, o (c) **ejes** que CSS no tiene. No es "XPath vs CSS"; es "la herramienta que el árbol te pide". Aquí el target solo es alcanzable subiendo al padre y leyendo texto:

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/01-por-que-xpath.ts
const precioDeLaTarjetaConPepperoni = $x(
  "//h3[text()='Pepperoni']/../span[contains(@class,'price')]",
);
check(
  "subir al padre y bajar al precio de Pepperoni",
  text(precioDeLaTarjetaConPepperoni[0]),
  "$189.00",
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/01-por-que-xpath.ts
```

---

## Qué observar

- XPath y CSS describen el **mismo árbol**: para un `data-testid`, dan el mismo conteo.
- El superpoder #1 de XPath es **leer texto** (`normalize-space()`, `text()`): CSS no puede.
- El superpoder #2 es **subir** con `..`: el patrón "la tarjeta que contiene este `<h3>`" es imposible en CSS clásico.
- Regla práctica: CSS por defecto; XPath cuando necesites texto, ascenso o ejes.

➡️ Siguiente: [4.2 Absoluto vs relativo](/docs/css-xpath/m4-absoluto-vs-relativo)
