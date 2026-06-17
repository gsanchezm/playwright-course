// ============================================================
// Mini-clase 7.1: Tabla comparativa CSS vs XPath
// ============================================================
// Analogía QA: elegir entre CSS y XPath es como elegir entre un atajo de
// teclado y un menú completo. CSS es rápido, legible y nativo en
// `querySelector`; XPath es el menú completo: puede ir por TEXTO, hacia
// ARRIBA (padre/ancestro) y por EJES que CSS no tiene. Saber qué pide cada
// caso es media batalla de un selector resiliente.
//
// Idea central: la mayoría de los targets son alcanzables por AMBOS motores
// y deberían devolver el MISMO conteo. La diferencia está en lo que SOLO uno
// puede hacer. Aquí lo demostramos contando matches en el fixture.
// ============================================================
import { countCss, countXpath, $$, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 7.1 Tabla comparativa CSS vs XPath =====");

// ------------------------------------------------------------
// Empate: un target alcanzable por los DOS motores.
// ------------------------------------------------------------
// Las tarjetas de pizza son `<article class="pizza-card ...">`. CSS las toma
// con `.pizza-card` (multi-clase nativo). XPath 1.0 NO tiene selector de
// clase, así que usa el idioma de la "clase acolchada" (lo veremos a fondo
// en 7.2). Ambos deben contar 4: el mismo nodo-set, distinta sintaxis.
titulo("Empate: mismo target, dos motores");
const cardsCss = countCss(".pizza-card");
const cardsXpath = countXpath(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]",
);
check("CSS .pizza-card cuenta 4", cardsCss, 4);
check("XPath (clase acolchada) cuenta 4", cardsXpath, 4);
check("CSS y XPath coinciden en el mismo target", cardsCss === cardsXpath, true);

// ------------------------------------------------------------
// SOLO XPath (1): localizar por TEXTO del elemento.
// ------------------------------------------------------------
// CSS no puede preguntar "¿qué elemento DICE 'Pepperoni'?". XPath sí, con
// normalize-space(.) (el texto completo, recortado). Esto es el peldaño
// "getByText" de la escalera de resiliencia (7.4).
titulo("Solo XPath: por texto");
const h3Pepperoni = countXpath("//h3[normalize-space(.)='Pepperoni']");
check("XPath encuentra el h3 que dice 'Pepperoni'", h3Pepperoni, 1);

// ------------------------------------------------------------
// SOLO XPath (2): subir al PADRE / ANCESTRO.
// ------------------------------------------------------------
// CSS solo baja y va de lado (descendiente, hijo, hermano). XPath puede ir
// HACIA ATRÁS con parent:: y ancestor::. Aquí: del h3 con texto subimos a su
// <article> (la tarjeta) y luego a la <section> contenedora.
titulo("Solo XPath: hacia arriba (padre/ancestro)");
const cardDePepperoni = countXpath(
  "//h3[normalize-space(.)='Pepperoni']/parent::article",
);
const sectionDePepperoni = countXpath(
  "//h3[normalize-space(.)='Pepperoni']/ancestor::section",
);
check("parent::article sube a la tarjeta de Pepperoni", cardDePepperoni, 1);
check("ancestor::section sube a la sección del catálogo", sectionDePepperoni, 1);

// ------------------------------------------------------------
// CSS gana: rendimiento, legibilidad y multi-clase nativa.
// ------------------------------------------------------------
// Para "tarjeta de pizza agotada" CSS combina clases en una sola token corta
// `.pizza-card.is-soldout`. En XPath necesitas DOS contains(concat(...))
// encadenados. Mismo resultado (1 nodo), pero el CSS es mucho más legible.
titulo("CSS gana: multi-clase en una sola token");
const agotadaCss = countCss(".pizza-card.is-soldout");
const agotadaXpath = countXpath(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]" +
    "[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
);
check("CSS .pizza-card.is-soldout cuenta 1", agotadaCss, 1);
check("XPath equivalente (verboso) también cuenta 1", agotadaXpath, 1);

// ------------------------------------------------------------
// Resumen vivo: el MISMO nodo por ambos caminos.
// ------------------------------------------------------------
// Tomamos la tarjeta agotada por CSS y por XPath y comprobamos que es
// EXACTAMENTE el mismo elemento del DOM (identidad de nodo, no solo conteo).
const porCss = $$(".pizza-card.is-soldout")[0];
const porXpath = $x(
  "//article[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
)[0] as Element;
check("ambos motores aterrizan en el mismo nodo", porCss === porXpath, true);
check("y ese nodo es la tarjeta 103 (Suprema)", text(porCss?.querySelector("h3")), "Suprema de Carnes");
