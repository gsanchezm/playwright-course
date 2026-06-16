// ============================================================
// Mini-clase 5.5: Enmascarar PII con lookaround + replace
// ============================================================
// Analogía: es el "marcador negro sobre el documento" antes de mandarlo a
// un log. En QA jamás debes filtrar datos personales (PII) a un reporte,
// un screenshot o un snapshot. El lookaround te deja tapar TODO menos la
// pista mínima útil (los últimos 4 dígitos de la tarjeta, la inicial del
// correo), sin borrar la estructura que necesitas para depurar.
// ============================================================
import { check } from "../helpers/check";
import { TARJETAS, LINEA_LOG_CON_EMAIL } from "../data/samples";
console.log("\n===== 5.5 Enmascarar PII con lookaround + replace =====");

// ------------------------------------------------------------
// 1) TARJETAS: dejar SOLO los últimos 4 dígitos (PCI-DSS clásico)
// ------------------------------------------------------------
// Regla del negocio: un recibo puede mostrar "•••• 1111", nunca el número
// completo. Queremos enmascarar cada dígito EXCEPTO los 4 finales, y
// conservar los espacios para que la forma "**** **** **** 1111" siga
// siendo legible.
//
// El patrón: /\d(?=(?:\D*\d){4})/g
//   \d                un dígito (el candidato a enmascarar)
//   (?=            )   lookahead: "mirando adelante..."
//     (?:\D*\d){4}     ...todavía quedan AL MENOS 4 dígitos por delante
//                      (\D* salta espacios/separadores entre cada dígito)
// Traducción QA: "tapa este dígito SOLO si aún hay 4 o más dígitos
// después de él". Por definición, los últimos 4 NO cumplen (no les quedan
// 4 dígitos detrás) → se quedan visibles. Como el lookahead es de ancho
// cero, los espacios nunca se tocan: solo sustituimos dígitos por '*'.
const reEnmascararTarjeta = /\d(?=(?:\D*\d){4})/g;

const tarjeta0 = TARJETAS[0].replace(reEnmascararTarjeta, "*");
const tarjeta1 = TARJETAS[1].replace(reEnmascararTarjeta, "*");
// "4111 1111 1111 1111" → conserva los 4 últimos ("1111").
check("tarjeta 0 deja últimos 4", tarjeta0, "**** **** **** 1111");
// "5500 0000 0000 0004" → conserva "0004".
check("tarjeta 1 deja últimos 4", tarjeta1, "**** **** **** 0004");
// Verificación de robustez del enmascarado: los 4 últimos caracteres del
// resultado son exactamente los 4 últimos del original (los visibles).
check("últimos 4 visibles == original", tarjeta0.slice(-4), TARJETAS[0].slice(-4));
// Y NO debe quedar ningún dígito "de más" visible: contamos los dígitos
// que sobreviven al enmascarado y deben ser exactamente 4.
const digitosVisibles = (tarjeta0.match(/\d/g) ?? []).length;
check("solo 4 dígitos quedan visibles", digitosVisibles, 4);

// ------------------------------------------------------------
// 2) EMAIL en una línea de log: tapar el dominio, dejar la inicial
// ------------------------------------------------------------
// LINEA_LOG_CON_EMAIL trae el correo "ana.tester@omnipizza.test" incrustado
// en una línea de log real. Queremos enmascararlo a "a***@***" para que el
// log siga siendo útil (sabes que HUBO un correo y su inicial) pero sin
// exponer el resto. Lo hacemos con UNA función replacer y lookaround para
// tratar cada parte por separado.
//
// Patrón del email: /(?<=\S)([^\s@]*)@(\S+)/
//   (?<=\S)   lookbehind: el correo empieza tras un caracter no-espacio
//             (la inicial), que dejamos FUERA del match para conservarla.
//   ([^\s@]*) resto de la parte local (lo que va después de la inicial).
//   @         la arroba literal.
//   (\S+)     el dominio completo (no-espacios).
// El lookbehind (?<=\S) garantiza que SIEMPRE preservamos 1 caracter de
// inicial; el grupo 1 (resto local) y el grupo 2 (dominio) se reemplazan.
const reEmailEnLog = /(?<=\S)([^\s@]*)@(\S+)/;
const logEnmascarado = LINEA_LOG_CON_EMAIL.replace(
  reEmailEnLog,
  // El replacer recibe (match, restoLocal, dominio). Tapamos resto local
  // y dominio; la inicial ya quedó intacta gracias al lookbehind.
  (_match, _restoLocal: string, _dominio: string) => "***@***"
);
check(
  "email enmascarado en la línea de log",
  logEnmascarado,
  "2026-06-16T14:30:05Z [INFO] user a***@*** logged in from MX"
);
// Aserciones de seguridad: el resultado NO debe contener PII del correo.
check("ya no aparece el dominio real", logEnmascarado.includes("omnipizza.test"), false);
check("ya no aparece el usuario completo", logEnmascarado.includes("ana.tester"), false);
// Pero SÍ conserva el resto de la línea (timestamp, nivel, mercado) intacto.
check("conserva el contexto del log", logEnmascarado.includes("[INFO]") && logEnmascarado.includes("from MX"), true);

// ------------------------------------------------------------
// 3) Variante simple: enmascarar el correo COMPLETO con un placeholder
// ------------------------------------------------------------
// A veces ni la inicial debe filtrarse. Aquí no hace falta lookaround:
// detectamos el correo y lo sustituimos entero por "<EMAIL>". Útil para
// el "scrubbing" total de snapshots donde cualquier rastro es PII.
const reEmailCompleto = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const logTotal = LINEA_LOG_CON_EMAIL.replace(reEmailCompleto, "<EMAIL>");
check(
  "email reemplazado por placeholder total",
  logTotal,
  "2026-06-16T14:30:05Z [INFO] user <EMAIL> logged in from MX"
);
