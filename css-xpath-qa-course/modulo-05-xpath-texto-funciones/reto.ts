// ============================================================
// 🚩 Reto QA — Módulo 5: "El precio que el text() crudo no ve"
// ============================================================
// Instrucciones:
//   1. Tu tarea: escribir UN XPath que seleccione EXACTAMENTE el precio
//      "$189.00" de la card de Pepperoni (data-testid="price-101").
//      El obstáculo: ese <span> trae whitespace invisible alrededor del texto,
//      así que `text()="$189.00"` da 0 (NO matchea). Debes usar
//      normalize-space() para limpiar el texto antes de comparar.
//   2. Reemplaza el RETO_XPATH = "CAMBIAME" por tu expresión. Ahora "CAMBIAME"
//      se evalúa como un paso de hijo inexistente → 0 nodos.
//   3. Ejecuta:  pnpm tsx modulo-05-xpath-texto-funciones/reto.ts
//
//   Es ESPERADO que veas ❌ en la primera fila hasta resolverlo: con
//   "CAMBIAME", tu XPath captura 0 nodos en vez de 1. La SEGUNDA fila (el
//   contraste: el text() crudo da 0) sale ✅ desde el inicio, porque demuestra
//   precisamente POR QUÉ necesitas normalize-space(). Cuando tu XPath sea
//   correcto, AMBAS filas quedan en ✅.
//
//   Pistas conceptuales (NO la respuesta):
//     - Apunta al <span data-testid="price-101"> (su testid es estable).
//     - Compara su texto LIMPIO contra "$189.00": ¿qué función recorta y
//       colapsa el whitespace del string-value? (la viste en 5.3)
// ============================================================
import { countXpath } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 5: El precio que el text() crudo no ve =====");

// ------------------------------------------------------------
// TODO: reemplaza "CAMBIAME" por un XPath con normalize-space() que
//       seleccione EXACTAMENTE el precio "$189.00" (debe dar 1 nodo).
// ------------------------------------------------------------
const RETO_XPATH = "CAMBIAME"; // TODO: apunta a price-101 y normaliza su texto

// ------------------------------------------------------------
// Verificación (NO la toques): tu XPath debe capturar EXACTAMENTE 1 nodo.
// ------------------------------------------------------------
check("Tu XPath captura exactamente el precio $189.00 (1 nodo)", countXpath(RETO_XPATH), 1);

// ------------------------------------------------------------
// Contraste (NO lo toques): el text() CRUDO falla por el whitespace → 0.
// Esta fila sale ✅ siempre: es la PRUEBA de que necesitas normalize-space().
// ------------------------------------------------------------
check(
  'Contraste: text()="$189.00" crudo NO matchea (whitespace invisible) → 0',
  countXpath('//span[@data-testid="price-101"][text()="$189.00"]'),
  0,
);

console.log(
  "\nObjetivo: cuando tu XPath use normalize-space(), la primera fila debe " +
    "mostrar ✅ (1 nodo). La segunda fila ya está en ✅ y explica el porqué.",
);
