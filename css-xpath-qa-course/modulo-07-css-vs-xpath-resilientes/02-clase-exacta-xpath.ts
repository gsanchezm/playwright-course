// ============================================================
// Mini-clase 7.2: Clase exacta en XPath (el idioma de la "clase acolchada")
// ============================================================
// Analogía QA: en CSS, `.is-soldout` ya significa "tiene ESA clase, sin
// importar qué otras tenga". XPath 1.0 NO tiene selector de clase: @class es
// un STRING crudo. Si comparas con `=` exiges que el atributo COMPLETO sea
// ese valor — y como las clases son multi-valor, casi siempre falla.
//
// Idea central: para "tiene la clase X" en XPath se usa el patrón
//   contains(concat(' ', normalize-space(@class), ' '), ' X ')
// que "acolcha" la lista de clases con espacios y busca ' X ' rodeada de
// espacios → coincidencia EXACTA de token, igual que el `.X` de CSS.
// ============================================================
import { countCss, countXpath, $$, $x } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 7.2 Clase exacta en XPath =====");

// ------------------------------------------------------------
// El error clásico: [@class="pizza-card"] con multi-clase FALLA.
// ------------------------------------------------------------
// Las tarjetas tienen class="pizza-card css-7h3k1p" (y la 103 además
// is-soldout). Como @class NUNCA es exactamente "pizza-card", la igualdad
// estricta devuelve 0. Es el bug más común al portar un `.pizza-card` de CSS.
titulo("Igualdad estricta con multi-clase = 0 matches");
const exactaFalla = countXpath("//*[@class='pizza-card']");
check("[@class='pizza-card'] NO encuentra nada (multi-clase)", exactaFalla, 0);

// ------------------------------------------------------------
// El idioma correcto: la "clase acolchada".
// ------------------------------------------------------------
// concat(' ', normalize-space(@class), ' ') convierte
//   "pizza-card css-7h3k1p"  →  " pizza-card css-7h3k1p "
// y buscamos el token rodeado de espacios " pizza-card ". Coincide exacto y
// no se confunde con prefijos/sufijos. Cuenta 4 (las 4 tarjetas).
titulo("Clase acolchada = coincidencia exacta de token");
const acolchada = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' pizza-card ')]",
);
check("clase acolchada ' pizza-card ' cuenta 4", acolchada, 4);

// En CSS lo mismo es trivial: `.pizza-card` ya es exacto por diseño.
const enCss = countCss(".pizza-card");
check("CSS .pizza-card cuenta 4 (sin acolchar)", enCss, 4);
check("XPath acolchado y CSS coinciden", acolchada === enCss, true);

// ------------------------------------------------------------
// Por qué el contains() INGENUO es peligroso.
// ------------------------------------------------------------
// contains(@class, 'is-soldout') parece funcionar... hasta que existe una
// clase como "is-soldout-pending" o "was-soldout": el substring colaría.
// En el fixture is-soldout es única, así que el ingenuo da 1 igual que el
// acolchado — pero el HÁBITO correcto es siempre acolchar. Demostramos que
// el acolchado es exacto y NO matchea un token parcial inventado.
titulo("contains() ingenuo vs token acolchado");
const soldoutAcolchada = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
);
check("clase acolchada ' is-soldout ' cuenta 1", soldoutAcolchada, 1);
// El token acolchado de un fragmento ('soldou') NO existe rodeado de espacios:
const fragmentoNoCuela = countXpath(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' soldou ')]",
);
check("un fragmento ' soldou ' NO cuela con acolchado", fragmentoNoCuela, 0);

// ------------------------------------------------------------
// Mismo nodo: CSS .is-soldout y XPath acolchado.
// ------------------------------------------------------------
const csNode = $$(".is-soldout")[0];
const xpNode = $x(
  "//*[contains(concat(' ', normalize-space(@class), ' '), ' is-soldout ')]",
)[0] as Element;
check("CSS .is-soldout y XPath acolchado son el mismo nodo", csNode === xpNode, true);
