// ============================================================
// 🚩 Reto QA — Módulo 7: "De frágil a resiliente"
// ============================================================
// Contexto:
//   Heredaste un test con un selector FRÁGIL: una clase hash `.css-9z8y7x`
//   generada por el bundler. Hoy apunta al formulario de login, pero cambiará
//   en el próximo build y romperá la prueba. Tu tarea es reescribirlo a un
//   selector RESILIENTE que apunte EXACTAMENTE al mismo único nodo, sin
//   depender de la clase hash.
//
// Instrucciones:
//   1. NO toques SELECTOR_FRAGIL (es el punto de partida heredado).
//   2. Reemplaza "CAMBIAME" en SELECTOR_RESILIENTE por un selector CSS que:
//        - apunte al MISMO nodo que SELECTOR_FRAGIL (1 solo elemento),
//        - NO contenga la subcadena "css-" (nada de clases hash),
//        - use un hook estable (pista: el formulario tiene un data-testid).
//   3. Ejecuta:  pnpm exec tsx modulo-07-css-vs-xpath-resilientes/reto.ts
//
//   Es ESPERADO ver ❌ con "CAMBIAME" (querySelectorAll no encuentra nada →
//   0 nodos, distinto nodo, y el conteo no cuadra). Cuando lo resuelvas, las
//   3 filas deben quedar en ✅.
// ============================================================
import { $$, countCss } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 7: De frágil a resiliente =====");

// Selector heredado, FRÁGIL (NO lo toques): clase hash del bundler.
const SELECTOR_FRAGIL = ".css-9z8y7x";

// TODO: reescríbelo a un selector RESILIENTE equivalente (mismo nodo, sin "css-").
const SELECTOR_RESILIENTE = "CAMBIAME"; // TODO: usar el data-testid del formulario de login

// ------------------------------------------------------------
// Validación (NO la toques): el resiliente debe apuntar al MISMO único nodo
// que el frágil, y NO puede contener una clase hash.
// ------------------------------------------------------------
const nodoFragil = $$(SELECTOR_FRAGIL)[0] ?? null;
const nodoResiliente = $$(SELECTOR_RESILIENTE)[0] ?? null;

check(
  "el selector resiliente apunta a EXACTAMENTE 1 nodo",
  countCss(SELECTOR_RESILIENTE),
  1,
);
check(
  "apunta al MISMO nodo que el selector frágil",
  nodoResiliente !== null && nodoResiliente === nodoFragil,
  true,
);
check(
  "el selector resiliente NO usa una clase hash 'css-'",
  SELECTOR_RESILIENTE.includes("css-"),
  false,
);

console.log(
  "\nObjetivo: cuando tu selector esté listo, las 3 filas deben mostrar ✅ " +
    "(mismo nodo, exactamente 1, y sin clases hash).",
);
