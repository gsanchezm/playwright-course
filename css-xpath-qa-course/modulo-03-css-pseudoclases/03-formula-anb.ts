// ============================================================
// Mini-clase 3.3: La fórmula An+B — odd, even, nth-child(2n+1), nth-last-child
// ============================================================
// Analogía QA: An+B es la receta de "una de cada N". Como cuando revisas el
// muestreo de un reporte: "checa una fila sí, una no" (odd/even), o "cada
// tercera entrada". CSS no toma una selección filtrada y la re-indexa; cuenta
// posiciones entre HERMANOS según una progresión aritmética: A·n + B.
// ============================================================
import { countCss, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 3.3 La fórmula An+B =====");

// ------------------------------------------------------------
// 1) odd / even — los atajos más usados
// ------------------------------------------------------------
// odd  = posiciones 1, 3, 5...  (equivale a 2n+1)
// even = posiciones 2, 4, 6...  (equivale a 2n)
// En el grid de 4 cards: odd toma la 1ª y 3ª; even toma la 2ª y 4ª.
titulo("odd / even sobre las 4 cards");
check("nth-child(odd) = 2 cards (1ª y 3ª)", countCss(".pizza-grid > article:nth-child(odd)"), 2);
check("nth-child(even) = 2 cards (2ª y 4ª)", countCss(".pizza-grid > article:nth-child(even)"), 2);

// Verificamos CUÁLES, no solo cuántas: odd → Pepperoni y Suprema.
check("odd son Pepperoni y Suprema", $$(".pizza-grid > article:nth-child(odd) .pizza-name").map(text), ["Pepperoni", "Suprema de Carnes"]);
check("even son Cuatro Quesos y Pan de Ajo", $$(".pizza-grid > article:nth-child(even) .pizza-name").map(text), ["Cuatro Quesos", "Pan de Ajo"]);

// ------------------------------------------------------------
// 2) An+B explícito — 2n+1 es lo mismo que odd
// ------------------------------------------------------------
// La fórmula evalúa n = 0, 1, 2, 3... y se queda con los resultados positivos.
//   2n+1 con n=0,1,2... → 1, 3, 5, 7...  (idéntico a odd)
titulo("2n+1 ≡ odd");
check("nth-child(2n+1) = mismas 2 cards que odd", countCss(".pizza-grid > article:nth-child(2n+1)"), 2);

// B suelto (sin A·n) selecciona UNA posición fija: nth-child(2) = el 2º hijo.
check("nth-child(2) = exactamente 1 (la 2ª card)", countCss(".pizza-grid > article:nth-child(2)"), 1);
check("y esa 2ª card es Cuatro Quesos", text($$(".pizza-grid > article:nth-child(2) .pizza-name")[0]), "Cuatro Quesos");

// ------------------------------------------------------------
// 3) nth-last-child — la fórmula contada DESDE EL FINAL
// ------------------------------------------------------------
// nth-last-child(1) = el último; nth-last-child(2) = el penúltimo. Útil cuando
// el final de una lista es estable pero el inicio crece (paginación, logs).
titulo("nth-last-child: contar desde el final");
check("nth-last-child(1) = Pan de Ajo (el último)", text($$(".pizza-grid > article:nth-last-child(1) .pizza-name")[0]), "Pan de Ajo");
check("nth-last-child(2) = Suprema (el penúltimo)", text($$(".pizza-grid > article:nth-last-child(2) .pizza-name")[0]), "Suprema de Carnes");

// ------------------------------------------------------------
// ⚠️ GUARDRAIL #1: ":nth-of-type(3)" NO significa "la tercera pizza".
// ------------------------------------------------------------
// nth-of-type(3) = "un elemento que es del tipo Y, ADEMÁS el 3er hermano de su
// tipo". Aquí los 4 article son del mismo tipo, así que da 1 resultado... pero
// el match NO es "la 3ª pizza por lógica de negocio", es "el 3er <article>
// hermano". CSS NO tiene un "nth filtrado por clase o por dato": no existe algo
// como "la 3ª .pizza-card que esté disponible". Si quitas la palabra "pizza" y
// piensas SOLO en "3er article hermano", razonas correcto.
titulo("nth-of-type(3) = 3er <article> hermano, NO 'la 3ª pizza'");
check("nth-of-type(3) matchea 1 elemento (el 3er article)", countCss(".pizza-grid > article:nth-of-type(3)"), 1);
// Que justo sea Suprema es CASUALIDAD del orden del markup, no una regla de CSS.
check("ese 3er article resulta ser Suprema (por el ORDEN del DOM)", text($$(".pizza-grid > article:nth-of-type(3) .pizza-name")[0]), "Suprema de Carnes");

// ------------------------------------------------------------
// Aplicación QA: zebra-striping y muestreo
// ------------------------------------------------------------
// An+B brilla para AFIRMAR patrones visuales (filas alternadas) o para muestrear
// "una de cada N" en data-driven, no para identificar un registro concreto.
titulo("uso real: muestrear 1 de cada N");
const total = countCss(".pizza-grid > article");
const muestra = countCss(".pizza-grid > article:nth-child(odd)");
check("muestreamos la mitad (odd) de un grid de 4", `${muestra}/${total}`, "2/4");
