// ============================================================
// Mini-clase 1.1: El DOM es un árbol
// ============================================================
// Analogía: localizar un elemento en una página es como encontrar un dato
// dentro de una estructura ANIDADA (un JSON, una carpeta dentro de carpetas).
// El navegador no ve "texto plano": ve un ÁRBOL de nodos con padres, hijos y
// hermanos. Un selector es la RUTA hacia el nodo que te interesa.
// ============================================================
import { document, $$, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 1.1 El DOM es un árbol =====");

// ------------------------------------------------------------
// La idea central: todo elemento tiene una posición en el árbol.
// ------------------------------------------------------------
// Tomamos el <header> de OmniPizza como ejemplo de "rama". Igual que en una
// estructura anidada, un nodo conoce a su PADRE, a sus HIJOS y a sus HERMANOS.
titulo("El header como rama del árbol");

const header = document.querySelector("header")!;

// El header es un nodo <header>. Su tagName nos dice de qué tipo es.
check("el header es un <header>", header.tagName, "HEADER");

// ------------------------------------------------------------
// PADRE: ¿de quién cuelga este nodo?
// ------------------------------------------------------------
// El header cuelga directo del <body>. parentElement sube un nivel en el árbol.
check("el padre del header es el <body>", header.parentElement!.tagName, "BODY");

// ------------------------------------------------------------
// HIJOS: ¿qué cuelga directamente de este nodo?
// ------------------------------------------------------------
// .children son los hijos DIRECTOS (un nivel abajo), no todos los descendientes.
// El header tiene 4 hijos directos: la marca, el nav, la búsqueda y el carrito.
check("el header tiene 4 hijos directos", header.children.length, 4);

// El primer hijo es el enlace de la marca (<a class="brand">).
const primerHijo = header.children[0];
check("el primer hijo del header es un <a>", primerHijo.tagName, "A");

// ------------------------------------------------------------
// HERMANOS: nodos que comparten el mismo padre.
// ------------------------------------------------------------
// Las 4 tarjetas de pizza son HERMANAS: todas cuelgan del mismo .pizza-grid.
const cards = $$(".pizza-card");
const padresDistintos = new Set(cards.map((c) => c.parentElement));
check("las 4 tarjetas comparten un mismo padre (son hermanas)", padresDistintos.size, 1);
check("el padre común de las tarjetas es el .pizza-grid",
  cards[0].parentElement!.className, "pizza-grid");

// ------------------------------------------------------------
// DESCENDIENTES: hijos, nietos, bisnietos... toda la rama hacia abajo.
// ------------------------------------------------------------
// Dentro de una tarjeta hay un <h3> con el nombre de la pizza. No es hijo
// directo del grid, sino descendiente: el grid → la card → el h3.
const primeraCard = cards[0];
check("la primera tarjeta contiene un <h3>", primeraCard.querySelector("h3") !== null, true);
check("el <h3> de la primera tarjeta dice 'Pepperoni'",
  text(primeraCard.querySelector("h3")), "Pepperoni");
