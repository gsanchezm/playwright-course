# 4.3 — Predicados e índices

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** un predicado `[ ]` es la cláusula `WHERE` de tu locator: filtra el conjunto de nodos a los que cumplen una condición. Y los índices de XPath son **1-based** (el primero es `[1]`, no `[0]`): si vienes de arreglos en código, este off-by-one es el error #1. Peor aún: `//li[1]` **no** es "el primer `<li>` del documento" — es "el primer `<li>` de **cada** padre". Confundir esos dos es el bug de indexación más caro de XPath.

---

## ¿Qué aprendes?

- Que `[ ]` es un **filtro** (el `WHERE` del locator).
- Que los índices son **1-based**: `[1]` es el primero, `[0]` no existe, `last()` es el último.
- La trampa real: `//x[n]` significa "el n-ésimo **de cada padre**", no "el n-ésimo global".
- La **divergencia** de `(//x)[n]` (índice global) y por qué jsdom la evalúa mal.

---

## 1) Predicado `[ ]` = filtro

`//article[@data-category='popular']` significa "de todos los `<article>`, quédate con los que tienen `data-category='popular'`". El `[ ]` **reduce** el conjunto.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/03-predicados-e-indices.ts
check("//article (sin filtro) = 4", countXpath("//article"), 4);
check("//article[@data-category='popular'] = 1", countXpath("//article[@data-category='popular']"), 1);
```

---

## 2) Índices: 1-based

Un número en el predicado es un índice **posicional**. `//li[1]` es el primer `<li>`. Ojo: **no existe** `[0]` (devuelve vacío). `last()` es el último.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/03-predicados-e-indices.ts
check("//li = 2 (las 2 líneas del carrito)", countXpath("//li"), 2);
check("//li[1] = 1 (existe un primer li)", countXpath("//li[1]"), 1);
check("//li[0] = 0 (NO hay índice cero en XPath)", countXpath("//li[0]"), 0);
check("//li[last()] = 1 (el último li)", countXpath("//li[last()]"), 1);
// Y son nodos DISTINTOS: el primero es Pepperoni, el último Cuatro Quesos.
check("//li[1] es la línea de Pepperoni", text($x("//li[1]/span[@class='line-name']")[0]), "Pepperoni");
check("//li[last()] es la línea de Cuatro Quesos", text($x("//li[last()]/span[@class='line-name']")[0]), "Cuatro Quesos");
```

---

## 3) La trampa real: `//x[n]` = "el primero de **cada** padre"

`//li[1]` dio 1 **solo** porque los dos `<li>` comparten un único `<ul>`. El número en `//x[n]` se aplica **por padre**, no globalmente. Para verlo de verdad usa los `<label>`: hay 6 en total (3 en `toppings` + 3 en `payment`), repartidos en **dos** `<fieldset>`. `//label[1]` no es "el primer label"; es "el primer label de cada fieldset" → **dos** nodos.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/03-predicados-e-indices.ts
check("//label = 6 (3 toppings + 3 payment)", countXpath("//label"), 6);
check("//label[1] = 2 (el 1ro de cada uno de los 2 fieldsets)", countXpath("//label[1]"), 2);
check("//label[last()] = 2 (el último de cada fieldset)", countXpath("//label[last()]"), 2);
```

---

## 4) `(//x)[n]` — el índice global — y la divergencia de jsdom

Para decir "el **primero de todo el documento**" (no por-padre) se **envuelve** la búsqueda en paréntesis y luego se indexa: `(//label)[1]` = "primer label global" = **un** nodo. Esa es la diferencia entre `//label[1]` (por-padre, 2) y `(//label)[1]` (global, 1).

> ⚠️ **Divergencia del motor offline.** Nuestro `jsdom` **no** implementa bien los paréntesis: ignora el agrupamiento y evalúa `(//label)[1]` como `//label[1]`, devolviendo **2** en vez del **1** que daría un navegador real. Por eso en el `.ts` **no** hacemos `check()` de ninguna forma con paréntesis: en jsdom mienten. Verifícalo tú mismo en un navegador real: abre DevTools y ejecuta `$x("(//li)[1]")` y `$x("//li[1]")`. Playwright (`xpath=`) y Selenium (`By.xpath`) también lo evalúan **bien**, porque delegan en el `document.evaluate` del navegador. Regla del curso: **jsdom = aproximador de sintaxis; navegador/Playwright = verdad del comportamiento.**

En el companion lo exhibimos con `console.log` (no es un `check()`), para que veas el bug sin "certificarlo" como verdad:

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/03-predicados-e-indices.ts
// Demostración (NO es un check — solo exhibe el bug del aproximador):
console.log(
  "   (jsdom) (//label)[1] devuelve:",
  countXpath("(//label)[1]"),
  "→ en un navegador real sería 1 (el primer label GLOBAL).",
);
console.log(
  "   (jsdom) (//li)[1] devuelve:",
  countXpath("(//li)[1]"),
  "→ aquí coincide en 1 solo porque hay un único <ul>; no te fíes del azar.",
);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/03-predicados-e-indices.ts
```

---

## Qué observar

- `[ ]` filtra (el `WHERE`); un **número** dentro es un índice posicional.
- Los índices son **1-based**: `[1]` primero, `[0]` vacío, `last()` último.
- `//x[n]` es "el n-ésimo **de cada padre**" — `//label[1] = 2` lo prueba (dos fieldsets).
- `(//x)[n]` es el índice **global**, pero jsdom lo evalúa mal: confírmalo en DevTools, no en el companion.

➡️ Siguiente: [4.4 Atributos en XPath](/docs/css-xpath/m4-atributos)
