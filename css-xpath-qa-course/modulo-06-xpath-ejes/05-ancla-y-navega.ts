// ============================================================
// Mini-clase 6.5: El patron ancla-y-navega
// ============================================================
// Analogia: este es el patron PRO que junta todo el modulo. En vez de
// describir la RUTA completa hasta un elemento (fragil: cualquier <div>
// intermedio que cambie la rompe), anclas en el dato mas ESTABLE que ves en
// pantalla (un texto humano: "Pepperoni", "Cuatro Quesos") y de ahi NAVEGAS
// por eje hasta el elemento accionable. Texto estable + salto por eje =
// localizador legible y resistente.
// ============================================================
import { countXpath, $x, attr, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 6.5 El patron ancla-y-navega =====");

// ------------------------------------------------------------
// Caso 1: del texto de una LINEA del carrito a su <li> completo.
// ------------------------------------------------------------
// "Pepperoni" aparece DOS veces: como <h3> en el catalogo y como
// <span class="line-name"> en el carrito. Para la LINEA del carrito anclamos
// en el span (su texto es limpio, text() vale) y subimos al <li>.
titulo("ancla en el nombre de la linea -> sube al <li>");
check("span 'Pepperoni' del carrito existe", countXpath(`//span[@class="line-name"][text()="Pepperoni"]`), 1);
const linea = $x(`//span[@class="line-name"][text()="Pepperoni"]/ancestor::li`)[0] as Element;
check("ancestor::li desde el nombre = la linea 101", attr(linea, "data-testid"), "cart-line-101");
// Y desde la linea bajamos a su cantidad, sin contar posiciones:
const qty = text($x(`//span[@class="line-name"][text()="Pepperoni"]/ancestor::li//span[@data-testid="qty-101"]`)[0]);
check("la cantidad de esa linea es 'x2'", qty, "x2");

// ------------------------------------------------------------
// Caso 2: del NOMBRE de la pizza (catalogo) a su PRECIO, por hermano.
// ------------------------------------------------------------
// En la tarjeta, el <h3> y el <span class="price"> son hermanos. Anclamos en
// el nombre y saltamos al precio siguiente. Asi el precio "pertenece" al
// nombre, no a una posicion arbitraria del grid.
titulo("ancla en el nombre -> salta al precio hermano");
const precioSpan = $x(`//h3[normalize-space()="Pepperoni"]/following-sibling::span[@class="price"]`)[0] as Element;
// Ese span tiene whitespace deliberado: normalize-space lo limpia.
check("precio hermano de Pepperoni (normalizado) = $189.00", text(precioSpan), "$189.00");

// ------------------------------------------------------------
// Caso 3: del nombre de la pizza a su BOTON accionable (add-to-cart).
// ------------------------------------------------------------
// El boton de "Suprema de Carnes" esta DISABLED (esta agotada). Anclar por
// nombre y subir a la tarjeta nos deja verificar el estado del control real.
titulo("ancla en el nombre -> el boton de su tarjeta");
const btnSuprema = $x(`//h3[normalize-space()="Suprema de Carnes"]/ancestor::article//button[contains(@data-testid,"add-to-cart")]`)[0] as Element;
check("boton de Suprema = add-to-cart-103", attr(btnSuprema, "data-testid"), "add-to-cart-103");
check("ese boton esta deshabilitado (agotado)", btnSuprema?.hasAttribute("disabled"), true);
check("su texto es 'Agotado'", text(btnSuprema), "Agotado");

// ------------------------------------------------------------
// Por que ancla-y-navega gana a la ruta absoluta.
// ------------------------------------------------------------
// La ruta posicional "la 4a tarjeta del grid" depende del ORDEN y de que no
// haya nodos de otro tipo intercalados. Ancla-y-navega depende solo del texto
// humano + la relacion estructural local, mucho mas estable ante rediseños.
titulo("estable vs fragil");
const porAncla = attr($x(`//h3[normalize-space()="Pan de Ajo"]/ancestor::article`)[0] as Element, "data-testid");
check("ancla('Pan de Ajo') + ancestor::article = pizza-card-104", porAncla, "pizza-card-104");

// ------------------------------------------------------------
// qa_transfer: como se ve esto en Playwright.
// ------------------------------------------------------------
// En Playwright el mismo patron se escribe encadenando un locator base con un
// salto por eje en XPath:
//   page.getByRole("heading", { name: "Pepperoni" })
//       .locator("xpath=ancestor::li")
// El motor de Playwright delega el XPath en el document.evaluate del navegador
// REAL, asi que el comportamiento de los ejes es identico al que practicas
// aqui. UNA limitacion clave: XPath (y por tanto este salto) NO atraviesa el
// shadow DOM; para componentes con shadow root, ancla con getByRole/getByText
// y navega DENTRO del mismo arbol.
titulo("nota Playwright (referencia, no se evalua en jsdom)");
check("el patron es portatil: ancla por texto + salto por eje", true, true);
