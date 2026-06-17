// ============================================================
// Mini-clase 7.3: Rendimiento y fragilidad
// ============================================================
// Analogía QA: un selector lento o frágil es como una prueba flaky: hoy pasa,
// mañana truena con un cambio cosmético. Los dos grandes pecados son (1) ejes
// demasiado AMPLIOS que obligan al motor a escanear medio DOM, y (2) caminos
// ABSOLUTOS atados a la estructura (`/html/body/div[2]/...`) que se rompen
// cuando alguien envuelve algo en un nuevo <div>.
//
// Idea central: PODAR el eje (anclar en un contenedor estable y bajar poco)
// es más rápido Y más resiliente. Y `:nth-of-type` NO significa "el N-ésimo
// de la lista que me importa" — lo demostramos para no enseñarlo mal.
// ============================================================
import { countCss, countXpath, $$, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 7.3 Rendimiento y fragilidad =====");

// ------------------------------------------------------------
// Eje amplio vs eje podado: mismo resultado, distinto costo.
// ------------------------------------------------------------
// "//div//span" arranca en CUALQUIER div del documento y baja a CUALQUIER
// span descendiente: el motor evalúa un universo enorme. Anclar primero en
// un contenedor con testid y bajar lo mínimo da el MISMO nodo con una
// fracción del trabajo. Aquí comparamos el target "monto del total del
// carrito": ambos llegan al mismo único span.
titulo("Podar el eje: //div//span vs ancla + descendiente corto");
const amplio = countCss("aside .cart-summary span.amount");
const podado = countCss('[data-testid="cart-total"] .amount');
check("camino amplio encuentra el monto", amplio, 1);
check("camino podado (testid) encuentra el monto", podado, 1);
const a1 = $$("aside .cart-summary span.amount")[0];
const a2 = $$('[data-testid="cart-total"] .amount')[0];
check("ambos caminos aterrizan en el mismo nodo", a1 === a2, true);

// ------------------------------------------------------------
// XPath ABSOLUTO: correcto hoy, frágil siempre.
// ------------------------------------------------------------
// /html/body/header funciona... mientras nadie reordene el <body>. Un camino
// absoluto codifica la POSICIÓN, no la INTENCIÓN. El relativo //header (o
// mejor, por testid) sobrevive a reordenamientos. Los dos dan 1 hoy.
titulo("XPath absoluto vs relativo");
const absoluto = countXpath("/html/body/header");
const porTestid = countCss('[data-testid="app-header"]');
check("XPath absoluto /html/body/header cuenta 1 (hoy)", absoluto, 1);
check("por testid [data-testid=app-header] cuenta 1 (siempre)", porTestid, 1);

// ------------------------------------------------------------
// GUARDRAIL: :nth-of-type(3) NO es "la 3ª pizza".
// ------------------------------------------------------------
// `:nth-of-type(N)` = "elemento que es del TIPO Y, y además el N-ésimo
// hermano de SU tipo". `:nth-child(N)` = "el N-ésimo hijo, sin importar
// tipo". Cuando los hermanos son de TIPOS MEZCLADOS, divergen. En `.catalog`
// los hijos directos son: div.category-bar, h2.section-heading, div.pizza-grid,
// fieldset.toppings — tipos mezclados. Mira cómo el 2.º cambia según el pseudo:
titulo("nth-of-type ≠ nth-child con hermanos de tipos mezclados");
const segundoChild = $$(".catalog > :nth-child(2)")[0] as Element;   // el 2.º HIJO
const segundoType = $$(".catalog > :nth-of-type(2)")[0] as Element;  // el 2.º de su tipo
check("'.catalog > :nth-child(2)' es el <h2>", segundoChild?.tagName, "H2");
check("'.catalog > :nth-of-type(2)' es el .pizza-grid (div)", attr(segundoType, "data-testid"), "pizza-grid");
check("nth-child y nth-of-type apuntan a nodos DISTINTOS", segundoChild === segundoType, false);

// Y dentro de .pizza-grid (donde TODOS los hijos son <article>) coinciden —
// pero eso NO los hace "la 3ª pizza": siguen contando POSICIÓN entre
// hermanos del tipo article, no "pizza nº 3" por algún criterio de negocio.
// Si insertan un <article> de publicidad antes, el conteo se corre.
const grid3of = $$(".pizza-grid article:nth-of-type(3)")[0] as Element;
const grid3ch = $$(".pizza-grid article:nth-child(3)")[0] as Element;
check("en .pizza-grid (hijos homogéneos) nth-of-type y nth-child coinciden", grid3of === grid3ch, true);
check("ese 3er article es la tarjeta 103 — por POSICIÓN, no por ser 'la 3ª pizza'", attr(grid3of, "data-testid"), "pizza-card-103");

// ------------------------------------------------------------
// La lección: posición = frágil; intención = resiliente.
// ------------------------------------------------------------
// El mismo target (la tarjeta agotada) por POSICIÓN se rompe al reordenar;
// por INTENCIÓN (su testid o su estado is-soldout) es estable.
const porPosicion = $$(".pizza-grid article:nth-child(3)")[0];
const porIntencion = $$('[data-testid="pizza-card-103"]')[0];
check("posición e intención coinciden HOY, pero solo una sobrevive cambios", porPosicion === porIntencion, true);
