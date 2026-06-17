// ============================================================
// 🚩 Reto QA — Modulo 8: "El selector de elite"
// ============================================================
// Instrucciones:
//   1. Tu tarea: aislar el boton "agregar al carrito" de la UNICA pizza SIN
//      GLUTEN que ademas esta DISPONIBLE (no agotada). Debe matchear 1 solo
//      elemento: el boton add-to-cart-102 (Cuatro Quesos).
//   2. Tienes DOS huecos marcados con `// TODO:`. Completa AL MENOS uno
//      (idealmente ambos) para que su check() quede en ✅:
//        - selectorCss  : usa composicion CSS (:has() para mirar adentro +
//                          :not() para excluir lo agotado) partiendo de un
//                          hook de contenido estable.
//        - exprXpath    : parte de un ANCLA DE TEXTO y sube/baja por ejes con
//                          un predicado multiple (and / not).
//      Ahora ambos apuntan a CAMBIAME, que matchea 0 elementos -> ❌.
//   3. Ejecuta:  pnpm tsx modulo-08-tecnicas-1-percent/reto.ts
//
//   Es ESPERADO que veas ❌ hasta resolverlo. Cuando ambos selectores aislen
//   el boton correcto, las 4 filas (2 conteos + 2 testids) quedan en ✅.
//
//   Pistas conceptuales (NO la respuesta):
//     · "sin gluten" tiene un hook propio en la tarjeta (un badge). Anclate ahi.
//     · "agotada" se marca en el <article> con un atributo data-* y la clase
//       is-soldout; excluyela con :not([...]) (CSS) o not(@...) (XPath).
//     · En XPath puedes anclar en el TEXTO del badge con normalize-space() y
//       subir con ancestor::article, luego bajar al button[contains(@class,...)].
// ============================================================
import { countCss, countXpath, $$, $x, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 8: El selector de elite =====");

// ------------------------------------------------------------
// TODO (CSS): compon un selector que aisle el add-to-cart de la pizza sin
//             gluten DISPONIBLE. Reemplaza "CAMBIAME".
// ------------------------------------------------------------
const selectorCss = "CAMBIAME"; // TODO: :has(.badge--...) + :not([data-...]) + .add-to-cart

// ------------------------------------------------------------
// TODO (XPath): mismo objetivo desde un ANCLA DE TEXTO + predicado multiple.
//               Reemplaza "//CAMBIAME".
// ------------------------------------------------------------
const exprXpath = "//CAMBIAME"; // TODO: //span[normalize-space()='...']/ancestor::article//button[...]

// ------------------------------------------------------------
// Verificacion (NO la toques): cada selector debe matchear EXACTAMENTE el
// boton add-to-cart-102 y nada mas.
// ------------------------------------------------------------
console.log("\n· Solucion CSS:");
check("selectorCss matchea 1 elemento", countCss(selectorCss), 1);
check(
  "selectorCss apunta a add-to-cart-102",
  attr($$(selectorCss)[0], "data-testid"),
  "add-to-cart-102",
);

console.log("\n· Solucion XPath:");
check("exprXpath matchea 1 nodo", countXpath(exprXpath), 1);
check(
  "exprXpath apunta a add-to-cart-102",
  attr($x(exprXpath)[0] as Element, "data-testid"),
  "add-to-cart-102",
);

console.log(
  "\nObjetivo: cuando tus selectores esten listos, las 4 filas deben mostrar ✅ " +
    "(cada uno aisla el boton add-to-cart-102 de la pizza sin gluten disponible).",
);
