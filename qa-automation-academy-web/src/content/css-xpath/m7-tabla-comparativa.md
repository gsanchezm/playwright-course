# 7.1 — Tabla comparativa CSS vs XPath

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** elegir entre CSS y XPath es como elegir entre un atajo de teclado y un menú completo. CSS es rápido, legible y nativo en `querySelector`; XPath es el menú completo: puede ir por **texto**, hacia **arriba** (padre/ancestro) y por **ejes** que CSS no tiene. Saber qué pide cada caso es media batalla de un selector resiliente.

---

## ¿Qué aprendes?

- Qué hace **solo XPath**: localizar por **texto**, subir al **padre/ancestro** y recorrer **ejes** hacia atrás.
- Dónde **gana CSS**: rendimiento, legibilidad y **multi-clase nativa** (`.pizza-card`).
- Que la mayoría de los targets son alcanzables por **ambos** motores y deben devolver el **mismo conteo**.
- A comprobar que dos selectores distintos aterrizan en el **mismo nodo** (identidad, no solo conteo).

---

## Empate: un mismo target, dos motores

Las tarjetas de pizza son `<article class="pizza-card ...">`. CSS las toma con `.pizza-card` (multi-clase nativo). XPath 1.0 **no** tiene selector de clase, así que usa el idioma de la *clase acolchada* (lo veremos a fondo en 7.2). Ambos cuentan **4**: el mismo nodo-set, distinta sintaxis.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
const cardsCss = countCss(".pizza-card");
const cardsXpath = countXpath(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]",
);
check("CSS .pizza-card cuenta 4", cardsCss, 4);
check("XPath (clase acolchada) cuenta 4", cardsXpath, 4);
check("CSS y XPath coinciden en el mismo target", cardsCss === cardsXpath, true);
```

---

## Solo XPath (1): localizar por texto

CSS no puede preguntar *"¿qué elemento dice 'Pepperoni'?"*. XPath sí, con `normalize-space(.)` (el texto completo, recortado). Este es el peldaño **getByText** de la escalera de resiliencia (7.4).

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
const h3Pepperoni = countXpath("//h3[normalize-space(.)='Pepperoni']");
check("XPath encuentra el h3 que dice 'Pepperoni'", h3Pepperoni, 1);
```

> ⚠️ Usa `normalize-space(.)` y **no** `text()` para el texto completo del elemento. `text()=X` compara contra **cada** nodo de texto hijo con semántica existencial (matchea si *alguno* es igual), no "el texto del elemento". Lo verás morder en 7.5.

---

## Solo XPath (2): subir al padre / ancestro

CSS solo baja y va de lado (descendiente, hijo, hermano). XPath puede ir **hacia atrás** con `parent::` y `ancestor::`. Aquí, del `h3` con texto subimos a su `<article>` (la tarjeta) y luego a la `<section>` contenedora.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
const cardDePepperoni = countXpath(
  "//h3[normalize-space(.)='Pepperoni']/parent::article",
);
const sectionDePepperoni = countXpath(
  "//h3[normalize-space(.)='Pepperoni']/ancestor::section",
);
check("parent::article sube a la tarjeta de Pepperoni", cardDePepperoni, 1);
check("ancestor::section sube a la sección del catálogo", sectionDePepperoni, 1);
```

---

## CSS gana: multi-clase en una sola token

Para *"tarjeta de pizza agotada"* CSS combina clases en una token corta: `.pizza-card.is-soldout`. En XPath necesitas **dos** `contains(concat(...))` encadenados. Mismo resultado (1 nodo), pero el CSS es mucho más legible.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
const agotadaCss = countCss(".pizza-card.is-soldout");
const agotadaXpath = countXpath(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]" +
    "[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
);
check("CSS .pizza-card.is-soldout cuenta 1", agotadaCss, 1);
check("XPath equivalente (verboso) también cuenta 1", agotadaXpath, 1);
```

Y el resumen vivo: el **mismo nodo** por ambos caminos (identidad de nodo, no solo conteo).

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
const porCss = $$(".pizza-card.is-soldout")[0];
const porXpath = $x(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
)[0] as Element;
check("ambos motores aterrizan en el mismo nodo", porCss === porXpath, true);
check("y ese nodo es la tarjeta 103 (Suprema)", text(porCss?.querySelector("h3")), "Suprema de Carnes");
```

---

## La tabla, de un vistazo

| Capacidad | CSS | XPath 1.0 |
| --- | --- | --- |
| Localizar por **texto** del elemento | ❌ | ✅ `normalize-space(.)='...'` |
| Subir al **padre / ancestro** | ❌ | ✅ `parent::` / `ancestor::` |
| **Ejes hacia atrás** (ancestor, preceding, preceding-sibling) | ❌ | ✅ |
| **Multi-clase** en una token | ✅ `.a.b` | ⚠️ verboso (`concat` acolchado) |
| Selector de **clase** | ✅ `.x` | ❌ (no existe; se simula) |
| **Rendimiento** y legibilidad | ✅ | ⚠️ |

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/01-tabla-comparativa.ts
```

---

## Qué observar

- Para targets "normales", CSS y XPath devuelven el **mismo conteo**: elige por legibilidad.
- **Solo XPath** llega por texto y hacia arriba (padre/ancestro). Cuando lo necesites, no hay alternativa en CSS.
- La **multi-clase** es trivial en CSS (`.a.b`) y verbosa en XPath (clase acolchada × N).
- Dos selectores distintos pueden apuntar al **mismo nodo**: compruébalo con `===`, no solo con el conteo.

➡️ Siguiente: [7.2 Clase exacta en XPath](/docs/css-xpath/m7-clase-exacta-xpath)
