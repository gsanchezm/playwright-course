// ============================================================
// Mini-clase 8.2: :has() alcanza a XPath (composicion)
// ============================================================
// Analogia QA: un buen filtro de casos de prueba combina condiciones ("severos
// Y abiertos Y sin asignar"). Aqui hacemos lo mismo con el DOM: COMPONEMOS un
// selector que exige varias condiciones a la vez. El CSS moderno (:has + :not)
// alcanza el mismo poder expresivo que un XPath multi-predicado: cada uno
// describe "el elemento que cumple TODO esto", no "el que esta en tal posicion".
// ============================================================
import { countCss, countXpath, $$, $x, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 8.2 :has() alcanza a XPath =====");

// ------------------------------------------------------------
// CSS: :has() (mira hacia adentro) + :not() (excluye) = filtro compuesto.
// ------------------------------------------------------------
// Queremos: la tarjeta que TIENE el badge "Sin Gluten" Y que NO esta agotada.
// :has(.badge--sin-gluten) -> condicion sobre un descendiente.
// :not([data-sold-out])    -> condicion negativa sobre el propio article.
titulo("CSS: article:has(.badge--sin-gluten):not([data-sold-out])");

const cssCompuesto = "article:has(.badge--sin-gluten):not([data-sold-out])";
check("filtro CSS compuesto -> 1 tarjeta", countCss(cssCompuesto), 1);
check(
  "es la pizza-card-102 (sin gluten y disponible)",
  attr($$(cssCompuesto)[0], "data-testid"),
  "pizza-card-102",
);

// ------------------------------------------------------------
// XPath paralelo: predicado [ ... and not(...) ] sobre el mismo article.
// ------------------------------------------------------------
// .//span[...]  es el equivalente de :has() (¿tiene dentro tal descendiente?).
// not(@data-sold-out) es el equivalente de :not([...]).
// El "and" une ambas condiciones: mismo resultado, otra sintaxis.
titulo("XPath: //article[.//span[...] and not(@data-sold-out)]");

const xpathCompuesto =
  "//article[.//span[contains(@class,'badge--sin-gluten')] and not(@data-sold-out)]";
check("filtro XPath compuesto -> 1 tarjeta", countXpath(xpathCompuesto), 1);
check(
  "apunta a la MISMA tarjeta que el CSS",
  attr($x(xpathCompuesto)[0] as Element, "data-testid"),
  "pizza-card-102",
);

// ------------------------------------------------------------
// El mismo poder a nivel de control de formulario: :checked + :not([disabled]).
// ------------------------------------------------------------
// "El metodo de pago ACTUALMENTE seleccionado que ademas se puede cambiar":
// radio marcado (:checked) y no deshabilitado. transfer esta disabled; card
// esta checked y habilitado -> exactamente 1.
titulo("CSS: input[type=radio]:checked:not([disabled])");

check(
  "radio seleccionado y habilitado -> 1 (Tarjeta)",
  countCss('input[type="radio"]:checked:not([disabled])'),
  1,
);
check(
  "su value es 'card'",
  attr($$('input[type="radio"]:checked:not([disabled])')[0], "value"),
  "card",
);

// ------------------------------------------------------------
// Composicion de catalogo: "tarjetas cuyo boton de compra esta habilitado".
// ------------------------------------------------------------
// :has(.add-to-cart:not([disabled])) -> el article TIENE un add-to-cart NO
// deshabilitado. Solo la Suprema (103) esta agotada (boton disabled) -> quedan 3.
check(
  "article:has(.add-to-cart:not([disabled])) -> 3 disponibles",
  countCss("article:has(.add-to-cart:not([disabled]))"),
  3,
);
// Su negacion: la tarjeta con boton deshabilitado (la agotada) -> 1.
check(
  "article:has(button[disabled]) -> 1 (la agotada)",
  countCss("article:has(button[disabled])"),
  1,
);
