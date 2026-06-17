# 4.2 — Absoluto vs relativo

> **Módulo 4 · XPath Fundamentos**

> **Analogía QA:** un XPath **absoluto** (`/html/body/...`) es una dirección dictada calle por calle desde la puerta de la ciudad: precisa, pero se rompe si alguien construye un piso nuevo en medio. Un XPath **relativo** (`//`) es "el primer Starbucks que encuentres": resiste reordenamientos. En QA casi **siempre** quieres el relativo: los DOMs cambian de envoltorios todo el tiempo y un absoluto es el locator más frágil que existe.

---

## ¿Qué aprendes?

- Que `/` es "hijo directo" y `//` es "descendiente a cualquier profundidad".
- Por qué el **relativo** (`//`) es el robusto y el **absoluto** (`/html/body/...`) el frágil.
- Que absoluto y relativo pueden apuntar al **mismo nodo** (cambia la fragilidad, no el destino).
- `.` (self) y `..` (padre) para navegar desde un nodo.

---

## 1) `/` = paso exacto de hijo directo

Un solo `/` significa "**hijo directo**". Una ruta absoluta empieza en la raíz del documento y describe cada nivel. `/html/body/header` es exactamente **un** nodo porque hay un único `<header>` como hijo directo de `<body>`.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/02-absoluto-vs-relativo.ts
check("/html/body/header = 1 (el header es único)", countXpath("/html/body/header"), 1);
// Hay DOS <main> hijos de <body> (login y checkout, aplanados en el fixture):
check("/html/body/main = 2 (login + checkout)", countXpath("/html/body/main"), 2);
```

---

## 2) `//` = descendiente en cualquier nivel

El doble `//` significa "**en cualquier profundidad**". `//h3` busca TODOS los `<h3>` del documento sin importar cuántos envoltorios haya por encima. Por eso es robusto: no le importa la jerarquía intermedia.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/02-absoluto-vs-relativo.ts
check("//h3 = 4 (las 4 pizzas)", countXpath("//h3"), 4);
check("//article = 4 (las 4 tarjetas)", countXpath("//article"), 4);
// El mismo //main, sin la ruta completa, da el MISMO 2: // no depende del path.
check("//main = 2 (igual que /html/body/main)", countXpath("//main"), 2);
```

---

## 3) El mismo nodo por dos caminos

No es "uno u otro correcto": describen el mismo árbol. La diferencia es **fragilidad**. Mete un `<div>` envoltorio nuevo y el absoluto se rompe; el relativo sigue encontrando el target. Por eso el curso prefiere `//`.

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/02-absoluto-vs-relativo.ts
const porAbsoluto = $x("/html/body/header");
const porRelativo = $x("//header");
check("ambos caminos cuentan 1 header", porAbsoluto.length === porRelativo.length, true);
check("y es el MISMO nodo (identidad)", porAbsoluto[0] === porRelativo[0], true);
```

> ⚠️ Un XPath absoluto es el locator más frágil del repertorio: cualquier envoltorio nuevo en la jerarquía lo rompe. En tests reales, prefiere siempre `//` con un predicado de atributo o de texto.

---

## 4) `.` (self) y `..` (padre)

`.` es el nodo actual (**self**) y `..` es su **padre**. Combinados con un paso relativo te dejan "rebotar" por el árbol. `//h3/.` devuelve los mismos `h3` (self), y `//h3/..` devuelve sus padres (las 4 `<article>` contenedoras).

```ts
// @file css-xpath-qa-course/modulo-04-xpath-fundamentos/02-absoluto-vs-relativo.ts
check("//h3/. = 4 (self: los mismos h3)", countXpath("//h3/."), 4);
check("//h3/.. = 4 (el padre <article> de cada h3)", countXpath("//h3/.."), 4);
// Y el padre del <h3> Pepperoni es exactamente su tarjeta:
const padre = $x("//h3[text()='Pepperoni']/..")[0] as Element;
check("el padre del h3 Pepperoni es pizza-card-101", padre.getAttribute("data-testid"), "pizza-card-101");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-04-xpath-fundamentos/02-absoluto-vs-relativo.ts
```

---

## Qué observar

- `/` baja **un** nivel (hijo directo); `//` baja a **cualquier** profundidad.
- El absoluto y el relativo pueden ser el **mismo nodo**: lo que cambia es la **fragilidad**.
- `//main = 2` recuerda que `//` encuentra TODAS las coincidencias, no "la primera".
- `.` es el nodo actual y `..` su padre: la puerta de entrada a navegar hacia arriba.

➡️ Siguiente: [4.3 Predicados e índices](/docs/css-xpath/m4-predicados-e-indices)
