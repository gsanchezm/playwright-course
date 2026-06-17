// ============================================================
// Mini-clase 8.3: XPath dinamico (concat, predicados, comillas)
// ============================================================
// Analogia QA: a veces el texto que buscas TIENE comillas o apostrofes, o tu
// condicion combina varios criterios (data-driven). XPath 1.0 te da las piezas
// para construir esa consulta sin romperte: concat() para literales con
// comillas, predicados and/or para condiciones compuestas, y translate() para
// comparar sin distinguir mayusculas. Son las herramientas para el XPath que
// NO puedes escribir como una cadena estatica simple.
// ============================================================
import { countXpath, $x, attr } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 8.3 XPath dinamico =====");

// ------------------------------------------------------------
// concat(): meter una comilla dentro de un literal XPath.
// ------------------------------------------------------------
// XPath 1.0 NO tiene escape con backslash. Si tu texto contiene un apostrofe
// y delimitas con apostrofes, no puedes "escaparlo": tienes que partir el
// literal en pedazos y unirlos con concat(), metiendo la comilla como su
// PROPIO literal (delimitado con el OTRO tipo de comilla).
//
// Aqui el titulo termina en un punto: lo reconstruimos con concat() como demo
// de "armar el string por partes". El punto va como literal separado.
titulo("concat(): construir el texto buscado por partes");

const xpConcat = "//h1[normalize-space()=concat('Crafting moments of pure flavor', '.')]";
check("h1 reconstruido con concat() -> 1", countXpath(xpConcat), 1);

// Patron para texto con APOSTROFE (no hay uno asi en el fixture, pero este es
// el molde): concat("It", "'", "s gluten free")  ->  It's gluten free
//   · "It" y "s gluten free" van con comillas dobles.
//   · el apostrofe va SOLO, delimitado con comillas dobles: "'".
// Regla: las comillas son literales SEPARADOS; XPath no tiene backslash.

// ------------------------------------------------------------
// Predicados compuestos: [ A and B ] / [ A or B ].
// ------------------------------------------------------------
// "El formulario que tiene un boton DESHABILITADO y ademas un input invalido":
// describe el checkout (place-order disabled + zip aria-invalid). El login NO
// cumple (su boton no esta disabled). -> exactamente 1.
titulo("Predicado AND: //form[.//button[@disabled] and .//input[@aria-invalid='true']]");

const formBloqueado = "//form[.//button[@disabled] and .//input[@aria-invalid='true']]";
check("form con boton disabled Y input invalido -> 1", countXpath(formBloqueado), 1);
check(
  "es el checkout-form",
  attr($x(formBloqueado)[0] as Element, "data-testid"),
  "checkout-form",
);

// OR: "botones que estan deshabilitados O presionados (aria-pressed)".
// disabled: add-to-cart-103 + place-order = 2; aria-pressed=true: la bandera MX = 1.
// Total 3 (conjuntos disjuntos aqui).
check(
  "//button[@disabled or @aria-pressed='true'] -> 3",
  countXpath("//button[@disabled or @aria-pressed='true']"),
  3,
);

// ------------------------------------------------------------
// translate(): comparacion case-insensitive (XPath 1.0 no tiene lower-case()).
// ------------------------------------------------------------
// En el navegador NO existen lower-case() ni matches() (eso es XPath 2.0+).
// Para ignorar mayusculas mapeas A-Z -> a-z con translate() y comparas en
// minusculas. Asi "Sign In" matchea aunque escribamos 'sign in'.
titulo("translate(): 'Sign In' sin distinguir mayusculas");

const botonInsensible =
  "//button[translate(normalize-space(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz')='sign in']";
check("boton 'sign in' (case-insensitive) -> 1", countXpath(botonInsensible), 1);
check(
  "es el login-button-desktop",
  attr($x(botonInsensible)[0] as Element, "data-testid"),
  "login-button-desktop",
);

// ------------------------------------------------------------
// ⚠️ Trampa de jsdom: la indexacion con PARENTESIS (//x)[n].
// ------------------------------------------------------------
// (//x)[n] = "aplana TODOS los //x en una sola lista y toma el n-esimo GLOBAL".
// //x[n]   = "para CADA padre, toma su n-esimo hijo //x" (por-padre).
// Cuando los //x cuelgan de varios padres, los dos NO son lo mismo.
//
// Aqui hay 6 <span> repartidos en 2 <li> del carrito (3 por li). Eso SI lo
// medimos con check() porque ambos motores coinciden en el conteo total:
const spansEnCarrito = "//li[contains(@class,'cart-line')]//span";
check("hay 6 <span> dentro de las cart-line (2 li x 3)", countXpath(spansEnCarrito), 6);

// PERO el indexado parentizado diverge segun el MOTOR:
//   · Navegador / Playwright / Selenium:  (//li...//span)[1]  -> 1 nodo (el 1o global)
//   · jsdom (este runner):                (//li...//span)[1]  -> 2 nodos (1 por li)
// jsdom evalua (//x)[1] como //x[1] (por-padre). Por eso NO hacemos check()
// del resultado parentizado: jsdom mentiria. La VERDAD del comportamiento es
// la del navegador; jsdom solo aproxima la SINTAXIS. Lo dejamos documentado:
console.log(
  "ℹ️  (//li...//span)[1] -> navegador: 1 nodo (global) · jsdom: " +
    countXpath("(//li[contains(@class,'cart-line')]//span)[1]") +
    " (por-padre). El navegador/Playwright es la verdad.",
);
