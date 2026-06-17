// ============================================================
// Mini-clase 3.2: Estructurales — :first-child, :last-child,
//                 :nth-child vs :nth-of-type
// ============================================================
// Analogía QA: localizar por POSICIÓN es como decir "el primer renglón de la
// tabla" en vez de "el renglón con id 101". Es frágil (si cambia el orden, se
// rompe), pero a veces es lo único que tienes. Lo PELIGROSO es confundir dos
// posiciones que SUENAN iguales pero cuentan distinto: nth-child cuenta TODOS
// los hermanos; nth-of-type cuenta solo los del MISMO tipo de etiqueta.
// ============================================================
import { countCss, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 3.2 Estructurales: nth-child y nth-of-type =====");

// ------------------------------------------------------------
// 1) :first-child / :last-child — el primero y el último hermano
// ------------------------------------------------------------
// :first-child matchea un elemento SOLO si es el PRIMER hijo de su padre.
// En la lista del carrito, la primera línea es Pepperoni y la última Cuatro
// Quesos (solo hay 2 líneas).
titulo(":first-child / :last-child");
check("primera línea del carrito = Pepperoni", text($$(".cart-lines li:first-child .line-name")[0]), "Pepperoni");
check("última línea del carrito = Cuatro Quesos", text($$(".cart-lines li:last-child .line-name")[0]), "Cuatro Quesos");

// En la barra de categorías, el primer chip es "Todas" y el último
// "Acompañamientos".
check("primer chip = Todas", text($$(".category-bar .chip:first-child")[0]), "Todas");
check("último chip = Acompañamientos", text($$(".category-bar .chip:last-child")[0]), "Acompañamientos");

// En el grid (donde TODOS los hijos son <article>), la primera card es
// Pepperoni y la última Pan de Ajo.
check("primera card del grid = Pepperoni", text($$(".pizza-grid article:first-child .pizza-name")[0]), "Pepperoni");
check("última card del grid = Pan de Ajo", text($$(".pizza-grid article:last-child .pizza-name")[0]), "Pan de Ajo");

// ------------------------------------------------------------
// 2) El grid es HOMOGÉNEO: aquí nth-child == nth-of-type
// ------------------------------------------------------------
// Cuando TODOS los hermanos son del mismo tipo (4 <article>), las dos formas
// de contar coinciden: el 1er hijo ES el 1er article.
titulo("hermanos homogéneos: las dos cuentas coinciden");
check(".pizza-grid > article:nth-child(1)", countCss(".pizza-grid > article:nth-child(1)"), 1);
check(".pizza-grid > article:nth-of-type(1)", countCss(".pizza-grid > article:nth-of-type(1)"), 1);
check(".pizza-grid > article:first-of-type", countCss(".pizza-grid > article:first-of-type"), 1);

// ------------------------------------------------------------
// 3) MIXED-TYPE SIBLINGS: dentro de una .pizza-card las cuentas DIVERGEN
// ------------------------------------------------------------
// Los hijos de una card NO son homogéneos. En las cards CON badge el orden es:
//   img · span.badge · h3 · p · span.price · button
// y en Pan de Ajo (SIN badge):
//   img ·            h3 · p · span.price · button
//
// El precio (span.price) cae en POSICIONES DISTINTAS según haya badge:
//   - con badge:  es el 5º HIJO  (nth-child(5))  y el 2º SPAN (nth-of-type(2))
//   - sin badge:  es el 4º HIJO  (nth-child(4))  y el 1er SPAN (nth-of-type(1))
titulo("nth-child cuenta TODOS los hermanos; nth-of-type solo los del tipo");

// nth-child(5) = solo las 3 cards con badge (ahí el precio es el 5º hijo).
check(".price como 5º HIJO (3 cards con badge)", countCss(".pizza-card .price:nth-child(5)"), 3);
// nth-child(4) = solo Pan de Ajo (sin badge, el precio sube a 4º hijo).
check(".price como 4º HIJO (solo Pan de Ajo)", countCss(".pizza-card .price:nth-child(4)"), 1);

// nth-of-type(2) cuenta solo entre <span>: el precio es el 2º span SI hay badge.
check(".price como 2º SPAN (3 cards con badge)", countCss(".pizza-card span.price:nth-of-type(2)"), 3);
// nth-of-type(1): el precio es el 1er span solo en Pan de Ajo (no tiene badge).
check(".price como 1er SPAN (solo Pan de Ajo)", countCss(".pizza-card span.price:nth-of-type(1)"), 1);

// El contraste más limpio: "el primer SPAN de cada card".
//   - :first-of-type entre spans → 4 (en cada card hay un 1er span)
//   - el badge NUNCA es :first-child (el 1er hijo siempre es <img>)
check("span:first-of-type existe en las 4 cards", countCss(".pizza-card span:first-of-type"), 4);
check(".badge NUNCA es :first-child (siempre va <img> antes)", countCss(".pizza-card .badge:first-child"), 0);

// ------------------------------------------------------------
// Moraleja QA: si quieres "la card de Pepperoni", NO la pidas por posición.
// ------------------------------------------------------------
// Las posiciones se desfasan en cuanto el markup mezcla tipos o agrega/quita
// un nodo (un badge, un banner). nth-child/nth-of-type son útiles para
// AFIRMAR estructura ("hay exactamente 4 cards", "el precio va tras el nombre"),
// no para identificar UN dato. Para eso usa un hook estable: el data-testid.
titulo("preferir hooks estables sobre posición");
check("la card 101 se localiza sin contar posiciones", text($$('[data-testid="pizza-card-101"] .pizza-name')[0]), "Pepperoni");
