// ============================================================
// Mini-clase 4.2: Absoluto "/" vs relativo "//"
// ============================================================
// Analogía QA: un XPath absoluto (/html/body/...) es como una dirección
// dictada calle por calle desde la puerta de la ciudad: precisa, pero se
// rompe si alguien construye un piso nuevo en medio. Un XPath relativo (//)
// es "el primer Starbucks que encuentres": resiste reordenamientos. En QA
// casi SIEMPRE quieres el relativo: los DOMs cambian de envoltorios todo el
// tiempo y un absoluto es el locator más frágil que existe.
// ============================================================
import { countXpath, $x } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 4.2 Absoluto vs relativo =====");

// ------------------------------------------------------------
// 1) "/" = paso EXACTO de hijo directo desde la raíz.
// ------------------------------------------------------------
// Un solo "/" significa "hijo directo". Una ruta absoluta empieza en la raíz
// del documento y describe cada nivel. /html/body/header es exactamente UN
// nodo porque hay un único <header> como hijo directo de <body>.
titulo("Ruta absoluta: hijo directo, nivel por nivel");
check("/html/body/header = 1 (el header es único)", countXpath("/html/body/header"), 1);
// Hay DOS <main> hijos de <body> (login y checkout, aplanados en el fixture):
check("/html/body/main = 2 (login + checkout)", countXpath("/html/body/main"), 2);

// ------------------------------------------------------------
// 2) "//" = descendiente en CUALQUIER nivel (relativo).
// ------------------------------------------------------------
// El doble "//" significa "en cualquier profundidad". //h3 busca TODOS los
// <h3> del documento sin importar cuántos envoltorios haya por encima. Por
// eso es robusto: no le importa la jerarquía intermedia.
titulo("// busca en TODO el documento, sin importar la profundidad");
check("//h3 = 4 (las 4 pizzas)", countXpath("//h3"), 4);
check("//article = 4 (las 4 tarjetas)", countXpath("//article"), 4);
// El mismo //main, sin la ruta completa, da el MISMO 2: // no depende del path.
check("//main = 2 (igual que /html/body/main)", countXpath("//main"), 2);

// ------------------------------------------------------------
// 3) Absoluto y relativo pueden apuntar al MISMO nodo.
// ------------------------------------------------------------
// No es "uno u otro correcto": describen el mismo árbol. La diferencia es
// FRAGILIDAD. Mete un <div> envoltorio nuevo y el absoluto se rompe; el
// relativo sigue encontrando el target. Por eso el curso prefiere //.
titulo("Mismo header por dos caminos");
const porAbsoluto = $x("/html/body/header");
const porRelativo = $x("//header");
check("ambos caminos cuentan 1 header", porAbsoluto.length === porRelativo.length, true);
check("y es el MISMO nodo (identidad)", porAbsoluto[0] === porRelativo[0], true);

// ------------------------------------------------------------
// 4) "." (self) y ".." (padre): navegar desde un nodo.
// ------------------------------------------------------------
// "." es el nodo actual (self) y ".." es su padre. Combinados con un paso
// relativo te dejan "rebotar" por el árbol. //h3/. devuelve los mismos h3
// (self), y //h3/.. devuelve sus padres (las 4 <article> contenedoras).
titulo(". = self, .. = padre");
check("//h3/. = 4 (self: los mismos h3)", countXpath("//h3/."), 4);
check("//h3/.. = 4 (el padre <article> de cada h3)", countXpath("//h3/.."), 4);
// Y el padre del <h3> Pepperoni es exactamente su tarjeta:
const padre = $x("//h3[text()='Pepperoni']/..")[0] as Element;
check("el padre del h3 Pepperoni es pizza-card-101", padre.getAttribute("data-testid"), "pizza-card-101");
