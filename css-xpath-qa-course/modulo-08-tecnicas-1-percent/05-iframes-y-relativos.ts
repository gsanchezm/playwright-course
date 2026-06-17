// ============================================================
// Mini-clase 8.5: iframes y relative locators
// ============================================================
// Analogia QA: un <iframe> es un documento DENTRO de otro documento —como un
// formulario de pago de terceros incrustado. Tus selectores NO cruzan ese
// limite: hay que "entrar" al frame primero (frameLocator / switchTo). Y los
// "relative locators" (above/below/near) localizan por POSICION VISUAL, lo que
// es potente pero fragil: depende del render. jsdom no renderiza ni cruza
// frames, asi que esos temas van en prosa (en el .md). Aqui demostramos el
// analogo OFFLINE de "relativo": navegar por EJES segun la posicion estructural.
// ============================================================
import { countXpath, $x, text, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 8.5 iframes y relative locators =====");

// ------------------------------------------------------------
// Teoria (se desarrolla en la leccion web):
// ------------------------------------------------------------
//  · iframes: un selector vive en UN documento. querySelector desde la pagina
//    padre NO ve dentro del <iframe> (es otro document). En Playwright entras
//    con frameLocator('iframe').getByRole(...); en Selenium con
//    driver.switchTo().frame(...). Sin "entrar", el elemento es invisible.
//  · Relative locators (Selenium 4): above(), below(), near(), toLeftOf(),
//    toRightOf() localizan por la GEOMETRIA del render. Son legibles pero
//    FRAGILES: cambia un margin/wrap responsive y "el boton a la derecha de X"
//    deja de serlo. Sus analogos en Playwright (:near, :right-of) estan
//    DEPRECADOS justo por eso. Prefiere relacion ESTRUCTURAL (DOM) sobre
//    relacion VISUAL (pixeles) cuando puedas.

// ------------------------------------------------------------
// El analogo OFFLINE y robusto: relacion por EJES (estructura del DOM).
// ------------------------------------------------------------
// En vez de "el precio que esta visualmente bajo el nombre" (geometria), usamos
// "el precio que es HERMANO siguiente del nombre" (estructura). Mismo objetivo,
// pero atado al DOM, no al pixel: sobrevive al re-render.
titulo("Relacion estructural: following-sibling:: (no geometria)");

// Desde el nombre "Pepperoni", el precio hermano siguiente de su tarjeta.
const precioDePepperoni =
  "//h3[normalize-space()='Pepperoni']/following-sibling::span[contains(@class,'price')]";
check("precio hermano de 'Pepperoni' -> 1", countXpath(precioDePepperoni), 1);
check(
  "y su texto (normalize-space limpia el whitespace) es $189.00",
  text($x(precioDePepperoni)[0] as Element),
  "$189.00",
);

// "below/above" estructural: el boton que viene DESPUES del nombre en su card.
titulo("Analogo de 'below': el control que sigue al ancla en el DOM");

const botonDespuesDelNombre =
  "//h3[normalize-space()='Pan de Ajo']/following-sibling::button[contains(@class,'add-to-cart')]";
check("boton tras 'Pan de Ajo' -> 1", countXpath(botonDespuesDelNombre), 1);
check(
  "es add-to-cart-104",
  attr($x(botonDespuesDelNombre)[0] as Element, "data-testid"),
  "add-to-cart-104",
);

// "toLeftOf" / preceding:: estructural: desde el precio, sube al nombre previo.
titulo("Analogo de 'toLeftOf': preceding-sibling:: hacia el ancla anterior");

const nombrePrevioAlPrecio =
  "//article[@data-testid='pizza-card-101']//span[contains(@class,'price')]/preceding-sibling::h3";
check(
  "el <h3> previo al precio en la card 101 es 'Pepperoni'",
  text($x(nombrePrevioAlPrecio)[0] as Element),
  "Pepperoni",
);
