// ============================================================
// Mini-clase 6.4: following, preceding, descendant
// ============================================================
// Analogia: los ejes de hermanos solo ven a quienes comparten padre. A veces
// necesitas mirar TODO lo que viene despues (o antes) en el documento, sin
// importar el contenedor; o todo lo que CUELGA de un nodo. Eso es:
//   following::    todo lo que abre DESPUES de mi (en orden de documento)
//   preceding::    todo lo que cierra ANTES de mi
//   descendant::   todo lo que esta DENTRO de mi (hijos, nietos, ...)
// following/preceding NO incluyen a tus ancestros ni descendientes: son el
// resto del documento "a tu derecha" / "a tu izquierda" leyendo el HTML.
// ============================================================
import { countXpath, $x, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 6.4 following, preceding, descendant =====");

// ------------------------------------------------------------
// descendant:: — todo lo que cuelga de un nodo.
// ------------------------------------------------------------
// La tarjeta de Pepperoni (card-101) contiene 2 <span>: el badge "Popular"
// y el <span class="price">. descendant:: los alcanza a cualquier profundidad.
titulo("descendant: lo que esta DENTRO");
const card101 = `//article[@data-testid="pizza-card-101"]`;
check("descendant::span dentro de la tarjeta 101 = 2", countXpath(`${card101}/descendant::span`), 2);
check("descendant::button dentro de la tarjeta 101 = 1", countXpath(`${card101}/descendant::button`), 1);
// descendant:: NO se incluye a si mismo (un nodo no es descendiente propio).
check("descendant::article desde la propia tarjeta = 0", countXpath(`${card101}/descendant::article`), 0);

// ------------------------------------------------------------
// following:: — todo lo que viene DESPUES en orden de documento.
// ------------------------------------------------------------
// Anclamos en el <h3> "Suprema de Carnes" (la 3a tarjeta del grid). Despues
// de ella en el HTML solo queda una pizza: "Pan de Ajo". Por eso following::h3
// devuelve 1 (no incluye su propio h3 ni los de las pizzas anteriores).
titulo("following: lo que viene DESPUES");
const anclaSuprema = `//h3[normalize-space()="Suprema de Carnes"]`;
check("following::h3 desde Suprema = 1 (solo Pan de Ajo)", countXpath(`${anclaSuprema}/following::h3`), 1);
const h3Siguiente = $x(`${anclaSuprema}/following::h3`)[0] as Element;
check("ese h3 siguiente es 'Pan de Ajo'", h3Siguiente?.textContent?.trim(), "Pan de Ajo");

// ------------------------------------------------------------
// preceding:: — todo lo que vino ANTES en orden de documento.
// ------------------------------------------------------------
// Antes de "Suprema" hay 2 h3 de pizza: Pepperoni y Cuatro Quesos. (Los h3
// del header/login no existen: ahi hay h1 y h2, no h3.)
titulo("preceding: lo que vino ANTES");
check("preceding::h3 desde Suprema = 2 (Pepperoni y Cuatro Quesos)", countXpath(`${anclaSuprema}/preceding::h3`), 2);

// ------------------------------------------------------------
// following NO es lo mismo que following-sibling.
// ------------------------------------------------------------
// following-sibling::h3 desde Suprema = 0 (su unico contenedor es su article;
// no tiene un h3 hermano). Pero following::h3 = 1 porque cruza el limite del
// article y ve el documento entero hacia adelante. Eje correcto = pregunta
// correcta.
titulo("following vs following-sibling");
check("following-sibling::h3 desde Suprema = 0 (mismo padre)", countXpath(`${anclaSuprema}/following-sibling::h3`), 0);
check("following::h3 desde Suprema = 1 (todo el documento adelante)", countXpath(`${anclaSuprema}/following::h3`), 1);

// ------------------------------------------------------------
// "El PRIMERO que viene despues": indexa en el PASO de eje, no con parentesis.
// ------------------------------------------------------------
// Desde el h3 de Pepperoni, el primer <button> que abre despues en el
// documento es su propio add-to-cart. `following::button[1]` con UN nodo de
// contexto es seguro y portatil. (Cuidado con (//...)[n] envuelto en
// parentesis: jsdom lo evalua distinto al navegador — lo veras en la web.)
titulo("el primero hacia adelante: indice en el paso de eje");
const primerBoton = $x(`//h3[normalize-space()="Pepperoni"]/following::button[1]`)[0] as Element;
check("following::button[1] desde Pepperoni = add-to-cart-101", attr(primerBoton, "data-testid"), "add-to-cart-101");
