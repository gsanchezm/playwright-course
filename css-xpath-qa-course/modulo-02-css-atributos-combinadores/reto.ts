// ============================================================
// 🚩 Reto QA — Módulo 2: "El selector de contrato"
// ============================================================
// Instrucciones:
//   1. Tu tarea: escribir DOS selectores de atributo que enganchen
//      EXACTAMENTE el conteo pedido, usando hooks ESTABLES (data-*), no
//      clases visuales ni posiciones:
//        a) RETO_SOCIAL: capturar los 2 enlaces sociales del footer
//           (Twitter + Instagram). Pista: ambos llevan data-social y la
//           clase footer-link--social, pero los OTROS 3 footer-links NO.
//        b) RETO_ADD:    capturar los 4 botones add-to-cart por su testid
//           DINÁMICO (add-to-cart-101..104). Pista: el "=" exacto solo toma
//           uno; necesitas un OPERADOR de prefijo.
//   2. Reemplaza cada `[data-CAMBIAME]` por tu selector. Ahora no matchean.
//   3. Ejecuta:  pnpm tsx modulo-02-css-atributos-combinadores/reto.ts
//
//   Es ESPERADO que veas ❌ hasta resolverlo: con [data-CAMBIAME] ambos
//   conteos dan 0. Cuando tus selectores sean correctos, las 2 filas deben
//   quedar en ✅ (2 sociales y 4 botones add-to-cart).
// ============================================================
import { countCss } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 2: El selector de contrato =====");

// ------------------------------------------------------------
// TODO (a): reemplaza [data-CAMBIAME] por un selector de atributo que
//           capture EXACTAMENTE los 2 enlaces sociales del footer.
// ------------------------------------------------------------
const RETO_SOCIAL = "[data-CAMBIAME]"; // TODO: usa data-social (o footer-link--social)

// ------------------------------------------------------------
// TODO (b): reemplaza [data-CAMBIAME] por un selector que capture los 4
//           botones add-to-cart por su testid dinámico (operador de prefijo).
// ------------------------------------------------------------
const RETO_ADD = "[data-CAMBIAME]"; // TODO: usa data-testid con ^= (prefijo)

// Verificación (NO la toques): el conteo debe ser EXACTO.
check("Selector de sociales captura exactamente 2", countCss(RETO_SOCIAL), 2);
check("Selector de add-to-cart captura exactamente 4", countCss(RETO_ADD), 4);

console.log(
  "\nObjetivo: cuando tus selectores estén listos, las 2 filas deben mostrar " +
    "✅ (2 enlaces sociales y 4 botones add-to-cart)."
);
