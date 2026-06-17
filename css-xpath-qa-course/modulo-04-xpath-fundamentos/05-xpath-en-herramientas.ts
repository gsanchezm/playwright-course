// ============================================================
// Mini-clase 4.5: XPath en Playwright, Selenium y DevTools
// ============================================================
// Analogía QA: el XPath que escribes es el MISMO en las tres herramientas;
// lo que cambia es la "puerta de entrada". Playwright lo recibe con el prefijo
// xpath= (o el atajo //), Selenium con By.xpath(...), y el DevTools del
// navegador con $x("..."). Todos delegan en el MISMO motor XPath 1.0 del
// navegador real — por eso lo que verifiques aquí (la sintaxis) transfiere,
// y por eso el comportamiento de los paréntesis (//x)[n] que jsdom equivoca,
// en estas tres herramientas es correcto.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 4.5 XPath en herramientas =====");

// ------------------------------------------------------------
// 1) El XPath de "Sign In" — la expresión que viaja a todas partes.
// ------------------------------------------------------------
// Esta es la MISMA cadena que pegarías en Playwright, Selenium o DevTools.
// Aquí la verificamos contra el fixture; allá apunta al botón real.
titulo("La expresión es la misma en las 3 herramientas");
const xpSignIn = "//button[normalize-space()='Sign In']";
check("el XPath de Sign In encuentra 1 botón", countXpath(xpSignIn), 1);
//   Playwright : page.locator(`xpath=${xpSignIn}`)   // o el atajo: page.locator("//button[...]")
//   Selenium   : driver.findElement(By.xpath(xpSignIn))
//   DevTools   : $x("//button[normalize-space()='Sign In']")   // en la consola del navegador

// ------------------------------------------------------------
// 2) Playwright: prefijo xpath= y el ATAJO //.
// ------------------------------------------------------------
// En page.locator(), una cadena que empieza con "//" o "xpath=" se trata
// como XPath; cualquier otra cosa es CSS. Son equivalentes:
//   page.locator("xpath=//a[@data-testid='nav-checkout-desktop']")
//   page.locator("//a[@data-testid='nav-checkout-desktop']")   // mismo resultado
titulo("Playwright: // y xpath= son equivalentes");
check(
  "el XPath del nav Checkout = 1",
  countXpath("//a[@data-testid='nav-checkout-desktop']"),
  1,
);

// ------------------------------------------------------------
// 3) Encadenado: dentro de otro locator usa ".//" (relativo al nodo).
// ------------------------------------------------------------
// CLAVE y sutil: cuando encadenas un XPath DENTRO de otro locator, un "//"
// que arranca con "/" se re-ANCLA al DOCUMENTO entero (ignora tu nodo base).
// Para mantenerte DENTRO del nodo base usa ".//" (relativo al nodo actual):
//   const card = page.locator("//*[@data-testid='pizza-card-101']");
//   card.locator(".//h3")   // ✅ el h3 DE ESA card
//   card.locator("//h3")    // ✗ TODOS los h3 del documento (re-anclado)
//
// Nuestro motor offline evalúa siempre desde `document`, así que el efecto
// "relativo al nodo" no se puede medir con un check() aquí; lo demostramos
// resolviendo el equivalente ABSOLUTO de "el h3 de la card 101":
titulo("Encadenado: .// se queda en el nodo; // re-ancla al documento");
const h3DeLaCard101 = $x("//*[@data-testid='pizza-card-101']//h3");
check("el h3 dentro de pizza-card-101 = 1", h3DeLaCard101.length, 1);
check("y dice 'Pepperoni'", text(h3DeLaCard101[0]), "Pepperoni");

// ------------------------------------------------------------
// 4) Todas son XPath 1.0 (y por qué eso te limita).
// ------------------------------------------------------------
// El motor de los navegadores es XPath 1.0: NO existen lower-case(), matches()
// ni ends-with(). Lo que SÍ tienes (y usarás en M5) es contains(),
// starts-with(), normalize-space() y translate() para insensibilidad a
// mayúsculas. Lo verificamos con starts-with sobre los testids de add-to-cart:
titulo("XPath 1.0: contains / starts-with / normalize-space (sin lower-case)");
check(
  "//button[starts-with(@data-testid,'add-to-cart-')] = 4",
  countXpath("//button[starts-with(@data-testid,'add-to-cart-')]"),
  4,
);
//   DevTools tip: prueba (//li)[1] en la consola con $x("(//li)[1]") en la app
//   real y compáralo con //li[1] — ahí verás la indexación global que jsdom
//   no reproduce.
