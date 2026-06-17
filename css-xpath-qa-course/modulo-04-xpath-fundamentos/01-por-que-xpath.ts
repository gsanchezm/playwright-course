// ============================================================
// Mini-clase 4.1: ¿Por qué XPath?
// ============================================================
// Analogía QA: CSS es un "buscador por etiqueta y clase" rapidísimo, pero
// MUDO ante el contenido y ciego hacia arriba. XPath es la linterna que SÍ
// alumbra hacia atrás (al padre, al ancestro) y SÍ lee el texto del nodo.
// En QA muchas veces el ancla más estable es "el botón que dice Sign In" o
// "la tarjeta que CONTIENE este <h3>": eso CSS clásico no lo sabe expresar.
// ============================================================
import { countCss, countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 4.1 ¿Por qué XPath? =====");

// ------------------------------------------------------------
// 1) El mismo target, dos lenguajes: CSS y XPath conviven.
// ------------------------------------------------------------
// XPath NO reemplaza a CSS: es otra forma de DIRECCIONAR el mismo árbol.
// Para un target trivial (un data-testid), ambos cuentan lo mismo.
titulo("El mismo botón, contado por CSS y por XPath");
const cssLogin = countCss("button[data-testid='login-button-desktop']");
const xpLogin = countXpath("//button[@data-testid='login-button-desktop']");
check("CSS encuentra 1 botón de login", cssLogin, 1);
check("XPath encuentra ESE MISMO botón", xpLogin, 1);
check("CSS y XPath coinciden en el conteo", cssLogin === xpLogin, true);

// ------------------------------------------------------------
// 2) Lo que CSS NO puede #1: seleccionar por TEXTO del elemento.
// ------------------------------------------------------------
// CSS no tiene "selecciona el botón cuyo texto es 'Sign In'". XPath sí,
// con normalize-space() (texto del nodo, ya recortado). Esto es oro en QA:
// el rótulo visible suele ser más estable que una clase generada.
titulo("CSS no sabe leer texto — XPath sí");
check(
  "XPath: el botón cuyo texto es 'Sign In'",
  countXpath("//button[normalize-space()='Sign In']"),
  1,
);
check(
  "XPath: el enlace cuyo texto es 'Checkout'",
  countXpath("//a[text()='Checkout']"),
  1,
);

// ------------------------------------------------------------
// 3) Lo que CSS NO puede #2: subir al PADRE / ANCESTRO.
// ------------------------------------------------------------
// CSS selecciona hacia abajo y a los lados, nunca hacia arriba (antes de
// :has, y aun así :has no "navega" como un eje). XPath tiene `..` (el padre)
// y ejes hacia atrás. Patrón clásico: "dame la TARJETA que contiene este h3".
titulo("CSS no sube al padre — XPath sí con ..");
const tarjetaDePepperoni = $x("//h3[text()='Pepperoni']/..");
check("XPath: el padre del <h3> Pepperoni existe (1)", tarjetaDePepperoni.length, 1);
check(
  "ese padre es la <article> pizza-card",
  (tarjetaDePepperoni[0] as Element).getAttribute("data-testid"),
  "pizza-card-101",
);

// ------------------------------------------------------------
// 4) Cuándo elegir cuál: la regla práctica del curso.
// ------------------------------------------------------------
// Usa CSS por defecto (más corto y rápido). Cambia a XPath SOLO cuando
// necesites: (a) texto del elemento, (b) navegar hacia arriba/atrás, o
// (c) ejes que CSS no tiene. No es "XPath vs CSS"; es "la herramienta que
// el árbol te pide". Aquí el target solo es alcanzable leyendo texto:
titulo("El caso donde XPath es la única vía limpia");
const precioDeLaTarjetaConPepperoni = $x(
  "//h3[text()='Pepperoni']/../span[contains(@class,'price')]",
);
check(
  "subir al padre y bajar al precio de Pepperoni",
  text(precioDeLaTarjetaConPepperoni[0]),
  "$189.00",
);
