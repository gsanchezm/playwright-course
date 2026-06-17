// ============================================================
// 🚩 Reto QA — Módulo 1: "Apunta a las 4 pizzas"
// ============================================================
// Instrucciones:
//   1. Tu tarea: escribe un selector CSS que encuentre EXACTAMENTE las 4
//      tarjetas de pizza del catálogo de OmniPizza. Ni una más, ni una menos.
//      Pistas conceptuales (NO la respuesta):
//        - ¿Qué CLASE comparten las 4 tarjetas? (la viste en 1.2) Esa clase
//          es tu mejor punto de partida.
//        - El primer match debe ser un <article> que CONTENGA su <h3> con el
//          nombre de la pizza (así sabes que apuntaste a la tarjeta entera,
//          no a un trozo suelto).
//        - Evita * o selectores demasiado amplios: queremos 4 EXACTAS.
//   2. Reemplaza el selector marcado con `// TODO:` (ahora es ".CAMBIAME",
//      que no matchea nada).
//   3. Ejecuta:  pnpm tsx modulo-01-css-fundamentos/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes el selector: con ".CAMBIAME"
//   el conteo da 0 (no 4) y no hay un primer <article>, así que las dos filas
//   salen ❌. Cuando resuelvas el reto, AMBAS deben quedar en ✅.
// ============================================================
import { $$, countCss, text } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 1: Apunta a las 4 pizzas =====");

// ------------------------------------------------------------
// TODO: reemplaza ".CAMBIAME" por un selector CSS que matchee EXACTAMENTE
//       las 4 tarjetas de pizza.
// ------------------------------------------------------------
const SELECTOR = ".CAMBIAME"; // TODO: completar (¿qué clase comparten las cards?)

// ------------------------------------------------------------
// Validaciones (NO las toques): el selector debe encontrar 4 elementos y el
// primero debe ser un <article> que contenga un <h3>.
// ------------------------------------------------------------
const matches = $$(SELECTOR);
const primero = matches[0];

check("el selector encuentra EXACTAMENTE 4 tarjetas", countCss(SELECTOR), 4);
check(
  "el primer match es un <article> con su <h3> de nombre",
  primero?.tagName === "ARTICLE" && text(primero.querySelector("h3")).length > 0,
  true,
);

console.log(
  "\nObjetivo: cuando tu selector esté listo, las 2 filas deben mostrar ✅ " +
    "(4 tarjetas y la primera es un <article> con <h3>).",
);
