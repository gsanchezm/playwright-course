// ============================================================
// Mini-clase 6.2: Parsear logs y stack traces
// ============================================================
// Analogía: tras una corrida nocturna de CI nadie quiere leer 5000 líneas
// de log a mano. El regex es tu "grep con bisturí": extrae el nombre del
// test que reventó, cuenta cuántos warnings hubo, y descompone cada frame
// del stack trace en archivo:línea:columna para abrirlo directo en el IDE.
// ============================================================
import { check } from "../helpers/check";
import { LOG_BLOB, STACK_TRACE } from "../data/samples";

console.log("\n===== 6.2 Parsear logs y stack traces =====");

// ------------------------------------------------------------
// 1) EXTRAER el nombre del test fallido del LOG_BLOB
// ------------------------------------------------------------
// La línea es:  ... [ERROR] test 'checkout flow' failed: TimeoutError
// Capturamos lo que está entre comillas simples tras "test ".
// [^']+ = "todo menos comilla" → es la forma robusta de leer "hasta la
// siguiente comilla" sin tragarse de más (evita el .* glotón).
const reTestFallido = /test '([^']+)' failed/;
const mFallido = LOG_BLOB.match(reTestFallido);
// .match() devuelve RegExpMatchArray | null → en strict hay que verificar.
const nombreTestFallido = mFallido ? mFallido[1] : null;
check("nombre del test fallido", nombreTestFallido, "checkout flow");

// ------------------------------------------------------------
// 2) CONTAR los warnings con flag g + matchAll
// ------------------------------------------------------------
// ⚠️ matchAll EXIGE la flag 'g' (si no, LANZA TypeError). Por eso este
// regex es un objeto APARTE, con 'g', y NO lo pasamos a checkMatch (que
// quita 'g'). matchAll devuelve un iterador → lo volcamos a array.
const reWarn = /\[WARN\]/g;
const warnings = [...LOG_BLOB.matchAll(reWarn)];
// Hay 2 líneas [WARN] en el blob (retry attempt 2, slow response 1200ms).
check("cantidad de warnings", warnings.length, 2);

// Bonus didáctico: el mismo conteo con match() + g devuelve un array de
// coincidencias (o null si no hubo). Útil para comparar enfoques.
const warnsAlt = LOG_BLOB.match(reWarn);
check("conteo de warnings vía match()+g", warnsAlt ? warnsAlt.length : 0, 2);

// ------------------------------------------------------------
// 3) PARSEAR líneas del STACK_TRACE → archivo:línea:columna
// ------------------------------------------------------------
// El STACK_TRACE tiene 4 líneas, pero solo 2 son "frames con ubicación"
// del tipo  archivo.ts:LÍNEA:COLUMNA . Las otras dos:
//   - "TimeoutError: locator.click: Timeout 15000ms exceeded." tiene ':'
//     pero NO el patrón :\d+:\d+ al final → NO debe colar.
//   - "at runMicrotasks (<anonymous>)" no tiene ubicación → tampoco.
// Capturamos 3 grupos: (ruta de archivo)(línea)(columna). La ruta admite
// letras, dígitos, '/', '.', '-' (rutas estilo pages/CheckoutPage.ts).
const reFrame = /([\w./-]+):(\d+):(\d+)/g;

interface Frame {
  archivo: string;
  linea: number;
  columna: number;
}
const frames: Frame[] = [];
for (const m of STACK_TRACE.matchAll(reFrame)) {
  // m[1], m[2], m[3] existen porque el patrón tiene 3 grupos obligatorios.
  frames.push({ archivo: m[1], linea: Number(m[2]), columna: Number(m[3]) });
}

// Esperados, RAZONADOS leyendo el STACK_TRACE de samples.ts:
//   frame 0 → pages/CheckoutPage.ts : 54 : 12
//   frame 1 → checkout.spec.ts      : 42 : 9
check("número de frames con ubicación", frames.length, 2);
check("frame[0]", frames[0], { archivo: "pages/CheckoutPage.ts", linea: 54, columna: 12 });
check("frame[1]", frames[1], { archivo: "checkout.spec.ts", linea: 42, columna: 9 });

// El frame más útil para un reporte de bug suele ser el PRIMERO de tu
// propio código. Lo formateamos como "ruta:línea:col" (clic en IDE).
const top = frames[0];
const ubicacion = top ? `${top.archivo}:${top.linea}:${top.columna}` : "desconocida";
check("ubicación clickable del frame superior", ubicacion, "pages/CheckoutPage.ts:54:12");
