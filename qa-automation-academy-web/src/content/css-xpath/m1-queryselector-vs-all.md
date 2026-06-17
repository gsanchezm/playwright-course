# 1.4 — querySelector vs querySelectorAll

> **Módulo 1 · CSS Fundamentos**

> **Analogía QA:** dos preguntas distintas sobre el mismo árbol. `querySelector(sel)` es "dame **el** primero" (un assert de elemento **único**); `querySelectorAll(sel)` es "dame **todos**" (una **colección** para iterar o contar). Confundirlos es un bug clásico: pides "el botón" cuando hay 18, o cuentas sobre algo que devolvió un solo nodo.

---

## ¿Qué aprendes?

- `querySelector` → devuelve **el primero** (en orden de documento) o `null`.
- `querySelectorAll` → devuelve **todos** en una colección; vacía, nunca `null`.
- El idioma "el primero de la colección": `$$(sel)[0]`.
- Que el NodeList de `querySelectorAll` es **estático**: una foto del árbol, no un vínculo vivo.

---

## querySelector: uno (el primero), o null

Devuelve el **primer** elemento que matchea, recorriendo el árbol de arriba abajo. Si nada matchea, devuelve `null` (no un array vacío), así que conviene checarlo antes de usarlo.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/04-queryselector-vs-all.ts
const primeraCard = document.querySelector(".pizza-card");
check("querySelector('.pizza-card') no es null", primeraCard !== null, true);
// El primero en orden de documento es la tarjeta 101 (Pepperoni).
check("el primer .pizza-card es la 101 (Pepperoni)",
  text(primeraCard!.querySelector("h3")), "Pepperoni");

// Cuando NADA matchea, es null (hay que checarlo antes de usarlo).
check("querySelector de algo inexistente → null",
  document.querySelector(".no-existe"), null);
```

---

## querySelectorAll: todos (una colección)

Devuelve un `NodeList` con **todos** los matches. Aunque haya 0, es una lista **vacía**, no `null`. En el curso usamos `$$()`, que lo convierte a array para tener `.length` y `.map`.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/04-queryselector-vs-all.ts
const todas = $$(".pizza-card");
check("querySelectorAll('.pizza-card') → 4 elementos", todas.length, 4);
check("countCss('.pizza-card') cuenta lo mismo", countCss(".pizza-card"), 4);

// La forma idiomática de "el primero" desde la colección: índice [0].
check("$$('.pizza-card')[0] es la misma primera tarjeta",
  text(todas[0].querySelector("h3")), "Pepperoni");

// Sin matches → array vacío (length 0), nunca null.
check("querySelectorAll de algo inexistente → 0 (no null)", countCss(".no-existe"), 0);
```

---

## El NodeList es estático: una foto del árbol

A diferencia de `getElementsByClassName` (que es "vivo"), `querySelectorAll` devuelve un **snapshot**: si después cambias el DOM, esa lista **no** se actualiza. Lo demostramos en un sub-árbol **desechable** (creado aparte) para no tocar el fixture que cuentan las demás mini-clases.

```ts
// @file css-xpath-qa-course/modulo-01-css-fundamentos/04-queryselector-vs-all.ts
const caja = document.createElement("div"); // nodo suelto, fuera del documento
caja.innerHTML = '<span class="item">a</span><span class="item">b</span>';
const foto = caja.querySelectorAll(".item"); // foto: 2 elementos
check("la foto inicial tiene 2 .item", foto.length, 2);

// Agregamos un tercer .item DESPUÉS de tomar la foto.
caja.innerHTML += '<span class="item">c</span>';
// La foto sigue mostrando 2: no se enteró del cambio (es estática).
check("la foto vieja sigue en 2 (no se actualizó)", foto.length, 2);
// Una consulta NUEVA sí ve los 3: refleja el estado actual del árbol.
check("una consulta nueva ve 3 .item", caja.querySelectorAll(".item").length, 3);
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-01-css-fundamentos/04-queryselector-vs-all.ts
```

---

## Qué observar

- `querySelector` da **uno** (el primero) o `null`; ideal cuando esperas un elemento único.
- `querySelectorAll` da **todos** en una colección; vacía es `length 0`, nunca `null`.
- "El primero de la colección" se escribe `$$(sel)[0]`.
- El NodeList es una **foto estática**: cambiar el DOM después no la actualiza; vuelve a consultar.

➡️ Siguiente: [1.5 Dónde aparece en QA](/docs/css-xpath/m1-donde-aparece-en-qa)
