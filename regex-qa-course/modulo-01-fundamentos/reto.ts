// ============================================================
// 🚩 Reto QA — Módulo 1: "El primer check"
// ============================================================
// Instrucciones:
//   1. Tu tarea: validar con `.test()` que el nombre de un ambiente de
//      ejecución sea EXACTAMENTE uno de estos tres: QA, UAT o PROD.
//      Nada más: ni "qa" en minúsculas, ni "PRODUCTION", ni "PROD " con un
//      espacio sobrante. Solo los tres exactos.
//   2. Completa la regex marcada con `// TODO:` (ahora es /CAMBIAME/, que no
//      matchea nada útil). Pistas conceptuales (NO la respuesta):
//        - Necesitas ANCLAR el patrón al inicio y al final para exigir que el
//          string COMPLETO sea el ambiente (si no, "PRODUCTION" colaría por
//          contener "PROD"). ¿Qué metacaracteres anclan inicio y fin? (1.5)
//        - Necesitas ofrecer VARIAS opciones exactas. ¿Qué metacaracter da
//          "esto O aquello"? (lo viste en 1.5 con @smoke|regression)
//        - Recuerda que las regex son case-sensitive por defecto (1.1): "qa"
//          NO debe colar.
//   3. Ejecuta:  pnpm tsx modulo-01-fundamentos/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes la regex: con /CAMBIAME/, los
//   3 ambientes VÁLIDOS saldrán ❌ (no matchean) y los 6 INVÁLIDOS saldrán ✅
//   (correctamente NO matchean). Cuando resuelvas el reto, TODAS las filas
//   deben quedar en ✅: los válidos matchean y los inválidos NO.
// ============================================================
import { checkMatch } from "../helpers/check";
import { AMBIENTES_VALIDOS, AMBIENTES_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 1: El primer check =====");

// ------------------------------------------------------------
// TODO: reemplaza /CAMBIAME/ por una regex que matchee EXACTAMENTE
//       "QA", "UAT" o "PROD" (y nada más).
// ------------------------------------------------------------
const reAmbiente = /CAMBIAME/; // TODO: completar (ancla inicio/fin + alternancia exacta)

// ------------------------------------------------------------
// Casos de prueba (NO los toques): cada VÁLIDO debe matchear (true) y cada
// INVÁLIDO debe ser rechazado (false). Los recorremos con checkMatch().
// ------------------------------------------------------------
console.log("\n· Ambientes que SÍ deben pasar:");
for (const amb of AMBIENTES_VALIDOS) {
  checkMatch(reAmbiente, amb, true);
}

console.log("\n· Ambientes que NO deben pasar:");
for (const amb of AMBIENTES_INVALIDOS) {
  checkMatch(reAmbiente, amb, false);
}

console.log(
  "\nObjetivo: cuando tu regex esté lista, las 9 filas deben mostrar ✅ " +
    "(los 3 válidos matchean y los 6 inválidos NO)."
);
