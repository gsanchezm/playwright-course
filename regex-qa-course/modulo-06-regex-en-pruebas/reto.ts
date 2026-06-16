// ============================================================
// 🚩 Reto QA — Módulo 6: "Validador data-driven de lote multi-mercado"
// ============================================================
// Instrucciones:
//   1. OmniPizza recibe un LOTE de pedidos crudos de 4 mercados (MX, US,
//      CH, JP). Algunos están bien, otros traen basura. Tu trabajo es
//      construir el validador que separe los buenos de los malos.
//   2. Completa CADA regex marcada con `// TODO:` (ahora son /CAMBIAME/,
//      que no matchea nada). Debe quedar ANCLADA con ^ ... $ y ser
//      específica por campo (email, teléfono por mercado, SKU, total).
//      Pistas:
//        - El total es un número con 2 decimales: ^\d+\.\d{2}$
//        - El mercado debe ser uno de MX/US/CH/JP exactamente.
//        - Reusa lo aprendido en 6.1 (emails, teléfonos por mercado, SKU).
//   3. Ejecuta: pnpm tsx modulo-06-regex-en-pruebas/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes las regex. El objetivo:
//   que SOLO los pedidos genuinamente válidos pasen TODAS sus validaciones.
//   (En LOTE_PEDIDOS, razona cuáles deberían ser válidos: los de MX y US.)
// ============================================================
import { checkMatch } from "../helpers/check";
import { LOTE_PEDIDOS, MERCADOS, type Mercado } from "../data/samples";

console.log("\n===== 🚩 Reto 6: Validador data-driven de lote multi-mercado =====");

// ------------------------------------------------------------
// TODO (1): mercado válido — debe ser exactamente MX, US, CH o JP.
// ------------------------------------------------------------
const reMercado = /CAMBIAME/; // TODO: p.ej. /^(MX|US|CH|JP)$/

// ------------------------------------------------------------
// TODO (2): email válido (reusa la idea de 6.1: [^@\s]+@... anclado).
// ------------------------------------------------------------
const reEmail = /CAMBIAME/; // TODO: completar regex de email

// ------------------------------------------------------------
// TODO (3): teléfono válido POR MERCADO. Cada mercado tiene su formato.
//   MX: +52 55 1234 5678   US: +1 (415) 555-0123
//   CH: +41 44 668 18 00   JP: +81 3-1234-5678
// ------------------------------------------------------------
const reTelefonoPorMercado: Record<Mercado, RegExp> = {
  MX: /CAMBIAME/, // TODO
  US: /CAMBIAME/, // TODO
  CH: /CAMBIAME/, // TODO
  JP: /CAMBIAME/, // TODO
};

// ------------------------------------------------------------
// TODO (4): SKU de pizza PZ-#### (2 letras may. + guion + 4 dígitos).
// ------------------------------------------------------------
const reSku = /CAMBIAME/; // TODO

// ------------------------------------------------------------
// TODO (5): total = número con 2 decimales (ej. "249.00", "19.99").
// ------------------------------------------------------------
const reTotal = /CAMBIAME/; // TODO

// ------------------------------------------------------------
// El validador data-driven: recorre el lote y valida campo por campo.
// NO necesitas tocar esta parte; solo completa las regex de arriba.
// ------------------------------------------------------------
function esMercadoConocido(m: string): m is Mercado {
  return m === "MX" || m === "US" || m === "CH" || m === "JP";
}

for (const pedido of LOTE_PEDIDOS) {
  console.log(`\n· Pedido mercado=${pedido.mercado} email=${pedido.email}`);

  // Cada pedido VÁLIDO debe pasar TODAS estas aserciones (true).
  checkMatch(reMercado, pedido.mercado, true);
  checkMatch(reEmail, pedido.email, true);
  checkMatch(reSku, pedido.sku, true);
  checkMatch(reTotal, pedido.total, true);

  // El teléfono se valida contra la regex de SU mercado (si lo conocemos).
  if (esMercadoConocido(pedido.mercado)) {
    checkMatch(reTelefonoPorMercado[pedido.mercado], pedido.telefono, true);
  } else {
    console.log(`  (mercado "${pedido.mercado}" desconocido en ${Object.keys(MERCADOS).join("/")})`);
  }
}

console.log(
  "\nPista: cuando termines, SOLO los pedidos de mercados conocidos y con " +
    "TODOS los campos bien formados deberían mostrar ✅ en todas sus filas."
);
