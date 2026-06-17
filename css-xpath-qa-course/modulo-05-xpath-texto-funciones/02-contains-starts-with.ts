// ============================================================
// Mini-clase 5.2: contains() y starts-with()
// ============================================================
// Analogía QA: cuando no conoces el texto EXACTO (un total que cambia, un id
// dinámico, un href con prefijo fijo), no puedes pedir igualdad. Pides una
// COINCIDENCIA PARCIAL: "que contenga..." o "que empiece con...". Es el LIKE
// '%texto%' de SQL, pero para el DOM.
// ============================================================
import { countXpath, $x, text, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 5.2 contains() y starts-with() =====");

// ------------------------------------------------------------
// contains(haystack, needle) — ¿la subcadena `needle` aparece en `haystack`?
// ------------------------------------------------------------
// OJO: contains() es SUBCADENA LITERAL, no una regex. "Marg" no son comodines
// ni clases de caracteres: es texto exacto que debe aparecer tal cual.
titulo("contains(.,...) busca subcadena (literal, NO regex)");
check('//h3[contains(., "Quesos")] → 1', countXpath('//h3[contains(., "Quesos")]'), 1);

// contains sobre un atributo: una clase BEM con modificador. `contains(@class,
// "badge--popular")` evita exigir el valor completo "badge badge--popular".
check('//span[contains(@class, "badge--popular")] → 1', countXpath('//span[contains(@class, "badge--popular")]'), 1);

// contra `.` (string-value) atrapa texto aunque esté repartido en hijos: el
// <li> de carrito "contiene" Pepperoni aunque viva en un <span> anidado.
check(
  '//li[contains(@class, "cart-line")][contains(., "Cuatro Quesos")] → 1',
  countXpath('//li[contains(@class, "cart-line")][contains(., "Cuatro Quesos")]'),
  1,
);

// ------------------------------------------------------------
// starts-with(cadena, prefijo) — ¿`cadena` arranca con `prefijo`?
// ------------------------------------------------------------
// Ideal para atributos con prefijo fijo. El enlace de contacto del footer es
// el único cuyo href empieza con "mailto:".
titulo("starts-with(@attr, prefijo) ancla al inicio del atributo");
check('//a[starts-with(@href, "mailto:")] → 1', countXpath('//a[starts-with(@href, "mailto:")]'), 1);

// 4 enlaces tienen href que empieza con "http" (privacidad + ayuda + 2
// sociales). starts-with sobre el prefijo del protocolo los agrupa.
check('//a[starts-with(@href, "http")] → 4', countXpath('//a[starts-with(@href, "http")]'), 4);

// starts-with sobre TEXTO: combínalo con normalize-space para que el
// whitespace no rompa el prefijo. La pizza cuyo nombre empieza con "Pep".
check(
  '//h3[starts-with(normalize-space(.), "Pep")] → 1',
  countXpath('//h3[starts-with(normalize-space(.), "Pep")]'),
  1,
);

// ------------------------------------------------------------
// Combinarlos: contains + starts-with en el mismo predicado.
// ------------------------------------------------------------
// El testid dinámico de las tarjetas: empieza con "pizza-card-" (prefijo
// estable) y termina en un id que no conocemos de antemano. starts-with sobre
// el atributo es el hook resiliente.
titulo("Prefijo estable + sufijo dinámico");
check(
  '//article[starts-with(@data-testid, "pizza-card-")] → 4',
  countXpath('//article[starts-with(@data-testid, "pizza-card-")]'),
  4,
);

// qa_transfer: en Playwright, contains de texto = page.getByText("Quesos")
// (subcadena por defecto); el prefijo de atributo no tiene azúcar dedicado y
// se escribe igual: page.locator('xpath=//a[starts-with(@href,"mailto:")]').
