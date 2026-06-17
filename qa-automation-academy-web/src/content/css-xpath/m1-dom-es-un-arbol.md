# 1.1 — El DOM es un árbol

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** localizar un elemento en una página es como encontrar un dato dentro de una estructura **anidada** (un JSON, una carpeta dentro de carpetas). El navegador no ve "texto plano": ve un **árbol de nodos** con padres, hijos y hermanos. Un selector es la **ruta** hacia el nodo que te interesa.

---

## ¿Qué aprendes?

- Que el navegador convierte el HTML en un **árbol** (el DOM), no en texto plano.
- Las relaciones clave entre nodos: **padre**, **hijos**, **hermanos** y **descendientes**.
- Que un selector es una forma de describir una **posición** dentro de ese árbol.
- Cómo se ve esto en OmniPizza: el header como rama, las 4 tarjetas como hermanas.

---

## La idea central: todo elemento tiene una posición en el árbol

Tomamos el `<header>` de OmniPizza como ejemplo de "rama". Igual que en una estructura anidada, un nodo conoce a su **padre**, a sus **hijos** y a sus **hermanos**. Lo primero: un nodo tiene un **tipo** (su etiqueta) y cuelga de un **padre**.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/01-dom-es-un-arbol.ts
const header = document.querySelector("header")!;

// El header es un nodo <header>. Su tagName nos dice de qué tipo es.
check("el header es un <header>", header.tagName, "HEADER");

// PADRE: ¿de quién cuelga este nodo? El header cuelga directo del <body>.
check("el padre del header es el <body>", header.parentElement!.tagName, "BODY");
```

---

## Hijos: lo que cuelga directamente de un nodo

`.children` son los hijos **directos** (un nivel abajo), no todos los descendientes. El header de OmniPizza tiene 4 hijos directos: la marca, el nav, la búsqueda y el carrito.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/01-dom-es-un-arbol.ts
// El header tiene 4 hijos directos.
check("el header tiene 4 hijos directos", header.children.length, 4);

// El primer hijo es el enlace de la marca (<a class="brand">).
const primerHijo = header.children[0];
check("el primer hijo del header es un <a>", primerHijo.tagName, "A");
```

---

## Hermanos: nodos que comparten el mismo padre

Las 4 tarjetas de pizza son **hermanas**: todas cuelgan del mismo `.pizza-grid`. Esta relación es la base de los combinadores que verás en el Módulo 2.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/01-dom-es-un-arbol.ts
const cards = $$(".pizza-card");
const padresDistintos = new Set(cards.map((c) => c.parentElement));
check("las 4 tarjetas comparten un mismo padre (son hermanas)", padresDistintos.size, 1);
check("el padre común de las tarjetas es el .pizza-grid",
  cards[0].parentElement!.className, "pizza-grid");
```

---

## Descendientes: toda la rama hacia abajo

Dentro de una tarjeta hay un `<h3>` con el nombre de la pizza. No es hijo **directo** del grid, sino **descendiente**: el grid → la card → el h3. Distinguir "hijo directo" de "descendiente" es clave para escribir selectores precisos.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/01-dom-es-un-arbol.ts
const primeraCard = cards[0];
check("la primera tarjeta contiene un <h3>", primeraCard.querySelector("h3") !== null, true);
check("el <h3> de la primera tarjeta dice 'Pepperoni'",
  text(primeraCard.querySelector("h3")), "Pepperoni");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/01-dom-es-un-arbol.ts
```

---

## Qué observar

- El DOM es un **árbol**: cada elemento tiene un padre, posiblemente hijos y hermanos.
- **Hijo directo** (`.children`) no es lo mismo que **descendiente** (cualquier nodo de la rama hacia abajo).
- Las 4 tarjetas son **hermanas** porque comparten el mismo padre (`.pizza-grid`).
- Un selector CSS es, en el fondo, una forma de **describir una posición** en este árbol.

➡️ Siguiente: [1.2 Selectores por tipo, clase e id](/docs/css-xpath/m1-tipo-clase-id)
