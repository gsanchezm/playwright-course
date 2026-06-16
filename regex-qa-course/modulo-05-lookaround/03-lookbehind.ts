// ============================================================
// Mini-clase 5.3: Lookbehind (?<=...) y (?<!...)
// ============================================================
// Analogía: el lookahead mira ADELANTE; el lookbehind mira ATRÁS. Es el
// "esto debe venir DESPUÉS de una etiqueta" de tu parser de logs. Como
// leer la cifra de un recibo: te interesa el monto que va justo tras la
// palabra "total=", no la etiqueta en sí. Capturas el valor, no su rótulo.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { LINEA_LOG_ORDEN } from "../data/samples";
console.log("\n===== 5.3 Lookbehind (?<=...) y (?<!...) =====");

// ------------------------------------------------------------
// (?<=...) afirma "JUSTO ANTES de aquí venía este patrón" (positivo).
// (?<!...) afirma "JUSTO ANTES de aquí NO venía este patrón" (negativo).
// Ambos son de ancho cero: la etiqueta NO entra en el resultado.
// ------------------------------------------------------------

// ------------------------------------------------------------
// 1) Extraer el MONTO que va tras "total=" (sin llevarse "total=")
// ------------------------------------------------------------
// LINEA_LOG_ORDEN = "... order ORD-2026-0456 created total=249.00 MXN".
// (?<=total=) afirma que antes del número venía "total=", pero no lo
// captura. Resultado limpio: "249.00", listo para Number() y comparar.
const reMonto = /(?<=total=)\d+\.\d{2}/;
const mMonto = LINEA_LOG_ORDEN.match(reMonto);
// Guarda de null obligatoria en TS estricto.
check("monto tras 'total=' (lookbehind)", mMonto ? mMonto[0] : null, "249.00");
check("el lookbehind no se llevó 'total='", mMonto ? mMonto[0].includes("total") : true, false);

// Contraste: con un GRUPO de captura normal lograrías lo mismo, pero
// tendrías que leer m[1] en vez de m[0] (más ruido). El lookbehind deja
// el valor directo en la coincidencia principal.
const mGrupo = LINEA_LOG_ORDEN.match(/total=(\d+\.\d{2})/);
check("mismo monto vía grupo de captura (m[1])", mGrupo ? mGrupo[1] : null, "249.00");

// ------------------------------------------------------------
// 2) Lookbehind NEGATIVO: número que NO va precedido de "$"
// ------------------------------------------------------------
// Imagina que en un texto algunos números son precios ($) y otros son
// cantidades. Queremos las CANTIDADES: dígitos que NO tienen "$" detrás.
// (?<!\$) afirma "antes no hay un signo de dólar".
const reCantidad = /(?<!\$)\b\d+/g;
const cantidades = "compra $100 de 3 pizzas y $20 de 2 refrescos".match(reCantidad);
// Razonado a mano: "$100" tiene $ detrás del 1 → descartado en esa
// posición; "3" y "2" no → se quedan. ("$20" igual que "$100".)
check("cantidades sin '$' detrás", cantidades, ["3", "2"]);

// ------------------------------------------------------------
// 3) Lookbehind de ANCHO VARIABLE (válido en V8 / Node 18+)
// ------------------------------------------------------------
// A diferencia de otros motores, el lookbehind de JavaScript admite
// patrones de longitud variable (con *, +, {m,n}...). Aquí la etiqueta
// puede traer espacios variables tras los dos puntos: "Precio:", luego
// \s* (cero o más espacios). El lookbehind absorbe ese relleno y aun así
// el valor sale limpio. ⚠️ Esto NO funcionaría en motores que exigen
// lookbehind de ancho fijo; en Node/V8 es perfectamente legal.
const rePrecioVar = /(?<=Precio:\s*)\d+/;
check("lookbehind variable (1 espacio)",  "Precio: 42".match(rePrecioVar)?.[0] ?? null, "42");
check("lookbehind variable (3 espacios)", "Precio:   99".match(rePrecioVar)?.[0] ?? null, "99");
check("lookbehind variable (0 espacios)", "Precio:7".match(rePrecioVar)?.[0] ?? null, "7");

// ------------------------------------------------------------
// 4) Combinar lookbehind + lookahead: el valor "entre etiquetas"
// ------------------------------------------------------------
// Extraer lo que está ENTRE "id=" y un punto y coma, sin llevarse ninguno
// de los dos delimitadores. Lookbehind detrás, lookahead delante, y en
// medio "uno o más caracteres que no sean ;". Es el sándwich clásico.
const reEntre = /(?<=id=)[^;]+(?=;)/;
const mEntre = "params: id=ORD-789; status=ok".match(reEntre);
check("valor entre 'id=' y ';'", mEntre ? mEntre[0] : null, "ORD-789");
checkMatch(reEntre, "params: id=ORD-789; status=ok", true);
