// ============================================================
// Mini-clase 6.3: following-sibling y preceding-sibling
// ============================================================
// Analogia: en una lista (lineas del carrito, campos de un formulario), el
// elemento que quieres suele estar JUNTO al que sabes localizar, no dentro de
// el. Los ejes de hermanos se mueven a los LADOS dentro del MISMO padre:
//   following-sibling::  hermanos que vienen DESPUES
//   preceding-sibling::  hermanos que vienen ANTES
// Patron clasico de QA: anclar en una etiqueta/celda conocida y saltar al
// control de al lado (el boton, el valor, la siguiente fila).
// ============================================================
import { countXpath, $x, attr, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";

console.log("\n===== 6.3 following-sibling y preceding-sibling =====");

// ------------------------------------------------------------
// following-sibling:: — la SIGUIENTE linea del carrito.
// ------------------------------------------------------------
// El carrito tiene 2 <li>: cart-line-101 (Pepperoni) y cart-line-102
// (Cuatro Quesos). Desde la primera, su unico hermano siguiente es la segunda.
titulo("following-sibling: la siguiente linea");
check(
  "cart-line-101 -> following-sibling::li = 1",
  countXpath(`//li[@data-testid="cart-line-101"]/following-sibling::li`),
  1,
);
const siguiente = $x(`//li[@data-testid="cart-line-101"]/following-sibling::li`)[0] as Element;
check("ese hermano siguiente es la linea 102", attr(siguiente, "data-testid"), "cart-line-102");

// ------------------------------------------------------------
// preceding-sibling:: — la linea ANTERIOR.
// ------------------------------------------------------------
// Desde la segunda linea, su unico hermano anterior es la primera.
titulo("preceding-sibling: la linea anterior");
check(
  "cart-line-102 -> preceding-sibling::li = 1",
  countXpath(`//li[@data-testid="cart-line-102"]/preceding-sibling::li`),
  1,
);
const anterior = $x(`//li[@data-testid="cart-line-102"]/preceding-sibling::li`)[0] as Element;
check("ese hermano anterior es la linea 101", attr(anterior, "data-testid"), "cart-line-101");

// ------------------------------------------------------------
// El caso pro: anclar en un elemento conocido y saltar al control de al lado.
// ------------------------------------------------------------
// En el formulario de login, el <div data-testid="login-error"> y el boton
// "Sign In" son HERMANOS (ambos hijos directos del <form>). Anclar en el
// mensaje de error y saltar al boton siguiente lo localiza sin depender de
// su clase ni su posicion absoluta.
titulo("login-error -> el boton Sign In de al lado");
check(
  "login-error -> following-sibling::button = 1",
  countXpath(`//div[@data-testid="login-error"]/following-sibling::button`),
  1,
);
const boton = $x(`//div[@data-testid="login-error"]/following-sibling::button`)[0] as Element;
check("ese boton es el de login (Sign In)", text(boton), "Sign In");
check("...y su data-testid es login-button-desktop", attr(boton, "data-testid"), "login-button-desktop");

// ------------------------------------------------------------
// OJO: los hermanos comparten PADRE. Cruzar de contenedor no funciona.
// ------------------------------------------------------------
// El <span class="price"> de la tarjeta de Pepperoni es hermano de su <h3>,
// pero el <h3> de OTRA tarjeta NO es su hermano (viven en articles distintos).
titulo("los hermanos comparten el mismo padre");
// Dentro de la tarjeta de Pepperoni, el h3 y el span.price son hermanos:
check(
  "el h3 de Pepperoni tiene 1 span.price hermano",
  countXpath(`//h3[normalize-space()="Pepperoni"]/following-sibling::span[@class="price"]`),
  1,
);
// Pero el h3 de Pepperoni NO tiene como hermano al h3 de otra pizza:
check(
  "el h3 de Pepperoni NO tiene un h3 hermano (otra tarjeta = otro padre)",
  countXpath(`//h3[normalize-space()="Pepperoni"]/following-sibling::h3`),
  0,
);
