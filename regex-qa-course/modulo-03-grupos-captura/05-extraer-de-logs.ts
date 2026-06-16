// ============================================================
// Mini-clase 3.5: Extraer datos de logs con grupos nombrados
// ============================================================
// Analogía: una línea de log es un "registro CSV disfrazado de prosa". El
// dato que necesitas (el id de la orden, el monto, la hora exacta) está
// ahí, ahogado entre ruido. Los grupos nombrados son tu extractor de
// evidencia: convierten una línea ilegible en un objeto que puedes assertar
// en un test o mandar a un dashboard. Y con matchAll, lo haces sobre TODAS
// las ocurrencias de un blob, no solo la primera.
// ============================================================
import { check } from "../helpers/check";
import { LINEA_LOG_ORDEN } from "../data/samples";
console.log("\n===== 3.5 Extraer datos de logs con grupos nombrados =====");

// La línea real (de data/samples.ts) es:
//   "2026-06-16T14:30:01Z [INFO] order ORD-2026-0456 created total=249.00 MXN"
// Queremos tres campos: timestamp, orderId y monto.

// ------------------------------------------------------------
// 1) Una sola regex con tres grupos nombrados
// ------------------------------------------------------------
// Cada (?<...>) describe la FORMA del campo, no su posición:
//   timestamp → ISO 8601 con Z:  2026-06-16T14:30:01Z
//   orderId   → ORD-AÑO-FOLIO:   ORD-2026-0456
//   monto     → número.2decimales tras "total=":  249.00
// Entre campos usamos .* (texto intermedio que no nos interesa). El .* es
// "glotón" pero aquí es seguro porque los campos están anclados por su
// forma específica (no se confunden con el ruido).
const reOrden =
  /(?<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z).*(?<orderId>ORD-\d{4}-\d{4}).*total=(?<monto>\d+\.\d{2})/;

const m = LINEA_LOG_ORDEN.match(reOrden);

// ⚠️ Guarda doble obligatoria en strict: match → null posible,
//    match.groups → undefined posible aunque haya match.
if (m && m.groups) {
  check("timestamp", m.groups.timestamp, "2026-06-16T14:30:01Z");
  check("orderId", m.groups.orderId, "ORD-2026-0456");
  check("monto (string)", m.groups.monto, "249.00");
  // El monto suele necesitar ser número para comparaciones/sumas:
  check("monto como número", Number(m.groups.monto), 249);
} else {
  check("la línea de orden debió matchear", false, true);
}

// ------------------------------------------------------------
// 2) Empaquetar en un objeto tipado (lo que de verdad consumes en un test)
// ------------------------------------------------------------
interface Orden {
  timestamp: string;
  orderId: string;
  monto: number;
}
function parseOrden(linea: string): Orden | null {
  const r = linea.match(reOrden);
  if (!r || !r.groups) return null; // tras la guarda, el resto es type-safe
  return {
    timestamp: r.groups.timestamp,
    orderId: r.groups.orderId,
    monto: Number(r.groups.monto),
  };
}
check("objeto Orden completo", parseOrden(LINEA_LOG_ORDEN), {
  timestamp: "2026-06-16T14:30:01Z",
  orderId: "ORD-2026-0456",
  monto: 249,
});
check("línea sin orden → null", parseOrden("2026-06-16T14:30:00Z [INFO] suite started"), null);

// ------------------------------------------------------------
// 3) matchAll: TODAS las ocurrencias, no solo la primera
// ------------------------------------------------------------
// Caso típico: un texto menciona varios SKUs de pizza y quieres listarlos
// todos. match() (sin g) solo da el primero; matchAll() (CON g) los recorre.
// ⚠️ matchAll EXIGE la flag 'g' o lanza TypeError.
const textoConSkus =
  "carrito: PZ-1234 x2, PZ-0001 x1, cupón inválido PZA-9 ignorado, PZ-9999 x3";
const reSku = /\bPZ-\d{4}\b/g; // SKU OmniPizza válido: PZ + 4 dígitos

const skus: string[] = [];
for (const m of textoConSkus.matchAll(reSku)) {
  // m[0] = coincidencia completa (no hay grupos aquí, solo el match entero).
  skus.push(m[0]);
}
// "PZA-9" NO cumple \bPZ-\d{4}\b (ni el prefijo ni los 4 dígitos) → excluido.
check("todos los SKUs válidos del texto", skus, ["PZ-1234", "PZ-0001", "PZ-9999"]);
check("conteo de SKUs", skus.length, 3);

// Atajo equivalente sin bucle: spread del iterador + map al match completo.
const skusAlt = [...textoConSkus.matchAll(reSku)].map((x) => x[0]);
check("mismos SKUs vía spread+map", skusAlt, ["PZ-1234", "PZ-0001", "PZ-9999"]);

// ------------------------------------------------------------
// 4) matchAll + grupos nombrados: extraer estructura de cada ocurrencia
// ------------------------------------------------------------
// Varios ids de orden en un texto, cada uno descompuesto en año y folio.
const textoConOrdenes = "reembolsos: ORD-2026-0456 y ORD-2025-0099 procesados";
const reOrdenId = /\bORD-(?<anio>\d{4})-(?<folio>\d{4})\b/g;

const ordenes: { anio: number; folio: number }[] = [];
for (const m of textoConOrdenes.matchAll(reOrdenId)) {
  // En matchAll cada match también trae .groups (o undefined): guardamos.
  if (m.groups) {
    ordenes.push({ anio: Number(m.groups.anio), folio: Number(m.groups.folio) });
  }
}
check("órdenes extraídas con año/folio", ordenes, [
  { anio: 2026, folio: 456 },
  { anio: 2025, folio: 99 },
]);
