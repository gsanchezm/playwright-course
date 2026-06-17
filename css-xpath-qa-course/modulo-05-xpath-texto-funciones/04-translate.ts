// ============================================================
// Mini-clase 5.4: translate() para case-insensitive
// ============================================================
// Analogía QA: a veces el texto llega con un casing que no controlas
// ("Pepperoni", "PEPPERONI", "pepperoni" según el CMS o el idioma). Quieres
// un match que ignore mayúsculas. El problema: el XPath de los navegadores es
// 1.0 y NO tiene lower-case(). El truco clásico es translate(): un
// "buscar y reemplazar" carácter por carácter que baja todo a minúsculas.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 5.4 translate() para case-insensitive =====");

// Reutilizamos el mapeo A→a en una constante para no repetir los 26x26 chars.
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const abc = "abcdefghijklmnopqrstuvwxyz";

// ------------------------------------------------------------
// translate(cadena, de, a) — sustituye carácter por carácter.
// ------------------------------------------------------------
// translate(., "ABC...", "abc...") reemplaza cada mayúscula por su minúscula
// (posición a posición). "Pepperoni" → "pepperoni". Ahora la igualdad ignora
// el casing original del DOM.
titulo("translate() baja el texto a minúsculas → igualdad case-insensitive");
check(
  '//h3[translate(normalize-space(.), ABC, abc)="pepperoni"] → 1',
  countXpath(`//h3[translate(normalize-space(.), "${ABC}", "${abc}")="pepperoni"]`),
  1,
);

// ------------------------------------------------------------
// GUARDRAIL #6: en XPath 1.0 (lo que corren los navegadores) NO existen
// lower-case(), upper-case(), matches() ni ends-with(). Esas son de XPath 2.0.
// Si las usas en Chrome/Playwright/Selenium, el motor lanza un error de
// sintaxis. translate() es la herramienta correcta para case-insensitive aquí.
// ------------------------------------------------------------

// ------------------------------------------------------------
// Combinar translate + contains: subcadena sin importar el casing.
// ------------------------------------------------------------
// Bajamos el string-value a minúsculas y luego buscamos la subcadena (también
// en minúsculas). "Cuatro Quesos" contiene "quesos"; "Suprema de Carnes"
// contiene "carnes". Dos pizzas distintas, mismo patrón insensible a casing.
titulo("translate() + contains() = subcadena case-insensitive");
check(
  '//h3[contains(translate(., ABC, abc), "quesos")] → 1',
  countXpath(`//h3[contains(translate(., "${ABC}", "${abc}"), "quesos")]`),
  1,
);
check(
  '//h3[contains(translate(., ABC, abc), "carnes")] → 1',
  countXpath(`//h3[contains(translate(., "${ABC}", "${abc}"), "carnes")]`),
  1,
);

// ------------------------------------------------------------
// translate() también sirve para BORRAR caracteres (mapear a vacío).
// ------------------------------------------------------------
// Si el segundo argumento es más corto que el primero, los caracteres sin
// pareja se ELIMINAN. translate(texto, "$", "") quita el símbolo de moneda:
// "$189.00" → "189.00". Útil para limpiar antes de comparar.
titulo('translate(texto, "$", "") borra el símbolo de moneda');
check(
  '//span[@data-testid="price-101"][translate(normalize-space(.), "$", "")="189.00"] → 1',
  countXpath('//span[@data-testid="price-101"][translate(normalize-space(.), "$", "")="189.00"]'),
  1,
);

// qa_transfer: en Playwright no necesitas este truco — page.getByText(/pepperoni/i)
// usa una regex con la flag `i` y resuelve el case-insensitive de forma nativa.
// translate() es lo que escribes cuando estás CONFINADO a XPath 1.0 (Selenium
// puro, locators xpath= heredados, herramientas que solo aceptan XPath).
