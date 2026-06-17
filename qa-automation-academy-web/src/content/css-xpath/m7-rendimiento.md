# 7.3 — Rendimiento y fragilidad

> **Módulo 7 · CSS vs XPath y resiliencia**

> **Analogía QA:** un selector lento o frágil es como una prueba *flaky*: hoy pasa, mañana truena con un cambio cosmético. Los dos grandes pecados son ejes demasiado **amplios** (que obligan al motor a escanear medio DOM) y caminos **absolutos** atados a la estructura (`/html/body/div[2]/...`) que se rompen cuando alguien envuelve algo en un nuevo `<div>`.

---

## ¿Qué aprendes?

- Por qué `//div//span` y los caminos profundos son lentos: **podar el eje** anclando en un contenedor estable.
- Por qué el XPath **absoluto** (`/html/body/...`) es correcto hoy y frágil siempre.
- El guardrail clave: **`:nth-of-type(3)` no es "la 3ª pizza"**.
- La diferencia entre **`:nth-child`** y **`:nth-of-type`** con hermanos de tipos mezclados.

---

## Podar el eje: amplio vs corto

`//div//span` arranca en **cualquier** `div` del documento y baja a **cualquier** `span` descendiente: el motor evalúa un universo enorme. Anclar primero en un contenedor con `testid` y bajar lo mínimo da el **mismo** nodo con una fracción del trabajo. Target: el monto del total del carrito.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
const amplio = countCss("aside .cart-summary span.amount");
const podado = countCss('[data-testid="cart-total"] .amount');
check("camino amplio encuentra el monto", amplio, 1);
check("camino podado (testid) encuentra el monto", podado, 1);
const a1 = $$("aside .cart-summary span.amount")[0];
const a2 = $$('[data-testid="cart-total"] .amount')[0];
check("ambos caminos aterrizan en el mismo nodo", a1 === a2, true);
```

---

## XPath absoluto: correcto hoy, frágil siempre

`/html/body/header` funciona... mientras nadie reordene el `<body>`. Un camino absoluto codifica la **posición**, no la **intención**. El relativo `//header` (o mejor, por `testid`) sobrevive a reordenamientos. Los dos dan 1 hoy.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
const absoluto = countXpath("/html/body/header");
const porTestid = countCss('[data-testid="app-header"]');
check("XPath absoluto /html/body/header cuenta 1 (hoy)", absoluto, 1);
check("por testid [data-testid=app-header] cuenta 1 (siempre)", porTestid, 1);
```

---

## Guardrail: `:nth-of-type(3)` NO es "la 3ª pizza"

`:nth-of-type(N)` = *"elemento que es del **tipo** Y, y además el N-ésimo hermano de **su tipo**"*. `:nth-child(N)` = *"el N-ésimo hijo, sin importar tipo"*. Cuando los hermanos son de **tipos mezclados**, divergen. En `.catalog` los hijos directos son `div.category-bar`, `h2.section-heading`, `div.pizza-grid` y `fieldset.toppings` — tipos mezclados. Mira cómo el 2.º cambia según el pseudo:

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
const segundoChild = $$(".catalog > :nth-child(2)")[0] as Element;   // el 2.º HIJO
const segundoType = $$(".catalog > :nth-of-type(2)")[0] as Element;  // el 2.º de su tipo
check("'.catalog > :nth-child(2)' es el <h2>", segundoChild?.tagName, "H2");
check("'.catalog > :nth-of-type(2)' es el .pizza-grid (div)", attr(segundoType, "data-testid"), "pizza-grid");
check("nth-child y nth-of-type apuntan a nodos DISTINTOS", segundoChild === segundoType, false);
```

> ⚠️ **CSS no tiene "el N-ésimo filtrado por clase".** No existe "la tercera `.pizza-card`" como pseudo-clase. `:nth-of-type` cuenta por **tipo de etiqueta** entre hermanos, no por la clase ni por un criterio de negocio. Nunca leas `article:nth-of-type(3)` como "la 3ª pizza".

Dentro de `.pizza-grid` **todos** los hijos son `<article>`, así que ahí `:nth-child` y `:nth-of-type` coinciden — pero eso **no** los hace "la 3ª pizza": siguen contando **posición** entre hermanos del tipo `article`. Si insertan un `<article>` de publicidad antes, el conteo se corre.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
const grid3of = $$(".pizza-grid article:nth-of-type(3)")[0] as Element;
const grid3ch = $$(".pizza-grid article:nth-child(3)")[0] as Element;
check("en .pizza-grid (hijos homogéneos) nth-of-type y nth-child coinciden", grid3of === grid3ch, true);
check("ese 3er article es la tarjeta 103 — por POSICIÓN, no por ser 'la 3ª pizza'", attr(grid3of, "data-testid"), "pizza-card-103");
```

---

## La lección: posición = frágil, intención = resiliente

El mismo target (la tarjeta agotada) por **posición** se rompe al reordenar; por **intención** (su `testid` o su estado `is-soldout`) es estable.

```ts
// @file css-xpath-qa-course/modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
const porPosicion = $$(".pizza-grid article:nth-child(3)")[0];
const porIntencion = $$('[data-testid="pizza-card-103"]')[0];
check("posición e intención coinciden HOY, pero solo una sobrevive cambios", porPosicion === porIntencion, true);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-07-css-vs-xpath-resilientes/03-rendimiento.ts
```

---

## Qué observar

- **Poda el eje:** ancla en un contenedor estable (testid) y baja poco. Mismo nodo, mucho menos trabajo.
- El XPath **absoluto** codifica posición: se rompe al reordenar el DOM. Prefiere relativo o testid.
- **`:nth-of-type(N)` cuenta por tipo de etiqueta**, no por clase ni por negocio: jamás "la N-ésima pizza".
- Con hermanos de **tipos mezclados**, `:nth-child` y `:nth-of-type` apuntan a nodos **distintos**.

➡️ Siguiente: [7.4 La escalera de resiliencia](/docs/css-xpath/m7-escalera-resiliencia)
