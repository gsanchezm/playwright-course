// ============================================================
// Mini-clase 1.4: querySelector vs querySelectorAll
// ============================================================
// Analogía: dos preguntas distintas sobre el mismo árbol.
//   - querySelector(sel)    → "dame EL primero" (assert de elemento ÚNICO).
//   - querySelectorAll(sel) → "dame TODOS" (una COLECCIÓN para iterar/contar).
// Confundirlos es un bug clásico de QA: pides "el botón" cuando hay 18, o
// cuentas sobre algo que devolvió un solo nodo.
// ============================================================
import { document, $$, countCss, text } from "../helpers/dom";
import { check, titulo } from "../helpers/check";
console.log("\n===== 1.4 querySelector vs querySelectorAll =====");

// ------------------------------------------------------------
// querySelector: UNO (el primero en orden de documento) o null.
// ------------------------------------------------------------
// Devuelve el PRIMER elemento que matchea, recorriendo el árbol de arriba
// abajo. Si nada matchea, devuelve null (no un array vacío).
titulo("querySelector → el primero, o null");

const primeraCard = document.querySelector(".pizza-card");
check("querySelector('.pizza-card') no es null", primeraCard !== null, true);
// El primero en orden de documento es la tarjeta 101 (Pepperoni).
check("el primer .pizza-card es la 101 (Pepperoni)",
  text(primeraCard!.querySelector("h3")), "Pepperoni");

// Cuando NADA matchea, es null (no truena, pero hay que checarlo antes de usarlo).
check("querySelector de algo inexistente → null",
  document.querySelector(".no-existe"), null);

// ------------------------------------------------------------
// querySelectorAll: TODOS (una colección estática).
// ------------------------------------------------------------
// Devuelve un NodeList con todos los matches. Aunque haya 0, es una lista
// vacía, NO null. En el curso usamos $$() que lo convierte a array.
titulo("querySelectorAll → todos (colección)");

const todas = $$(".pizza-card");
check("querySelectorAll('.pizza-card') → 4 elementos", todas.length, 4);
check("countCss('.pizza-card') cuenta lo mismo", countCss(".pizza-card"), 4);

// La forma idiomática de "el primero" desde la colección: índice [0].
check("$$('.pizza-card')[0] es la misma primera tarjeta",
  text(todas[0].querySelector("h3")), "Pepperoni");

// Sin matches → array vacío (length 0), nunca null. Por eso countCss da 0 limpio.
check("querySelectorAll de algo inexistente → 0 (no null)", countCss(".no-existe"), 0);

// ------------------------------------------------------------
// El NodeList es ESTÁTICO: es una FOTO del árbol al momento de la consulta.
// ------------------------------------------------------------
// A diferencia de getElementsByClassName (que es "vivo"), querySelectorAll
// devuelve un snapshot: si después cambias el DOM, esa lista NO se actualiza.
// Lo demostramos en un sub-árbol DESECHABLE (creado aparte) para no tocar el
// fixture que cuentan las demás mini-clases.
titulo("El NodeList es una foto estática");

const caja = document.createElement("div"); // nodo suelto, fuera del documento
caja.innerHTML = '<span class="item">a</span><span class="item">b</span>';
const foto = caja.querySelectorAll(".item"); // foto: 2 elementos
check("la foto inicial tiene 2 .item", foto.length, 2);

// Agregamos un tercer .item DESPUÉS de tomar la foto.
caja.innerHTML += '<span class="item">c</span>';
// La foto sigue mostrando 2: no se enteró del cambio (es estática).
check("la foto vieja sigue en 2 (no se actualizó)", foto.length, 2);
// Una consulta NUEVA sí ve los 3: refleja el estado actual del árbol.
check("una consulta nueva ve 3 .item", caja.querySelectorAll(".item").length, 3);
