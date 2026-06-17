// ============================================================
// Mini-clase 8.1: Selector pivot / ancla (bottom-up)
// ============================================================
// Analogia QA: cuando un elemento NO tiene un hook propio estable (un boton
// icon-only, un precio sin id), no lo persigas de arriba hacia abajo con una
// cadena fragil. Anclate en el nodo ESTABLE mas cercano —casi siempre un TEXTO
// UNICO y visible para el usuario— y navega desde ahi hacia tu objetivo.
// Esto es "bottom-up": del ancla de texto al elemento, no de la raiz al fondo.
// ============================================================
import { countCss, countXpath, $$, $x, text, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 8.1 Selector pivot / ancla =====");

// ------------------------------------------------------------
// El problema: el objetivo no tiene hook propio.
// ------------------------------------------------------------
// El boton "agregar al carrito" de cada pizza es icon-only: su testid es
// dinamico (add-to-cart-101, -102...) y su aria-label esta vacio. Lo unico
// 100% estable y legible de esa tarjeta es el NOMBRE de la pizza (un <h3>).
// Ese <h3> es nuestra ANCLA.
titulo("XPath: ancla en el texto y sube por el eje ancestor::");

// 1) Anclamos en el texto unico "Cuatro Quesos" y SUBIMOS al <article> padre.
//    ancestor:: recorre hacia arriba; nos da la tarjeta completa desde el nombre.
const cardCuatroQuesos = "//h3[normalize-space()='Cuatro Quesos']/ancestor::article";
check("ancla de texto sube a 1 sola tarjeta", countXpath(cardCuatroQuesos), 1);
check(
  "la tarjeta anclada es pizza-card-102",
  attr($x(cardCuatroQuesos)[0] as Element, "data-testid"),
  "pizza-card-102",
);

// 2) Desde el ancla, BAJAMOS al objetivo real (el boton add-to-cart de ESA card).
const btnDesdeAncla =
  "//h3[normalize-space()='Cuatro Quesos']/ancestor::article//button[contains(@class,'add-to-cart')]";
check("del ancla bajamos a 1 boton", countXpath(btnDesdeAncla), 1);
check(
  "y es exactamente el boton add-to-cart-102",
  attr($x(btnDesdeAncla)[0] as Element, "data-testid"),
  "add-to-cart-102",
);

// ------------------------------------------------------------
// El mismo patron en CSS: :has() como "ancestor:: de los pobres".
// ------------------------------------------------------------
// CSS no tiene ejes hacia arriba. Pero :has() te deja seleccionar un ANCESTRO
// por lo que CONTIENE: "el article que TIENE dentro tal cosa". Es la forma
// CSS de anclar en el contenido y quedarte con el contenedor.
titulo("CSS: :has() ancla el contenedor por lo que contiene");

// CSS no matchea texto de nodos, asi que anclamos en un hook de contenido
// estable de esa tarjeta: su badge "Sin Gluten" (solo la Cuatro Quesos lo tiene).
check(
  "article:has(.badge--sin-gluten) -> 1 tarjeta",
  countCss("article:has(.badge--sin-gluten)"),
  1,
);
check(
  "es la misma pizza-card-102",
  attr($$("article:has(.badge--sin-gluten)")[0], "data-testid"),
  "pizza-card-102",
);

// Y desde ese contenedor anclado, descendemos al boton (sintaxis descendiente normal).
const btnCss = "article:has(.badge--sin-gluten) .add-to-cart";
check("del contenedor :has() al boton -> 1", countCss(btnCss), 1);
check(
  "boton CSS == boton XPath == add-to-cart-102",
  attr($$(btnCss)[0], "data-testid"),
  "add-to-cart-102",
);

// ------------------------------------------------------------
// Por que el ancla gana: sobrevive al reordenamiento.
// ------------------------------------------------------------
// Un selector posicional ("la 3a tarjeta", nth-...) se rompe si el catalogo
// reordena. El ancla de texto sigue el contenido: mientras "Cuatro Quesos"
// exista y sea unico, el selector apunta a su tarjeta sin importar la posicion.
const precioAnclado =
  "//h3[normalize-space()='Cuatro Quesos']/following-sibling::span[contains(@class,'price')]";
check(
  "tambien alcanzamos el precio de ESA pizza por hermano",
  text($x(precioAnclado)[0] as Element),
  "$175.00",
);
