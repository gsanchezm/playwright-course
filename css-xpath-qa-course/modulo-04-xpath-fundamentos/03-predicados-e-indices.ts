// ============================================================
// Mini-clase 4.3: Predicados [ ] e índices 1-BASED
// ============================================================
// Analogía QA: un predicado [ ] es la cláusula WHERE de tu locator: filtra
// el conjunto de nodos a los que cumplen una condición. Y los índices de
// XPath son 1-BASED (el primero es [1], no [0]): si vienes de arreglos en
// código, este off-by-one es el error #1. Peor aún: //li[1] NO es "el primer
// <li> del documento" — es "el primer <li> de CADA padre". Confundir esos
// dos es el bug de indexación más caro de XPath.
// ============================================================
import { countXpath, $x, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 4.3 Predicados e índices =====");

// ------------------------------------------------------------
// 1) Predicado [ ] = filtro (la cláusula WHERE del locator).
// ------------------------------------------------------------
// //article[@data-category='popular'] = "de todos los <article>, quédate con
// los que tienen data-category='popular'". El [ ] reduce el conjunto.
titulo("[ ] filtra: solo los que cumplen la condición");
check("//article (sin filtro) = 4", countXpath("//article"), 4);
check("//article[@data-category='popular'] = 1", countXpath("//article[@data-category='popular']"), 1);

// ------------------------------------------------------------
// 2) Índices: 1-BASED. [1] es el primero, NO [0].
// ------------------------------------------------------------
// Un número en el predicado es un índice POSICIONAL. //li[1] = el primer
// <li>. Ojo: NO existe [0] (devuelve vacío). last() es el último.
titulo("Índices 1-based: [1] primero, last() último");
check("//li = 2 (las 2 líneas del carrito)", countXpath("//li"), 2);
check("//li[1] = 1 (existe un primer li)", countXpath("//li[1]"), 1);
check("//li[0] = 0 (NO hay índice cero en XPath)", countXpath("//li[0]"), 0);
check("//li[last()] = 1 (el último li)", countXpath("//li[last()]"), 1);
// Y son nodos DISTINTOS: el primero es Pepperoni, el último Cuatro Quesos.
check("//li[1] es la línea de Pepperoni", text($x("//li[1]/span[@class='line-name']")[0]), "Pepperoni");
check("//li[last()] es la línea de Cuatro Quesos", text($x("//li[last()]/span[@class='line-name']")[0]), "Cuatro Quesos");

// ------------------------------------------------------------
// 3) La trampa real: //x[1] = "el primero de CADA padre".
// ------------------------------------------------------------
// //li[1] dio 1 SOLO porque los dos <li> comparten un único <ul>. El número
// en //x[n] se aplica POR PADRE, no globalmente. Para verlo de verdad usa
// los <label>: hay 6 en total (3 en toppings + 3 en payment), repartidos en
// DOS <fieldset>. //label[1] NO es "el primer label"; es "el primer label de
// cada fieldset" → DOS nodos (uno por fieldset).
titulo("//label[1] = el primero de CADA padre (¡dos fieldsets!)");
check("//label = 6 (3 toppings + 3 payment)", countXpath("//label"), 6);
check("//label[1] = 2 (el 1ro de cada uno de los 2 fieldsets)", countXpath("//label[1]"), 2);
check("//label[last()] = 2 (el último de cada fieldset)", countXpath("//label[last()]"), 2);

// ------------------------------------------------------------
// 4) ⚠️ DIVERGENCIA: (//x)[n] — "el n-ésimo GLOBAL" — y jsdom.
// ------------------------------------------------------------
// Para decir "el PRIMERO de todo el documento" (no por-padre) se ENVUELVE
// la búsqueda en paréntesis y luego se indexa: (//label)[1] = "primer label
// global" = UN nodo. ESA es la diferencia entre //label[1] (por-padre, 2) y
// (//label)[1] (global, 1).
//
// PERO nuestro motor offline (jsdom) NO implementa bien los paréntesis: los
// ignora y evalúa (//label)[1] como //label[1]. Por eso NO hacemos check()
// de formas con paréntesis: en jsdom mienten. La VERDAD del comportamiento
// la da el navegador (DevTools $x), Playwright (xpath=) o Selenium.
//
// Demostración (NO es un check — solo exhibe el bug del aproximador):
console.log(
  "   (jsdom) (//label)[1] devuelve:",
  countXpath("(//label)[1]"),
  "→ en un navegador real sería 1 (el primer label GLOBAL).",
);
console.log(
  "   (jsdom) (//li)[1] devuelve:",
  countXpath("(//li)[1]"),
  "→ aquí coincide en 1 solo porque hay un único <ul>; no te fíes del azar.",
);
console.log(
  "   ⚠️ Regla del curso: jsdom = aproximador de SINTAXIS; navegador/Playwright = VERDAD del comportamiento.",
);
