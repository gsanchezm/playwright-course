// ============================================================
// Mini-clase 4.4: Banderas m (multilínea) y s (dotAll)
// ============================================================
// Analogía: un log multilínea es una hoja de cálculo de texto. `m`
// dice "trata cada LÍNEA como su propia fila" (^ y $ por línea). `s`
// dice lo opuesto: "ignora los saltos de línea, es todo UN párrafo"
// (el punto . también se traga los \n). Son herramientas OPUESTAS.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { LOG_BLOB } from "../data/samples";
console.log("\n===== 4.4 Banderas m (multilínea) y s (dotAll) =====");

// LOG_BLOB es un texto de 6 líneas unidas por "\n" (sin salto final).
// Confirmémoslo antes de razonar sobre él:
check("LOG_BLOB tiene 6 líneas", LOG_BLOB.split("\n").length, 6);

// ------------------------------------------------------------
// 1) Flag m: ^ y $ pasan a significar "inicio/fin de CADA LÍNEA"
// ------------------------------------------------------------
// Sin `m`, ^ es solo el inicio del TEXTO completo. La 2.ª línea empieza
// con "2026-..." pero ^ no la "ve" porque no es el inicio del blob.
// Con `m`, ^ ancla al inicio de cada línea → podemos capturar cada
// timestamp de inicio de línea.
const reTimestampMul = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/gm;
const timestamps = LOG_BLOB.match(reTimestampMul); // string[] | null
check("con /m hay un timestamp por línea (6)", timestamps?.length ?? 0, 6);
check("primer timestamp", timestamps ? timestamps[0] : null, "2026-06-16T14:30:00Z");

// Sin `m`, ^ solo calza en el inicio del blob → 1 sola coincidencia.
const reTimestampSinM = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g;
const soloPrimero = LOG_BLOB.match(reTimestampSinM);
check("sin /m ^ solo ve el inicio del blob (1)", soloPrimero?.length ?? 0, 1);

// ------------------------------------------------------------
// 2) Parsear LOG_BLOB línea por línea: nivel + mensaje con ^...$ y /m
// ------------------------------------------------------------
// Con /m y $, podemos describir UNA línea completa: timestamp, [NIVEL]
// y el resto hasta el FIN DE LÍNEA. Como NO usamos `s`, el . NO cruza el
// "\n", así que ".*" se detiene al final de cada línea (eso es lo que
// queremos para parsear renglón por renglón).
const reLinea = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) \[(\w+)\] (.*)$/gm;
const filas = [...LOG_BLOB.matchAll(reLinea)];
check("matchAll con /m devuelve 6 filas", filas.length, 6);
// La 4.ª línea (índice 3) es el ERROR del checkout:
const filaError = filas[3];
check("nivel de la 4ª línea", filaError[2], "ERROR");
check(
  "mensaje de la 4ª línea (.* se detuvo en el \\n)",
  filaError[3],
  "test 'checkout flow' failed: TimeoutError"
);

// Una sola línea anclada con ^...$ y /m: "es exactamente una línea de WARN".
const reLineaWarn = /^.*\[WARN\].*$/m;
checkMatch(reLineaWarn, LOG_BLOB, true); // /m hace que ^...$ calce UNA línea interna

// ------------------------------------------------------------
// 3) Flag s (dotAll): el punto . pasa a matchear también el salto \n
// ------------------------------------------------------------
// MISMO patrón, resultado OPUESTO según la flag. Queremos abarcar desde
// "started" (1ª línea) hasta "finished" (última). Entre medio hay \n.
const reAbarca = /started.*finished/; // . NO cruza \n → falla en multilínea
const reAbarcaDotAll = /started.*finished/s; // s: . SÍ cruza \n → matchea todo

// Sin `s`: el . se topa con el primer "\n" y no puede continuar → no hay match.
checkMatch(reAbarca, LOG_BLOB, false);
// Con `s`: el . atraviesa los saltos de línea → matchea de inicio a fin.
checkMatch(reAbarcaDotAll, LOG_BLOB, true);

// Verificación del MISMO contraste sobre un blob local mínimo, sin g/y
// para poder leer .exec() directamente y guardar el null.
const blobMini = "INICIO\nmedio\nFINAL";
check("sin s: . no cruza \\n", /INICIO.FINAL/.test(blobMini), false);
const conS = /INICIO.*FINAL/s.exec(blobMini); // RegExpExecArray | null
check("con s: . cruza \\n y captura todo", conS ? conS[0] : null, "INICIO\nmedio\nFINAL");

// ------------------------------------------------------------
// 4) m y s son INDEPENDIENTES (puedes combinarlas, pero hacen cosas
//    distintas): m → ^/$ por línea; s → . incluye \n. No se anulan.
// ------------------------------------------------------------
// "^[\s\S]*$" abarca todo el blob (clásico truco pre-dotAll: [\s\S] = "todo").
const todo = LOG_BLOB.match(/^[\s\S]*$/);
check("[\\s\\S]* abarca el blob completo", todo ? todo[0].length : -1, LOG_BLOB.length);
