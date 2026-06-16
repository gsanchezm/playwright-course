// ============================================================
// Mini-clase 3.3: Grupos nombrados (?<nombre>...)
// ============================================================
// Analogía: leer datos por índice (m[1], m[2], m[3]) es como pasar
// argumentos posicionales a un test sin nombrarlos: funciona hasta que
// alguien inserta un campo en medio y todo se corre. Los grupos nombrados
// son como un objeto de configuración del test: m.groups.orderId se llama
// igual aunque cambie el orden, y quien lea tu regex entiende QUÉ extrae.
// ============================================================
import { check } from "../helpers/check";
console.log("\n===== 3.3 Grupos nombrados (?<nombre>...) =====");

// ------------------------------------------------------------
// 1) Sintaxis: (?<nombre>patrón) y acceso vía match.groups
// ------------------------------------------------------------
// Parseamos un id de orden OmniPizza "ORD-2026-0456" en tres piezas con
// nombre: prefijo, año y folio. La intención queda escrita EN la regex.
const reOrden = /^(?<prefijo>ORD)-(?<anio>\d{4})-(?<folio>\d{4})$/;
const m = "ORD-2026-0456".match(reOrden);

// ⚠️ Doble guarda obligatoria en TypeScript estricto:
//   - match() puede devolver null (si no hubo coincidencia).
//   - match.groups es `{ [k]: string } | undefined` aunque haya match
//     (TS no sabe que el patrón TIENE grupos nombrados).
// Por eso comprobamos AMBOS antes de leer .groups.
if (m && m.groups) {
  check("prefijo", m.groups.prefijo, "ORD");
  check("año", m.groups.anio, "2026");
  check("folio", m.groups.folio, "0456");
} else {
  // Si llegamos aquí, el patrón no matcheó: lo reportamos como fallo.
  check("la orden debió matchear", false, true);
}

// ------------------------------------------------------------
// 2) Alternativa con `?.` (encadenamiento opcional) para casos sueltos
// ------------------------------------------------------------
// Cuando solo quieres UN campo y prefieres no anidar un if, el optional
// chaining devuelve undefined si match o groups faltan. Ojo: el tipo
// resultante es `string | undefined`, así que da un fallback con ??.
const folio = "ORD-2026-0456".match(reOrden)?.groups?.folio ?? "(sin folio)";
check("folio vía ?. con fallback", folio, "0456");

// ------------------------------------------------------------
// 3) La ventaja real: el ORDEN de los grupos no afecta tu código
// ------------------------------------------------------------
// Imagina que mañana el formato cambia a "AÑO-FOLIO" (sin prefijo). Con
// índices tendrías que renumerar m[1]/m[2]. Con nombres, el campo "folio"
// SIGUE llamándose folio: tu lógica downstream no se entera del cambio.
const reOrdenV2 = /^(?<anio>\d{4})-(?<folio>\d{4})$/;
const m2 = "2026-0456".match(reOrdenV2);
const folioV2 = m2?.groups?.folio ?? null;
check("folio sigue accesible por nombre tras reordenar", folioV2, "0456");

// ------------------------------------------------------------
// 4) Construir un objeto tipado a partir de los grupos
// ------------------------------------------------------------
// Patrón típico en QA: convertir el match en un objeto con tipos. Como
// .groups son strings, casteamos lo que deba ser número con Number().
interface Orden {
  prefijo: string;
  anio: number;
  folio: number;
}
function parseOrden(texto: string): Orden | null {
  const r = texto.match(reOrden);
  if (!r || !r.groups) return null; // guarda → el resto es type-safe
  return {
    prefijo: r.groups.prefijo,
    anio: Number(r.groups.anio),
    folio: Number(r.groups.folio),
  };
}
check("objeto Orden parseado", parseOrden("ORD-2026-0456"), {
  prefijo: "ORD",
  anio: 2026,
  folio: 456, // Number("0456") === 456 (sin el cero a la izquierda)
});
check("texto que no matchea → null", parseOrden("basura"), null);
