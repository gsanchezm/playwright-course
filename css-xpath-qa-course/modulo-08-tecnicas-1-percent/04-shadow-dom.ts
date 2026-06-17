// ============================================================
// Mini-clase 8.4: Shadow DOM (teoria + lo ejecutable)
// ============================================================
// Analogia QA: un Web Component encapsula su interior en un "shadow root", como
// una caja negra de terceros. Tu CSS/XPath normal NO entra ahi: para el motor,
// ese arbol interno es otro documento. Saber esto te ahorra horas de "mi
// selector es correcto pero no encuentra nada". jsdom NO renderiza shadow DOM,
// asi que la TEORIA va en prosa (en el .md); aqui demostramos lo UNICO que se
// puede ejecutar offline: que la sintaxis MUERTA realmente revienta.
// ============================================================
import { check, titulo } from "../helpers/check";
import { document } from "../helpers/dom";
console.log("\n===== 8.4 Shadow DOM =====");

// ------------------------------------------------------------
// Lo que debes recordar (se desarrolla en la leccion web):
// ------------------------------------------------------------
//  · CSS y XPath estandar NO cruzan el limite shadow: un querySelector desde
//    el document NO ve los nodos dentro de un shadow root (open o closed).
//  · >>>, /deep/ y ::shadow estan ELIMINADOS de Chrome (Shadow DOM v0 salio en
//    Chrome 89). No los uses: o lanzan error o no hacen nada.
//  · El ">>" de Playwright es un separador de ENGINES (css=... >> text=...),
//    NO el ">>>" muerto. No perfora shadow por si mismo.
//  · Playwright: el engine `css` SI perfora open shadow; `css:light` NO; y el
//    engine XPath NUNCA perfora shadow.
//  · getByRole perfora el open shadow porque TODOS los locators de Playwright
//    lo hacen POR DISENO del motor — NO "porque vaya por el accessibility tree".
//  · Selenium 4: getShadowRoot() te da el root y desde ahi buscas, pero solo
//    con selectores CSS (XPath no opera dentro del shadow root).

// ------------------------------------------------------------
// Demo EJECUTABLE 1: ">>>" es sintaxis invalida -> querySelectorAll LANZA.
// ------------------------------------------------------------
// No "devuelve 0": es un selector ilegal, el motor lo rechaza. Envolvemos en
// try/catch y verificamos que efectivamente lanzo (si no envolvieramos, el
// throw abortaria ejemplo.ts entero).
titulo(">>> es sintaxis muerta: el motor la rechaza");

let lanzoDeep = false;
try {
  document.querySelectorAll("a >>> b"); // combinador inexistente -> error de sintaxis
} catch {
  lanzoDeep = true;
}
check("querySelectorAll('a >>> b') LANZA (selector invalido)", lanzoDeep, true);

// ------------------------------------------------------------
// Demo EJECUTABLE 2: pseudos CUSTOM de Playwright no son CSS estandar.
// ------------------------------------------------------------
// :has-text() y :text-is() son inventos del motor de Playwright; en un
// querySelectorAll real NO existen y lanzan. Por eso en estos .ts offline
// usamos :has() ESTANDAR para "contiene", nunca :has-text().
titulo(":has-text() es pseudo de Playwright, no CSS -> tambien lanza");

let lanzoHasText = false;
try {
  document.querySelectorAll("button:has-text('Sign In')"); // pseudo no estandar
} catch {
  lanzoHasText = true;
}
check("querySelectorAll(\"button:has-text('Sign In')\") LANZA", lanzoHasText, true);

// ------------------------------------------------------------
// Contraste: :has() SI es estandar -> NO lanza, funciona.
// ------------------------------------------------------------
// Para no dejar la idea en negativo: el :has() que usamos en todo el modulo es
// CSS valido y resuelve sin errores.
let lanzoHas = false;
try {
  document.querySelectorAll("button:has(svg)"); // :has() estandar, valido
} catch {
  lanzoHas = true;
}
check(":has() (estandar) NO lanza", lanzoHas, false);
