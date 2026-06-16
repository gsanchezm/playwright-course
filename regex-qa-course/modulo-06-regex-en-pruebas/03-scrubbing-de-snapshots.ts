// ============================================================
// Mini-clase 6.3: Scrubbing de snapshots (datos volátiles → placeholders)
// ============================================================
// Analogía: un snapshot test compara la salida de hoy contra una "foto"
// guardada. Pero si la salida trae un timestamp, un UUID o un orderId
// que cambian en cada corrida, el snapshot FALLA siempre por ruido, no
// por un bug real (test "flaky"). El scrubbing reemplaza esos datos
// volátiles por placeholders ESTABLES (<TIMESTAMP>, <UUID>, <ORDER_ID>)
// para que la comparación mida lo que importa: la ESTRUCTURA, no el ruido.
// ============================================================
import { check } from "../helpers/check";

console.log("\n===== 6.3 Scrubbing de snapshots =====");

// ------------------------------------------------------------
// Regexes de scrubbing — TODAS con 'g' porque queremos reemplazar
// TODAS las ocurrencias en el texto, no solo la primera.
// ------------------------------------------------------------
// Timestamp ISO (con o sin milisegundos, terminando en Z).
const reTimestamp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
// UUID (cualquier versión: aquí solo nos importa enmascararlo, no validarlo).
const reUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
// orderId formato ORD-####-#### (cuatro dígitos, guion, cuatro dígitos).
const reOrderId = /ORD-\d{4}-\d{4}/g;

// El "scrubber": aplica los tres reemplazos en orden. Es una función pura,
// fácil de testear (entra texto sucio, sale texto estable).
function scrub(texto: string): string {
  return texto
    .replace(reTimestamp, "<TIMESTAMP>")
    .replace(reUuid, "<UUID>")
    .replace(reOrderId, "<ORDER_ID>");
}

// ------------------------------------------------------------
// Dos "snapshots" del MISMO evento, capturados en corridas distintas.
// Difieren SOLO en los datos volátiles (otra hora, otro UUID, otro orderId).
// Declarados LOCALMENTE (no toco samples.ts) por ser casos puntuales.
// ------------------------------------------------------------
const snapshotCorridaA =
  "2026-06-16T14:30:01Z [INFO] order ORD-2026-0456 created " +
  "txn=550e8400-e29b-41d4-a716-446655440000 total=249.00 MXN";

const snapshotCorridaB =
  "2026-06-17T09:12:45.987Z [INFO] order ORD-2026-9981 created " +
  "txn=f47ac10b-58cc-4372-a567-0e02b2c3d479 total=249.00 MXN";

// Salida canónica esperada, ESCRITA A MANO (no derivada de la regex).
// Razonamiento: timestamp→<TIMESTAMP>, ORD-####-####→<ORDER_ID>,
// UUID→<UUID>. Todo lo demás (texto fijo y total) queda igual.
const ESPERADO =
  "<TIMESTAMP> [INFO] order <ORDER_ID> created txn=<UUID> total=249.00 MXN";

const scrubA = scrub(snapshotCorridaA);
const scrubB = scrub(snapshotCorridaB);

check("snapshot A scrubbeado == canónico", scrubA, ESPERADO);
check("snapshot B scrubbeado == canónico", scrubB, ESPERADO);
// La prueba reina: dos snapshots con datos volátiles DISTINTOS quedan
// IDÉNTICOS tras el scrub. Esto es lo que mata el flakiness.
check("A y B son idénticos tras scrub", scrubA, scrubB);

// ------------------------------------------------------------
// Variante con FUNCIÓN replacer: a veces quieres numerar las ocurrencias
// para no perder cuántas había (p.ej. <UUID_1>, <UUID_2>). Demuestra que
// el 2.º argumento de replace puede ser una función.
// ------------------------------------------------------------
const conDosUuids =
  "join 550e8400-e29b-41d4-a716-446655440000 with " +
  "f47ac10b-58cc-4372-a567-0e02b2c3d479 done";
let n = 0;
const numerado = conDosUuids.replace(reUuid, () => `<UUID_${++n}>`);
check("replacer numerado de UUIDs", numerado, "join <UUID_1> with <UUID_2> done");
check("se contaron 2 UUIDs", n, 2);
