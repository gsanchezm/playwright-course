// ============================================================
// Mini-clase 6.2: parent, ancestor, ancestor-or-self
// ============================================================
// Analogia: encontraste el dato que te importa (el NOMBRE de la pizza), pero
// el elemento accionable esta MAS ARRIBA (la TARJETA completa, o su boton).
// Los ejes "hacia arriba" te dejan SUBIR del texto al contenedor:
//   parent::            sube UN nivel (el atajo es `..`)
//   ancestor::          sube a CUALQUIER contenedor (padre, abuelo, ...)
//   ancestor-or-self::  igual, pero el nodo de partida tambien cuenta
// Este es el corazon del patron pro de localizacion: anclar por el texto
// estable y subir por eje al contenedor.
// ============================================================
import { countXpath, $x, attr, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 6.2 parent, ancestor, ancestor-or-self =====");

// Anclamos en el <h3> del catalogo (no en el <span> del carrito).
// Usamos normalize-space() porque es el texto LIMPIO del elemento (guardrail).
const anclaCuatroQuesos = `//h3[normalize-space()="Cuatro Quesos"]`;

// ------------------------------------------------------------
// ancestor:: — sube a CUALQUIER contenedor del tipo pedido.
// ------------------------------------------------------------
// El <h3> "Cuatro Quesos" vive dentro de EXACTAMENTE un <article>.
// Esa es la tarjeta completa: el contenedor accionable que querias.
titulo("ancestor::article");
check("ancestor::article desde el h3 = 1", countXpath(`${anclaCuatroQuesos}/ancestor::article`), 1);
const tarjeta = $x(`${anclaCuatroQuesos}/ancestor::article`)[0] as Element;
check("ese article es la tarjeta 102", attr(tarjeta, "data-testid"), "pizza-card-102");

// ------------------------------------------------------------
// parent:: — sube EXACTAMENTE un nivel. `..` es su atajo.
// ------------------------------------------------------------
// Para este h3, el padre directo YA es el <article>, asi que parent y
// ancestor::article coinciden. Pero no siempre: parent es "un nivel", no
// "el contenedor de tipo X".
titulo("parent:: y el atajo ..");
check("parent::article = 1", countXpath(`${anclaCuatroQuesos}/parent::article`), 1);
check(".. (atajo de parent) tambien sube 1 nivel", countXpath(`${anclaCuatroQuesos}/..`), 1);
const porParent = $x(`${anclaCuatroQuesos}/parent::article`)[0] as Element;
const porAtajo = $x(`${anclaCuatroQuesos}/..`)[0] as Element;
check("parent::article y .. devuelven el MISMO nodo", porParent === porAtajo, true);

// ------------------------------------------------------------
// parent NO es ancestor: la diferencia se ve cuando el contenedor
// que buscas esta a VARIOS niveles de distancia.
// ------------------------------------------------------------
// El <span class="amount"> del total del carrito esta anidado:
//   .summary-row--total  >  span.amount
// Su PADRE es el div.summary-row; su ancestor incluye ademas el aside del
// carrito. Subir al row con parent funciona; subir al drawer necesita ancestor.
titulo("parent (un nivel) vs ancestor (cualquier nivel)");
const anclaTotal = `//div[@data-testid="cart-total"]/span[@class="amount"]`;
check("amount existe", countXpath(anclaTotal), 1);
check("su parent es el summary-row del total", countXpath(`${anclaTotal}/parent::div[@data-testid="cart-total"]`), 1);
check("su parent NO es el aside (esta mas arriba)", countXpath(`${anclaTotal}/parent::aside`), 0);
check("ancestor::aside SI lo alcanza", countXpath(`${anclaTotal}/ancestor::aside`), 1);

// ------------------------------------------------------------
// ancestor-or-self:: — incluye al nodo de partida en la busqueda.
// ------------------------------------------------------------
// Si partimos del PROPIO <article> y pedimos ancestor::article, el resultado
// es 0 (un nodo no es ancestro de si mismo). Con ancestor-or-self:: SI cuenta.
titulo("ancestor-or-self incluye el nodo de partida");
const anclaArticle = `//article[@data-testid="pizza-card-102"]`;
check("ancestor::article desde el propio article = 0", countXpath(`${anclaArticle}/ancestor::article`), 0);
check("ancestor-or-self::article = 1 (se incluye a si mismo)", countXpath(`${anclaArticle}/ancestor-or-self::article`), 1);

// ------------------------------------------------------------
// El resultado: del texto estable al contenedor accionable.
// ------------------------------------------------------------
// "El nombre de la pizza" es estable; "la 2a tarjeta" es fragil. Anclar por
// nombre y subir por ancestor te da la tarjeta correcta sin contar posiciones.
const nombreEnTarjeta = text($x(`${anclaCuatroQuesos}/ancestor::article//h3`)[0]);
check("ancla + subir + bajar al nombre = 'Cuatro Quesos'", nombreEnTarjeta, "Cuatro Quesos");
