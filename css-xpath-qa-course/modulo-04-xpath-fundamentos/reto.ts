// ============================================================
// 🚩 Reto QA — Módulo 4: "Ancla por hook de prueba"
// ============================================================
// Contexto:
//   En QA, el ancla más estable casi nunca es la clase visual: es el
//   data-testid que el equipo puso a propósito. Tu misión es escribir UN
//   XPath con predicado de atributo (@data-testid) que seleccione EXACTAMENTE
//   uno de estos dos targets (elige uno):
//     · el botón "Sign In"  →  @data-testid='login-button-desktop'
//     · la card AGOTADA     →  @data-testid='pizza-card-103'
//
// Instrucciones:
//   1. Reemplaza el placeholder "CAMBIAME" por tu XPath. Debe usar un
//      predicado de atributo [@data-testid='...'] y matchear EXACTAMENTE 1
//      nodo. Pistas:
//        - El esqueleto es  //ETIQUETA[@data-testid='VALOR']
//        - Para el botón:  ETIQUETA = button,  VALOR = login-button-desktop
//        - Para la card:   ETIQUETA = article (o *),  VALOR = pizza-card-103
//        - Recuerda 4.4: con @class fallarías por el multi-clase; @data-testid
//          es exacto y único.
//   2. Ejecuta:
//        pnpm -C css-xpath-qa-course exec tsx modulo-04-xpath-fundamentos/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes el XPath: "CAMBIAME" no es una
//   expresión válida de atributo y devuelve 0 matches. Cuando lo resuelvas, el
//   check debe quedar en ✅ (exactamente 1 nodo).
//
//   ⭐ Bonus (en un navegador, NO aquí): abre la app real, abre DevTools y
//   ejecuta en la consola  $x("(//li)[1]")  y luego  $x("//li[1]").
//   Observa que (//li)[1] es "el primer <li> GLOBAL" mientras //li[1] es "el
//   primero de CADA padre". jsdom NO reproduce los paréntesis; el navegador SÍ.
// ============================================================
import { countXpath } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 4: Ancla por hook de prueba =====");

// ------------------------------------------------------------
// TODO: reemplaza "CAMBIAME" por un XPath con predicado @data-testid que
//       seleccione EXACTAMENTE 1 nodo (el botón Sign In o la card agotada).
// ------------------------------------------------------------
const miXpath = "CAMBIAME"; // TODO: p.ej. //button[@data-testid='...']  ó  //*[@data-testid='...']

// ------------------------------------------------------------
// Caso de prueba (NO lo toques): tu XPath debe matchear exactamente 1 nodo.
// ------------------------------------------------------------
check(`mi XPath selecciona exactamente 1 nodo  ·  ${miXpath}`, countXpath(miXpath), 1);

console.log(
  "\nObjetivo: cuando tu XPath esté listo, el check muestra ✅ (1 nodo). " +
    'Con "CAMBIAME" verás ❌ porque devuelve 0.',
);
