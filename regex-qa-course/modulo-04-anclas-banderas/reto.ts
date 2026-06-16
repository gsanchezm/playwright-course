// ============================================================
// 🚩 Reto QA — Módulo 4: "Ancla el cupón"
// ============================================================
// Contexto:
//   OmniPizza acepta cupones con formato EXACTO: 3 letras MAYÚSCULAS
//   seguidas de 3 dígitos. Ejemplos válidos: "ABC123", "XYZ789".
//   El bug actual: el validador acepta "ABC123extra" porque encuentra
//   "ABC123" DENTRO del texto (no está anclado). Tu misión: anclarlo.
//
// Instrucciones:
//   1. Completa la regex marcada con `// TODO:` (ahora es /CAMBIAME/, que
//      no matchea nada útil). Debe quedar ANCLADA con ^ ... $ para exigir
//      que el cupón sea EXACTAMENTE 3 letras may. + 3 dígitos y NADA más.
//      Pistas:
//        - Letras mayúsculas: [A-Z]   (cuántas: {3})
//        - Dígitos: \d o [0-9]        (cuántos: {3})
//        - Recuerda 4.1: sin ^...$ "ABC123extra" pasa por falso positivo.
//   2. Ejecuta: pnpm tsx modulo-04-anclas-banderas/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes la regex. El objetivo:
//   que TODOS los CUPONES_VALIDOS pasen y TODOS los CUPONES_INVALIDOS
//   (incluido "ABC123extra") sean rechazados.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { CUPONES_VALIDOS, CUPONES_INVALIDOS } from "../data/samples";

console.log("\n===== 🚩 Reto 4: Ancla el cupón =====");

// ------------------------------------------------------------
// TODO: regex de cupón ANCLADA — 3 letras mayúsculas + 3 dígitos exactos.
//   El placeholder /CAMBIAME/ hace que los válidos fallen (❌) a propósito.
// ------------------------------------------------------------
const reCupon = /CAMBIAME/; // TODO: p.ej. /^[ ]{ }[ ]{ }$/  (3 mayúsculas + 3 dígitos)

// ------------------------------------------------------------
// Casos de prueba. NO necesitas tocar esta parte: solo completa reCupon.
// ------------------------------------------------------------
console.log("--- Cupones que DEBEN pasar (válidos) ---");
for (const cupon of CUPONES_VALIDOS) {
  checkMatch(reCupon, cupon, true); // ✅ cuando reCupon esté bien
}

console.log("--- Cupones que DEBEN ser rechazados (inválidos) ---");
for (const cupon of CUPONES_INVALIDOS) {
  checkMatch(reCupon, cupon, false); // el caso estrella: "ABC123extra"
}

// Pista de auto-evaluación: cuando termines, este conteo debería cuadrar.
// (Mientras uses /CAMBIAME/, verás 0 válidos reconocidos.)
const reconocidos = CUPONES_VALIDOS.filter((c) => {
  const limpia = new RegExp(reCupon.source, reCupon.flags.replace("g", "").replace("y", ""));
  return limpia.test(c);
}).length;
check(
  `cupones válidos reconocidos (meta: ${CUPONES_VALIDOS.length})`,
  reconocidos,
  CUPONES_VALIDOS.length
);
// ☝️ Este check sale ❌ con /CAMBIAME/ y se vuelve ✅ cuando ancles bien.
