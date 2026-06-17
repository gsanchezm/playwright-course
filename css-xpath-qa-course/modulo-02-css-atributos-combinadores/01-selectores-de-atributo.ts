// ============================================================
// Mini-clase 2.1: Selectores de atributo
// ============================================================
// Analogía QA: un selector de atributo es como filtrar una tabla de datos
// por una COLUMNA, no por su posición. En vez de "la fila 3", dices "las
// filas donde categoria = veggie". El DOM es la tabla; los atributos son
// las columnas; `[attr]` y `[attr="valor"]` son tu filtro.
// ============================================================
import { countCss, $$, attr, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 2.1 Selectores de atributo =====");

// ------------------------------------------------------------
// [attr] — presencia: "tiene este atributo, sin importar su valor".
// ------------------------------------------------------------
// `[data-testid]` matchea TODO elemento que LLEVE el atributo, sin mirar el
// valor. Es el filtro más amplio: "¿esta columna existe en la fila?".
titulo("Presencia: [attr]");
check('[data-testid] (presencia) matchea muchos', countCss("[data-testid]"), 61);

// `[hidden]` es presencia de un atributo booleano: el banner de cold-start
// está oculto en el fixture. Solo 1 elemento lo lleva.
check('[hidden] (atributo booleano) → 1', countCss("[hidden]"), 1);

// `[data-sold-out]` solo lo lleva la card agotada (103). Presencia = 1.
check('[data-sold-out] (presencia) → 1', countCss("[data-sold-out]"), 1);

// ------------------------------------------------------------
// [attr="valor"] — valor EXACTO: "esta columna vale exactamente esto".
// ------------------------------------------------------------
// `[data-category="veggie"]` exige el valor completo "veggie". Solo la card
// 102 (Cuatro Quesos) lo cumple.
titulo('Valor exacto: [attr="valor"]');
check('[data-category="veggie"] → 1', countCss('[data-category="veggie"]'), 1);

// `[aria-pressed="true"]` aísla la bandera de mercado SELECCIONADA (MX). Las
// otras 3 banderas tienen aria-pressed="false", así que NO matchean.
check('[aria-pressed="true"] (bandera activa MX) → 1', countCss('[aria-pressed="true"]'), 1);

// El valor exacto distingue estado: "true" no es "false".
check('[aria-pressed="false"] (banderas inactivas) → 3', countCss('[aria-pressed="false"]'), 3);

// ------------------------------------------------------------
// Combinar con etiqueta/clase: estrechar el universo.
// ------------------------------------------------------------
// `article[data-category="meat"]` = solo el <article> cuya categoría es
// carnes (la Suprema, 103). El atributo afina; la etiqueta acota el tipo.
titulo("Atributo + etiqueta");
const meat = $$('article[data-category="meat"]');
check('article[data-category="meat"] → 1', meat.length, 1);
check("...y es la Suprema de Carnes", text(meat[0].querySelector(".pizza-name")), "Suprema de Carnes");

// El atributo es un CONTRATO de datos: leemos data-price directamente, sin
// parsear el texto "$210.00" (que tiene el símbolo y los decimales).
const precioMeat = attr(meat[0], "data-price");
check("data-price del meat = '210' (dato limpio, sin $)", precioMeat, "210");

// qa_transfer: en Playwright esto es page.locator('[data-category="veggie"]').
// El selector de atributo es idéntico; cambia solo el motor que lo evalúa.
