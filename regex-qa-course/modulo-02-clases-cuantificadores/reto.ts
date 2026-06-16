// ============================================================
// 🚩 Reto QA — Módulo 2: "Valida el SKU"
// ============================================================
// Instrucciones:
//   1. OmniPizza identifica cada pizza con un SKU con formato PZ-####:
//      DOS letras MAYÚSCULAS, un guion, y CUATRO dígitos. Ejemplos válidos:
//      "PZ-1234", "PZ-0001". Ejemplos inválidos: "pz-1234" (minúsculas),
//      "PZA-1234" (3 letras), "PZ-12345" (5 dígitos), "PZ1234" (sin guion).
//   2. Completa la regex marcada con `// TODO:` (ahora es /CAMBIAME/, que
//      no matchea nada útil). Debe quedar ANCLADA con ^ ... $ y combinar:
//        - una CLASE de caracteres para las letras (¿mayúsculas?),
//        - un CUANTIFICADOR exacto {n} para cuántas letras y cuántos dígitos,
//        - el guion literal en medio.
//      Pista de estructura:  ^[ ]{ }-[ ]{ }$
//   3. Ejecuta:  pnpm tsx modulo-02-clases-cuantificadores/reto.ts
//
//   Es ESPERADO que veas ❌ en los SKU VÁLIDOS hasta que completes la regex
//   (porque /CAMBIAME/ no los matchea). Curiosamente los INVÁLIDOS saldrán
//   ✅ desde el inicio: como esperamos que NO coincidan y /CAMBIAME/ tampoco
//   coincide, el check ya pasa. El objetivo real: que tu regex haga que
//   AMBOS bloques queden en ✅ (válidos matchean, inválidos NO).
// ============================================================
import { checkMatch } from "../helpers/check";
import { SKUS_VALIDOS, SKUS_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 2: Valida el SKU de OmniPizza (PZ-####) =====");

// ------------------------------------------------------------
// TODO: completa esta regex para el formato PZ-#### (2 letras MAYÚS,
//       guion, 4 dígitos), ANCLADA con ^ ... $.
// ------------------------------------------------------------
const reSku = /CAMBIAME/; // TODO: p.ej. ^[ ]{ }-[ ]{ }$  (rellena clase y cuantificadores)

// ------------------------------------------------------------
// Bucle de validación data-driven (NO necesitas tocar esto).
// Usa los datos compartidos del contrato: SKUS_VALIDOS / SKUS_INVALIDOS.
// ------------------------------------------------------------
console.log("--- SKU que DEBEN ser válidos ---");
for (const sku of SKUS_VALIDOS) checkMatch(reSku, sku, true);

console.log("--- SKU que DEBEN ser inválidos ---");
for (const sku of SKUS_INVALIDOS) checkMatch(reSku, sku, false);

console.log(
  "\nPista: cuando tu regex esté bien, las DOS secciones mostrarán solo ✅."
);
