// ============================================================
// 🚩 Reto QA — Modulo 6: "Ancla y navega"
// ============================================================
// Instrucciones:
//   1. Tu tarea: escribir UN XPath que, anclando en el NOMBRE de la pizza
//      "Cuatro Quesos", navegue POR EJE hasta su <article> contenedor (la
//      tarjeta completa). Debe matchear EXACTAMENTE 1 elemento: la tarjeta
//      pizza-card-102.
//   2. Completa la expresion marcada con `// TODO:` (ahora es `//CAMBIAME`,
//      un XPath valido que matchea 0 elementos). Pistas conceptuales (NO la
//      respuesta):
//        - Ancla por el TEXTO LIMPIO del nombre. ¿Que funcion limpia el
//          whitespace para comparar el texto del elemento? (6.2)
//        - Desde ese <h3>, ¿que eje SUBE hasta cualquier contenedor del tipo
//          que buscas? (6.2: parent es un nivel; ancestor es cualquiera.)
//        - El contenedor accionable es la TARJETA: un <article>.
//   3. Ejecuta:  pnpm tsx modulo-06-xpath-ejes/reto.ts
//
//   BONUS (opcional): cambia el destino del salto para llegar al BOTON
//   add-to-cart de esa tarjeta en vez del article.
//
//   Es ESPERADO que veas ❌ hasta que completes el XPath: con `//CAMBIAME`
//   la expresion matchea 0 elementos y el check de "= 1 tarjeta" sale ❌.
//   Cuando lo resuelvas, las 2 filas deben quedar en ✅.
// ============================================================
import { countXpath, $x, attr } from "../helpers/dom";
import { check } from "../helpers/check";

console.log("\n===== 🚩 Reto 6: Ancla y navega =====");

// ------------------------------------------------------------
// TODO: reemplaza `//CAMBIAME` por un XPath que ancle en el nombre
//       "Cuatro Quesos" y suba por eje hasta su <article> (la tarjeta 102).
// ------------------------------------------------------------
const xpathTarjeta = `//CAMBIAME`; // TODO: completar (ancla por texto + eje hacia arriba)

// ------------------------------------------------------------
// Casos de prueba (NO los toques): debe matchear EXACTAMENTE la tarjeta 102.
// ------------------------------------------------------------
check("matchea EXACTAMENTE 1 elemento", countXpath(xpathTarjeta), 1);
const encontrado = $x(xpathTarjeta)[0] as Element | undefined;
check("ese elemento es la tarjeta pizza-card-102", attr(encontrado, "data-testid"), "pizza-card-102");

console.log(
  "\nObjetivo: cuando tu XPath este listo, las 2 filas deben mostrar ✅ " +
    "(matchea 1 elemento y es la tarjeta 102).",
);
