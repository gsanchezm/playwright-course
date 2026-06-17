# 1.2 — Selectores por tipo, clase e id

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** son los tres niveles de "puntería" de un selector. El **tipo** (`h3`, `button`) apunta a todos los elementos de una etiqueta; la **clase** (`.pizza-card`) apunta a un grupo que comparte un rol; el **id** (`#login-form`) apunta a un único elemento. Es el ABC de CSS: con estos tres ya localizas casi cualquier cosa.

---

## ¿Qué aprendes?

- El **selector de tipo**: el nombre de la etiqueta tal cual (`h3`, `button`).
- El **selector de clase**: un punto + el nombre (`.pizza-card`), el caballo de batalla en QA.
- El **selector de id**: una almohadilla + el id (`#login-form`), la puntería más fina.
- Que un elemento puede tener **varias clases** y cada una lo alcanza por separado.

---

## Selector de tipo: el nombre de la etiqueta

`h3` matchea **todos** los `<h3>` del documento. En OmniPizza cada pizza tiene su nombre en un `<h3>`, así que hay uno por tarjeta: 4 en total. El tipo es el selector **menos específico**: no lo uses solo si quieres un subconjunto.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/02-tipo-clase-id.ts
// `h3` matchea TODOS los <h3>: hay uno por tarjeta.
check("hay 4 <h3> (un nombre de pizza por tarjeta)", countCss("h3"), 4);

// `button` matchea TODOS los <button>: banderas, chips, agregar, login, etc.
check("hay 18 <button> en toda la página", countCss("button"), 18);
```

---

## Selector de clase: un punto + el nombre

`.pizza-card` matchea todo elemento cuyo atributo `class` **contenga** esa clase. Es el caballo de batalla en QA: agrupa elementos por su **rol** en la UI.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/02-tipo-clase-id.ts
check("hay 4 .pizza-card", countCss(".pizza-card"), 4);
check("hay 3 .badge (Popular, Sin Gluten, Nuevo)", countCss(".badge"), 3);

// Un elemento puede tener VARIAS clases: la 3.ª tarjeta es "pizza-card is-soldout".
check("1 tarjeta está agotada (.is-soldout)", countCss(".pizza-card.is-soldout"), 1);
```

Encadenar clases **sin espacio** (`.pizza-card.is-soldout`) exige que el mismo elemento tenga **ambas** clases — es un AND sobre un solo nodo, no una relación de descendencia.

---

## Selector de id: una almohadilla + el id

Un id debe ser **único** en la página, así que `#login-form` apunta a **un solo** elemento. Es la puntería más fina... cuando el id existe y es estable.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/02-tipo-clase-id.ts
check("hay exactamente 1 #login-form", countCss("#login-form"), 1);

// Y ese único elemento es el <form> de login.
const form = $$("#login-form")[0];
check("#login-form es un <form>", form.tagName, "FORM");
check("#login-form tiene el data-testid 'login-form'", attr(form, "data-testid"), "login-form");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/02-tipo-clase-id.ts
```

---

## Qué observar

- **Tipo** (`h3`): el más amplio; matchea por etiqueta y suele devolver muchos.
- **Clase** (`.pizza-card`): agrupa por rol; el más usado para localizar en QA.
- **Id** (`#login-form`): único por definición; la puntería más fina si es estable.
- `.pizza-card.is-soldout` (clases pegadas) = un mismo elemento con **ambas** clases.

➡️ Siguiente: [1.3 Agrupación y selector universal](/docs/css-xpath/m1-agrupacion-universal)
