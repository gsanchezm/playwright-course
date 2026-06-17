// ============================================================
// Mini-clase 7.5: Depurar contando matches
// ============================================================
// Analogía QA: antes de afirmar un bug, reproduces y CUENTAS. Lo mismo con un
// selector: antes de meterlo en un test, cuenta cuántos nodos matchea. El
// conteo te dice de inmediato qué pasa:
//   · 0   → contexto/sintaxis mal: tu ancla no existe o el selector está roto.
//   · 1   → ideal: un único objetivo, sin ambigüedad.
//   · N>1 → ambiguo: el test tomaría el primero (o "strict mode violation"
//           en Playwright). Hay que afinar.
//
// Idea central: countCss()/countXpath() (o $$()/$x()) son tu "console.log"
// del selector. Aquí depuramos casos reales del fixture.
// ============================================================
import { countCss, countXpath, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 7.5 Depurar contando matches =====");

// ------------------------------------------------------------
// Caso "0": el selector parece bien pero el CONTEXTO no existe.
// ------------------------------------------------------------
// `.is-soldout` está sobre el <article>, NO sobre un descendiente. Por eso
// "la tarjeta que CONTIENE un .is-soldout" da 0 (ningún hijo tiene esa clase).
// Conteo 0 = señal de que tu modelo mental del DOM está equivocado.
titulo("Conteo 0: contexto equivocado");
const cero = countCss("article.pizza-card:has(.is-soldout)");
check(":has(.is-soldout) cuenta 0 (la clase está en el article, no dentro)", cero, 0);

// La intención correcta ("tarjeta cuyo botón está deshabilitado") sí da 1:
const uno = countCss("article.pizza-card:has(button[disabled])");
check(":has(button[disabled]) cuenta 1 (la tarjeta agotada)", uno, 1);
check("y ese único nodo es la Suprema de Carnes", text($$("article.pizza-card:has(button[disabled])")[0]?.querySelector("h3")), "Suprema de Carnes");

// ------------------------------------------------------------
// Caso "0" por WHITESPACE: text() crudo vs normalize-space.
// ------------------------------------------------------------
// El precio de la 101 tiene whitespace deliberado: "\n   $189.00\n  ".
// En XPath, `text()='$189.00'` compara nodos de texto CRUDOS → 0 matches.
// `normalize-space(.)='$189.00'` recorta y colapsa → 1. Si cuentas 0 donde
// esperabas 1, sospecha del whitespace ANTES de dudar de tu selector.
titulo("Conteo 0 por whitespace: text() vs normalize-space");
const crudoFalla = countXpath("//span[text()='$189.00']");
const normalizado = countXpath("//span[normalize-space(.)='$189.00']");
check("text()='$189.00' cuenta 0 (whitespace crudo)", crudoFalla, 0);
check("normalize-space(.)='$189.00' cuenta 1 (recortado)", normalizado, 1);

// ------------------------------------------------------------
// Caso "N>esperado": el selector es AMBIGUO.
// ------------------------------------------------------------
// "span.price" cuenta 4 (un precio por tarjeta). Si tu intención era UN
// precio concreto, 4 es ambiguo: el test tomaría el primero por accidente.
// Afinas anclando en la tarjeta correcta por testid → vuelves a 1.
titulo("Conteo N>1: ambigüedad → afinar");
const ambiguo = countCss("span.price");
check("span.price cuenta 4 (ambiguo si querías UNO)", ambiguo, 4);
const afinado = countCss('[data-testid="pizza-card-101"] span.price');
check("anclado por testid de la tarjeta vuelve a 1", afinado, 1);

// ------------------------------------------------------------
// Mismo método en XPath: contar antes de confiar.
// ------------------------------------------------------------
// Los botones add-to-cart: 4 en total. "El de la tarjeta agotada" se afina
// por su testid → 1. Contar primero te ahorra un test flaky.
titulo("Contar también en XPath");
const todosLosBotones = countXpath("//button[contains(concat(' ', normalize-space(@class), ' '), ' add-to-cart ')]");
check("todos los add-to-cart cuentan 4", todosLosBotones, 4);
const botonAgotado = countXpath("//button[@data-testid='add-to-cart-103']");
check("el botón de la tarjeta agotada se afina a 1", botonAgotado, 1);

// ------------------------------------------------------------
// La rutina: cuenta → 1 = listo; 0 = arregla el ancla; N = afina.
// ------------------------------------------------------------
// Cierre vivo: tomar un target ambiguo y reducirlo a exactamente 1.
const antes = countCss(".pizza-name");          // 4: todos los nombres
const despues = countCss('[data-testid="pizza-card-104"] .pizza-name'); // 1: Pan de Ajo
check("de 4 nombres ambiguos a 1 nombre concreto", [antes, despues], [4, 1]);
check("y ese único nombre es 'Pan de Ajo'", text($$('[data-testid="pizza-card-104"] .pizza-name')[0]), "Pan de Ajo");
