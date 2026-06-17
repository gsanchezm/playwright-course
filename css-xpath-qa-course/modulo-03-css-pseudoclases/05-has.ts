// ============================================================
// Mini-clase 3.5: :has() — el selector RELACIONAL ("el padre que…")
// ============================================================
// Analogía QA: :has() invierte la pregunta. Los selectores normales bajan
// ("dame el hijo X DENTRO del padre"); :has() sube ("dame el padre que TENGA
// un hijo X"). Es el "selector del padre" que CSS no tuvo por años: ahora
// puedes decir "la card que contenga un badge agotado" en UNA expresión.
// Y no solo padres: con combinadores (>, +, ~) expresa CUALQUIER relación.
// ============================================================
import { countCss, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 3.5 :has(), el selector relacional =====");

// ------------------------------------------------------------
// 1) :has(descendiente) — el caso "padre que contiene"
// ------------------------------------------------------------
// .pizza-card:has(> h3) = cards que tienen un <h3> como HIJO DIRECTO. Las 4
// cards tienen su nombre en un h3 → 4.
titulo(":has() — el padre que CONTIENE");
check("cards con un h3 hijo directo = 4", countCss(".pizza-card:has(> h3)"), 4);

// El filtro útil: "la card que contiene el badge Sin Gluten". Pasa de contar
// badges a SELECCIONAR LA CARD que lo tiene → 1 (Cuatro Quesos).
check("la card que tiene badge Sin Gluten = 1", countCss("article:has(.badge--sin-gluten)"), 1);
check("y es Cuatro Quesos", text($$("article:has(.badge--sin-gluten) .pizza-name")[0]), "Cuatro Quesos");

// "Cards con CUALQUIER badge" = 3 (Pan de Ajo no tiene badge).
check("cards con algún badge = 3", countCss("article:has(.badge)"), 3);

// ------------------------------------------------------------
// 2) :has() + ESTADO — combinar relación con pseudo-clases (M3.1)
// ------------------------------------------------------------
// "La card que contiene un botón deshabilitado" = la agotada (Suprema). Aquí
// :has() compone con :disabled: relación + estado en un solo paso.
titulo(":has() compone con estado");
check("la card con un botón disabled = 1 (la agotada)", countCss("article:has(button:disabled)"), 1);
check("y es Suprema de Carnes", text($$("article:has(button:disabled) .pizza-name")[0]), "Suprema de Carnes");

// OJO: :has() mira DESCENDIENTES, no al elemento mismo. El atributo
// data-sold-out vive en el <article>, no en un hijo → article:has([data-sold-out])
// da 0. Para "tiene el atributo" usa article[data-sold-out]; :has() es para
// lo que está ADENTRO.
check("article:has([data-sold-out]) = 0 (el atributo está en el article, no en un hijo)", countCss("article:has([data-sold-out])"), 0);
check("article[data-sold-out] = 1 (atributo en el propio elemento)", countCss("article[data-sold-out]"), 1);

// fieldset que contiene un control marcado → 2 (toppings y payment).
check("fieldsets con algún :checked = 2", countCss("fieldset:has(:checked)"), 2);

// ------------------------------------------------------------
// 3) :has() RELACIONAL con HERMANOS (+ y ~), no solo "contiene"
// ------------------------------------------------------------
// :has() no se limita a hijos. Con el combinador + describe HERMANOS adyacentes.
// h1:has(+ .market-picker) = "el h1 SEGUIDO INMEDIATAMENTE por el market-picker".
// En el login, el hero <h1> precede al selector de mercado → 1.
titulo(":has() con combinadores de hermano");
check("h1 seguido del market-picker = 1", countCss("h1:has(+ .market-picker)"), 1);
check("y ese h1 es el hero del login", text($$("h1:has(+ .market-picker)")[0]).startsWith("Crafting"), true);

// "El article cuyo h3 es seguido por un párrafo" (nombre + descripción) → las 4.
check("cards con 'h3 + p' (nombre seguido de descripción) = 4", countCss("article:has(h3 + p)"), 4);

// ------------------------------------------------------------
// ⚠️ GUARDRAIL #5: :has-text() / :text-is() NO son CSS estándar.
// ------------------------------------------------------------
// Playwright implementa :has() en su PROPIO motor de selectores, y ahí también
// ofrece pseudos CUSTOM como :has-text() y :text-is(). Esos NO existen en CSS:
// si los pasas a querySelectorAll (como aquí, offline) LANZAN error. Regla del
// curso: en .ts usa SIEMPRE :has() estándar. Si quieres filtrar por texto en
// Playwright, usa su API (getByText / hasText), no un pseudo dentro de un CSS
// que vaya a correr en el navegador crudo.
titulo("usa :has() estándar — :has-text()/:text-is() son de Playwright, no CSS");
let lanzo = false;
try {
  // :has-text() NO es CSS: querySelectorAll lo rechaza.
  countCss(".pizza-card:has-text('Pepperoni')");
} catch {
  lanzo = true;
}
check(":has-text() lanza error en CSS estándar (no es del lenguaje)", lanzo, true);
// La forma estándar de "la card que contiene un nombre concreto": :has() + un
// hook estructural; el texto exacto se filtra en código (o con la API de PW).
check("forma estándar: card cuyo nombre vive en un h3", countCss('.pizza-card:has(h3.pizza-name)'), 4);

// ------------------------------------------------------------
// Aplicación QA: aserciones relacionales de un vistazo
// ------------------------------------------------------------
// :has() permite afirmar relaciones sin recorrer el DOM a mano: "el resumen que
// contiene el monto total", "la línea de carrito que tiene botón de eliminar".
titulo("uso real: aserciones de relación");
check("la fila de resumen que tiene .amount (el total) = 1", countCss(".summary-row:has(.amount)"), 1);
check("líneas de carrito con botón eliminar = 2", countCss("li.cart-line:has(.line-remove)"), 2);
