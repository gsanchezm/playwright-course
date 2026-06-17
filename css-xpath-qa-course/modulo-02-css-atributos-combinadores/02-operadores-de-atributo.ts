// ============================================================
// Mini-clase 2.2: Operadores de atributo (^= $= *= ~= |= y flag i)
// ============================================================
// Analogía QA: si [attr="x"] es "igual a", los operadores son los demás
// comparadores de un filtro: "empieza con", "termina con", "contiene",
// "está en la lista". Son tu arsenal para enganchar valores DINÁMICOS
// (testids con id, hrefs de archivos, listas de rel) sin escribir el valor
// completo a mano.
// ============================================================
import { countCss } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 2.2 Operadores de atributo =====");

// ------------------------------------------------------------
// ^=  PREFIJO: "el valor EMPIEZA con...".
// ------------------------------------------------------------
// Los testids de las cards llevan un id dinámico (pizza-card-101, -102...).
// `[data-testid^="pizza-card-"]` los engancha a TODOS por su prefijo estable,
// sin importar el número. Las 4 cards.
titulo("^= prefijo");
check('[data-testid^="pizza-card-"] → 4 cards', countCss('[data-testid^="pizza-card-"]'), 4);
check('[data-testid^="add-to-cart-"] → 4 botones', countCss('[data-testid^="add-to-cart-"]'), 4);

// ------------------------------------------------------------
// $=  SUFIJO: "el valor TERMINA con...".
// ------------------------------------------------------------
// `[href$=".pdf"]` captura enlaces a archivos PDF por su extensión. Solo el
// link de Términos apunta a un .pdf.
titulo("$= sufijo");
check('[href$=".pdf"] → 1 (Términos)', countCss('[href$=".pdf"]'), 1);
// Los testids de viewport terminan en "-desktop": útil para filtrar la capa
// activa del responsive.
check('[data-testid$="-desktop"] → 13', countCss('[data-testid$="-desktop"]'), 13);

// ------------------------------------------------------------
// *=  SUBCADENA: "el valor CONTIENE... en cualquier parte".
// ------------------------------------------------------------
// `[class*="badge"]` matchea cualquier class que contenga "badge". OJO: son
// 4, no 3 — atrapa los 3 <span class="badge ..."> de las cards Y el
// span.cart-badge del header. La subcadena no respeta límites de palabra.
titulo("*= subcadena");
check('[class*="badge"] → 4 (3 badges + cart-badge)', countCss('[class*="badge"]'), 4);
// `[src*="cuatro"]` engancha la imagen de la pizza Cuatro Quesos por un
// fragmento de su ruta.
check('[src*="cuatro"] → 1', countCss('[src*="cuatro"]'), 1);

// ------------------------------------------------------------
// ~=  PALABRA en lista separada por ESPACIOS.
// ------------------------------------------------------------
// `[rel~="noopener"]` matchea si "noopener" es UNA de las palabras del
// atributo rel (rel="noopener" y rel="noopener noreferrer" ambos cuentan).
// Distinto de *=: ~= exige palabra COMPLETA, no subcadena.
titulo("~= palabra en lista");
check('[rel~="noopener"] → 2', countCss('[rel~="noopener"]'), 2);
check('[rel~="noreferrer"] → 1 (solo el de privacidad)', countCss('[rel~="noreferrer"]'), 1);

// ------------------------------------------------------------
// |=  CÓDIGO DE IDIOMA: valor EXACTO "v" O prefijo "v-".
// ------------------------------------------------------------
// GUARDRAIL: [lang|="es"] NO significa "empieza con es". Significa el valor
// EXACTO "es" O que empiece con "es-" (es-MX, es-ES). Está pensado para
// subcódigos de idioma con guion. Aquí solo <html lang="es"> matchea.
titulo("|= idioma: exacto v o prefijo v-");
check('[lang|="es"] → 1 (html lang="es")', countCss('[lang|="es"]'), 1);
// Para confirmar la regla: "es" matchea, "es-MX" matchearía, pero
// "estonia" NO (no es "es" ni empieza con "es-").

// ------------------------------------------------------------
// flag i — comparación INSENSIBLE a mayúsculas.
// ------------------------------------------------------------
// Por defecto el valor se compara case-sensitive. El flag `i` antes del `]`
// lo vuelve insensible: útil cuando el casing del dato no es confiable.
titulo("flag i (case-insensitive)");
check('[data-category="VEGGIE"] (sin i) → 0', countCss('[data-category="VEGGIE"]'), 0);
check('[data-category="VEGGIE" i] (con i) → 1', countCss('[data-category="VEGGIE" i]'), 1);

// qa_transfer: en Playwright estos operadores viven igual dentro de
// page.locator('[data-testid^="pizza-card-"]'). Son CSS estándar: el motor
// del navegador los entiende sin cambios.
