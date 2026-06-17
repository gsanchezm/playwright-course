// ============================================================
// Mini-clase 5.1: text() vs . (string-value)
// ============================================================
// Analogía QA: `text()` y `.` son dos formas distintas de "leer la celda".
// `text()` lee SOLO los rótulos pegados directamente al elemento (sus nodos
// de texto hijos); `.` lee la celda COMPLETA (todo el texto que cuelga del
// elemento, incluido el de sus hijos). Elegir mal es la causa #1 de un
// locator que "debería matchear" y no matchea.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 5.1 text() vs . (string-value) =====");

// ------------------------------------------------------------
// text()=X — compara contra los NODOS DE TEXTO DIRECTOS del elemento.
// ------------------------------------------------------------
// El <h3> de Pepperoni tiene UN solo nodo de texto hijo ("Pepperoni"), así
// que `text()="Pepperoni"` matchea. Es el caso feliz: texto plano, un nivel.
titulo("text()=X mira los nodos de texto DIRECTOS");
check('//h3[text()="Pepperoni"] → 1', countXpath('//h3[text()="Pepperoni"]'), 1);

// GUARDRAIL #2: `text()=X` NO significa "el primer texto". Compara contra
// TODOS los nodos de texto hijos con semántica EXISTENCIAL: matchea si ALGUNO
// de ellos es igual a X. Con un único nodo de texto la distinción no se nota;
// se vuelve crítica cuando un elemento mezcla texto y elementos hijos.

// ------------------------------------------------------------
// La trampa: text() NO desciende a los hijos.
// ------------------------------------------------------------
// El <li> de la línea de carrito NO tiene "Pepperoni" como texto DIRECTO: ese
// texto vive dentro de un <span> hijo. Por eso `text()="Pepperoni"` sobre el
// <li> da 0. text() lee la celda padre, no las celdas anidadas.
titulo("text() no baja a los hijos");
check(
  '//li[@data-testid="cart-line-101"][text()="Pepperoni"] → 0 (el texto está en un <span> hijo)',
  countXpath('//li[@data-testid="cart-line-101"][text()="Pepperoni"]'),
  0,
);

// El <span> hijo SÍ tiene "Pepperoni" como su texto directo → 1.
check(
  '//span[@class="line-name"][text()="Pepperoni"] → 1 (ahí sí es texto directo)',
  countXpath('//span[@class="line-name"][text()="Pepperoni"]'),
  1,
);

// ------------------------------------------------------------
// `.` (punto) — el STRING-VALUE: TODO el texto que cuelga del elemento.
// ------------------------------------------------------------
// El punto concatena el texto del elemento Y de todos sus descendientes. Sobre
// el <li> de carrito, `.` incluye "Pepperoni", "x2", "$378.00" y la "×" del
// botón. Por eso `contains(., "Pepperoni")` SÍ matchea aunque text() no.
titulo(". (punto) = string-value completo, hijos incluidos");
check(
  '//li[@data-testid="cart-line-101"][contains(., "Pepperoni")] → 1',
  countXpath('//li[@data-testid="cart-line-101"][contains(., "Pepperoni")]'),
  1,
);

// Regla práctica: para el texto COMPLETO de un elemento usa `.` (o
// normalize-space(.)); reserva text()=X para cuando el rótulo está pegado
// directamente al elemento y quieres una igualdad estricta.
check(
  '//h3[normalize-space(.)="Cuatro Quesos"] → 1',
  countXpath('//h3[normalize-space(.)="Cuatro Quesos"]'),
  1,
);

// qa_transfer: en Playwright el equivalente de text() exacto es
// page.getByText("Pepperoni", { exact: true }); el de contains(., ...) es
// page.getByText("Pepperoni") (subcadena). Mismo dilema texto-directo vs
// string-value, distinto motor.
