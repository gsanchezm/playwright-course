// ============================================================
// Mini-clase 6.1: El modelo de ejes
// ============================================================
// Analogia: hasta ahora navegaste el DOM "hacia abajo" (de padre a hijo).
// Los EJES (axes) de XPath son las DIRECCIONES en las que te puedes mover
// por el arbol desde un nodo: hacia arriba (ancestros), a los lados
// (hermanos), hacia abajo (descendientes) y en orden de documento
// (following / preceding). Es como navegar las RELACIONES de un grafo de
// datos: no solo "los hijos", sino "los tios", "los hermanos mayores", etc.
// ============================================================
import { countXpath, $x, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 6.1 El modelo de ejes =====");

// ------------------------------------------------------------
// Sintaxis de un paso con eje: eje::nodo[predicado]
// ------------------------------------------------------------
// Un paso de XPath tiene tres partes:
//   eje::      la DIRECCION (child, parent, ancestor, following-sibling, ...)
//   nodo       el tipo de nodo a quedarte (article, h3, *, ...)
//   [pred]     un filtro opcional
// Cuando NO escribes eje, el eje por defecto es `child::`. Es decir,
// `//article/h3` es azucar de `//article/child::h3`.
titulo("eje por defecto = child");
check(
  "//div[@data-testid='pizza-grid']/article == /child::article",
  countXpath(`//div[@data-testid="pizza-grid"]/article`),
  countXpath(`//div[@data-testid="pizza-grid"]/child::article`),
);
// Hay 4 tarjetas dentro del grid.
check(
  "el grid tiene 4 article hijos directos",
  countXpath(`//div[@data-testid="pizza-grid"]/child::article`),
  4,
);

// ------------------------------------------------------------
// Los NOMBRES DE EJE son palabras clave CASE-SENSITIVE.
// ------------------------------------------------------------
// `child::`, `ancestor::`, `following-sibling::` se escriben en minusculas.
// Escribir `CHILD::` o `Ancestor::` es un ERROR DE SINTAXIS: el parser de
// XPath no reconoce el eje y la expresion no compila.
titulo("los nombres de eje son case-sensitive");
check("child:: (minuscula) es un eje valido", countXpath(`//div[@data-testid="pizza-grid"]/child::article`), 4);

let ejeEnMayusculaCompila = true;
try {
  // CHILD:: no es un eje reconocido -> el parser lanza error al evaluar.
  countXpath(`//div[@data-testid="pizza-grid"]/CHILD::article`);
} catch {
  ejeEnMayusculaCompila = false;
}
check("CHILD:: (mayuscula) NO es un eje valido (error de sintaxis)", ejeEnMayusculaCompila, false);

// ------------------------------------------------------------
// Los 4 grupos de ejes que veras en este modulo.
// ------------------------------------------------------------
// Partiendo del <h3> "Cuatro Quesos" como nodo de contexto:
//   ARRIBA    ancestor::   -> sus contenedores (article, grid, section, body, html)
//   LADOS     *-sibling::  -> sus hermanos dentro del mismo padre
//   ABAJO     descendant:: -> lo que cuelga de el (un h3 no tiene hijos utiles)
//   ORDEN-DOC following:: / preceding:: -> todo lo que viene despues / antes
const anclaCuatroQuesos = `//h3[normalize-space()="Cuatro Quesos"]`;

titulo("un mismo nodo, varias direcciones");
// ARRIBA: su <article> contenedor (lo veras a fondo en 6.2).
check("ancestor::article (arriba) = 1", countXpath(`${anclaCuatroQuesos}/ancestor::article`), 1);
// LADOS: el <p> de descripcion es un hermano siguiente (lo veras en 6.3).
check("following-sibling::p (lado) = 1", countXpath(`${anclaCuatroQuesos}/following-sibling::p`), 1);
// ORDEN-DOC: hay 2 h3 mas adelante en el documento (Suprema y Pan de Ajo).
check("following::h3 (orden de doc) = 2", countXpath(`${anclaCuatroQuesos}/following::h3`), 2);

// ------------------------------------------------------------
// El eje cambia el SIGNIFICADO del paso, no solo el resultado.
// ------------------------------------------------------------
// `..` es el atajo de `parent::node()`: sube UN nivel. Desde el h3 de una
// tarjeta, el padre es su <article>.
const padre = $x(`${anclaCuatroQuesos}/..`)[0] as Element;
check("el padre del h3 es un <article>", padre?.tagName.toLowerCase(), "article");
check("ese article es la tarjeta 102", attr(padre, "data-testid"), "pizza-card-102");
