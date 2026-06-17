// ============================================================
// Mini-clase 1.3: Agrupación y selector universal
// ============================================================
// Analogía: dos atajos para abarcar más con menos.
//   - AGRUPACIÓN (h1, h2): "esto O aquello" → la coma une varios selectores
//     en una sola consulta (como un OR).
//   - UNIVERSAL (*): "cualquier elemento" → el comodín que matchea todo.
// Útiles para contar/auditar, peligrosos si los usas como locator real.
// ============================================================
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 1.3 Agrupación y selector universal =====");

// ------------------------------------------------------------
// AGRUPACIÓN: la coma es un OR entre selectores.
// ------------------------------------------------------------
// `h1, h2` matchea todo elemento que sea <h1> O <h2>. El resultado es la UNIÓN
// de ambos conjuntos. Hay 1 <h1> (el hero) y 4 <h2> (títulos de sección): 5.
titulo("Agrupación con coma (selector1, selector2)");
check("h1 → 1 (el hero de login)", countCss("h1"), 1);
check("h2 → 4 (títulos de sección)", countCss("h2"), 4);
check("h1, h2 → 5 (la unión de ambos)", countCss("h1, h2"), 5);

// Puedes encadenar cuantos quieras. Sumamos los <h3> (4 nombres de pizza).
check("h1, h2, h3 → 9 (todos los encabezados)", countCss("h1, h2, h3"), 9);

// OJO: la coma une selectores ENTEROS, no es "y dentro del mismo elemento".
// `.badge, .price` = (todos los badge) ∪ (todos los price) = 3 + 4 = 7.
check(".badge, .price → 7 (3 badges + 4 precios)", countCss(".badge, .price"), 7);

// ------------------------------------------------------------
// SELECTOR UNIVERSAL: * matchea CUALQUIER elemento.
// ------------------------------------------------------------
// `*` solo es el comodín: cuenta todos los elementos del documento.
titulo("Selector universal (*)");
check("* → 143 elementos en toda la página", countCss("*"), 143);

// Su uso real es como DESCENDIENTE: `section *` = "cualquier elemento dentro
// de un <section>". Hay 2 <section> (market-picker y catalog); * abarca TODOS
// sus descendientes, sumados. No es "los hijos del catálogo": es ambas secciones.
check("section * → 51 (descendientes de las 2 <section>)", countCss("section *"), 51);

// Acotado al grid de pizzas: `.pizza-grid *` = todo lo que vive dentro del grid
// (imágenes, badges, nombres, descripciones, precios, botones... de las 4 cards).
check(".pizza-grid * → 30 (todo lo que cuelga del grid)", countCss(".pizza-grid *"), 30);
