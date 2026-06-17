// ============================================================
// Mini-clase 5.5: position() y last()
// ============================================================
// Analogía QA: a veces quieres "la ÚLTIMA fila" de una tabla (el total), "la
// PRIMERA" o "la penúltima", sin conocer cuántas hay. position() te dice en
// qué índice va un nodo dentro de su grupo; last() te da el índice del último.
// Son las funciones para navegar listas por posición — con cuidado, porque la
// posición es lo MENOS estable que existe.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 5.5 position() y last() =====");

// ------------------------------------------------------------
// [N] y [position()=N] — el N-ésimo nodo del grupo (1-based).
// ------------------------------------------------------------
// El carrito tiene 3 filas de resumen (.summary-row): subtotal, IVA, total.
// El índice empieza en 1, no en 0. [1] es la primera (subtotal).
titulo("Índice posicional: [N] (1-based)");
check('//div[contains(@class,"summary-row")] son 3', countXpath('//div[contains(@class,"summary-row")]'), 3);
check(
  'summary-row[1] es Subtotal',
  text($x('//div[contains(@class,"summary-row")][1]')[0] as Element),
  "Subtotal$553.00",
);
// [position()=2] es idéntico a [2]; la forma larga es útil al combinar con
// otras funciones (p.ej. position() < 3).
check(
  'summary-row[position()=2] es la fila de IVA',
  text($x('//div[contains(@class,"summary-row")][position()=2]')[0] as Element),
  "IVA (16%)$88.48",
);

// ------------------------------------------------------------
// last() — el índice del ÚLTIMO nodo, sin contar a mano.
// ------------------------------------------------------------
// [last()] toma la última fila de resumen: la del TOTAL. No necesitas saber
// que son 3; last() lo resuelve dinámicamente. Este es el idiom del enunciado:
// //div[contains(@class,"summary-row")][last()] = la fila total.
titulo("last() = la última fila (aquí, el total)");
check(
  'summary-row[last()] es la fila Total',
  text($x('//div[contains(@class,"summary-row")][last()]')[0] as Element),
  "Total$641.48",
);

// ------------------------------------------------------------
// Aritmética sobre last(): [last()-1] = la PENÚLTIMA.
// ------------------------------------------------------------
// last()-1 retrocede una posición desde el final. La penúltima fila es el IVA.
titulo("[last()-1] = la penúltima");
check(
  'summary-row[last()-1] es la fila de IVA',
  text($x('//div[contains(@class,"summary-row")][last()-1]')[0] as Element),
  "IVA (16%)$88.48",
);

// Otra lista: la nav principal tiene 3 enlaces. [last()] es "Ayuda".
check('//nav[@class="main-nav"]/a son 3', countXpath('//nav[@class="main-nav"]/a'), 3);
check(
  'main-nav/a[last()] es "Ayuda"',
  text($x('//nav[@class="main-nav"]/a[last()]')[0] as Element),
  "Ayuda",
);

// ------------------------------------------------------------
// ⚠️ El predicado [N] cuenta POR PADRE, no global.
// ------------------------------------------------------------
// `//a[1]` NO es "el primer <a> del documento": es "todo <a> que sea el 1er
// <a> de SU padre". Como hay varios padres con enlaces (nav, footer, carrito),
// devuelve VARIOS nodos. Para "el primero del documento entero" se usa
// (//a)[1] con paréntesis... pero esa forma diverge en jsdom (la evalúa como
// //a[1], por-padre). NO la verificamos aquí con check(): la regla del curso
// es jsdom=sintaxis, navegador=verdad. Lo explicamos en prosa.
titulo("[N] cuenta por padre (ojo con la indexación global)");
const primerosPorPadre = countXpath("//nav[@class='main-nav']/a[1]");
// Dentro de UN solo padre (la nav) sí hay exactamente un "primer a": Catálogo.
check('main-nav/a[1] (un solo padre) es 1 nodo', primerosPorPadre, 1);
check(
  'main-nav/a[1] es "Catálogo"',
  text($x("//nav[@class='main-nav']/a[1]")[0] as Element),
  "Catálogo",
);

// qa_transfer: en Playwright prefieres .first() / .last() / .nth(i) sobre el
// locator, que son explícitos y NO dependen del padre. .nth(0) cuenta desde 0
// (estilo array), mientras XPath [1] cuenta desde 1 — un off-by-one clásico al
// migrar de XPath a la API de Playwright.
