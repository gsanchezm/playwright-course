// ============================================================
// Mini-clase 7.3: Unicode y propiedades (\p{...}, la flag u y los emojis)
// ============================================================
// Analogía: un test que solo prueba datos en inglés ("John", "Smith") es
// un test sesgado: pasa en tu máquina y falla con clientes reales de
// México, Zürich o Tōkyō. \w y \d son "ASCII-céntricos" por defecto y
// rechazan acentos y otros alfabetos. Tratar bien los datos
// internacionales es parte de la cobertura, no un lujo.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { NOMBRES_UNICODE, TEXTO_CON_EMOJI } from "../data/samples";

console.log("\n===== 7.3 Unicode y propiedades =====");

// ------------------------------------------------------------
// 1) El problema: \w es ASCII. "México" tiene una 'é' que \w NO reconoce.
// ------------------------------------------------------------
// \w en JS == [A-Za-z0-9_]. La 'é' (U+00E9) no está ahí. Entonces
// /^\w+$/ FALLA sobre "México": el validador "letras y números" rechaza
// un nombre perfectamente válido. Este es el bug clásico de i18n.
const reAsciiWord = /^\w+$/;
checkMatch(reAsciiWord, "Mexico", true); // sin acento: \w sí lo acepta
checkMatch(reAsciiWord, "México", false); // con acento: \w lo RECHAZA (bug)

// ------------------------------------------------------------
// 2) La solución: \p{L} con la flag 'u' (Unicode property escapes).
// ------------------------------------------------------------
// \p{L} = "cualquier letra Unicode" (Letter), de cualquier alfabeto.
// REQUIERE la flag 'u' (Unicode); sin 'u' es un error de sintaxis o se
// interpreta literal. Con ella, "México" pasa como debe.
const reLetraUnicode = /^\p{L}+$/u;
checkMatch(reLetraUnicode, "México", true); // ahora SÍ acepta la 'é'
checkMatch(reLetraUnicode, "Tokyo", true);

// Contraste directo sobre el MISMO dato — esta es la lección clave:
check("\\w   rechaza 'México' (ASCII)", reAsciiWord.test("México"), false);
check("\\p{L} acepta  'México' (Unicode)", reLetraUnicode.test("México"), true);

// ------------------------------------------------------------
// 3) Nombres reales del lote: ojo, hay nombres de UNA palabra y de DOS.
// ------------------------------------------------------------
// NOMBRES_UNICODE = ["México","Zürich","Tōkyō","Müller","São Paulo","Søren"]
// "São Paulo" tiene un ESPACIO. /^\p{L}+$/u NO acepta espacios, así que
// FALLARÍA en ese nombre. Honestidad: separamos los de una palabra (todos
// pasan \p{L}+) de los que llevan espacio (necesitan también \s).
const monoPalabra = NOMBRES_UNICODE.filter((n) => !n.includes(" "));
const multiPalabra = NOMBRES_UNICODE.filter((n) => n.includes(" "));

console.log("--- Nombres de una sola palabra: /^\\p{L}+$/u ---");
for (const nombre of monoPalabra) checkMatch(reLetraUnicode, nombre, true);

console.log("--- Nombres con espacio: NECESITAN incluir \\s ---");
// Para nombres con espacios (y posibles acentos) ampliamos a letra O espacio.
const reNombreCompleto = /^[\p{L}\s]+$/u;
for (const nombre of multiPalabra) checkMatch(reNombreCompleto, nombre, true);
// Y verificamos la trampa explícitamente: \p{L}+ SOLO falla en "São Paulo".
check("\\p{L}+ falla en 'São Paulo' por el espacio", reLetraUnicode.test("São Paulo"), false);
check("[\\p{L}\\s]+ acepta 'São Paulo'", reNombreCompleto.test("São Paulo"), true);

// ------------------------------------------------------------
// 4) \p{N} para números Unicode; \d sigue siendo ASCII salvo que uses 'u'.
// ------------------------------------------------------------
// \p{N} = "cualquier número" Unicode. Para los dígitos ASCII normales
// \d basta, pero \p{N} es útil si tus datos pueden traer numerales de
// otros sistemas. Aquí mostramos el caso ASCII (el más común en QA).
const reNumeroUnicode = /^\p{N}+$/u;
checkMatch(reNumeroUnicode, "2026", true);
checkMatch(reNumeroUnicode, "12.5", false); // el punto no es \p{N}

// Combinar: "alfanumérico Unicode" = letra o número, internacional-safe.
const reAlfanumUnicode = /^[\p{L}\p{N}]+$/u;
checkMatch(reAlfanumUnicode, "Pizza2026", true);
checkMatch(reAlfanumUnicode, "Zürich2", true); // acento + dígito: ok
checkMatch(reAlfanumUnicode, "Zürich 2", false); // espacio: rechazado

// ------------------------------------------------------------
// 5) Emojis y surrogate pairs: por qué .length te miente.
// ------------------------------------------------------------
// TEXTO_CON_EMOJI = "Pedido confirmado 🍕🎉 para México".
// JavaScript guarda strings en UTF-16. Los emojis 🍕 y 🎉 están FUERA del
// rango básico (son "astral"): cada uno ocupa DOS unidades de código
// (un surrogate pair). Por eso str.length (cuenta unidades UTF-16) es
// MAYOR que el número real de "caracteres percibidos".
// El iterador de strings ([...str] o for..of) sí respeta los code points,
// así que [...str].length cuenta cada emoji como 1.
const porUnidadesUTF16 = TEXTO_CON_EMOJI.length;
const porCodePoints = [...TEXTO_CON_EMOJI].length;
console.log(`   str.length (UTF-16) = ${porUnidadesUTF16} | [...str].length (code points) = ${porCodePoints}`);
// No adivinamos los conteos exactos; afirmamos la RELACIÓN robusta:
// hay 2 emojis astral, cada uno aporta 1 unidad EXTRA en .length.
check("hay exactamente 2 emojis astral (diff de 2)", porUnidadesUTF16 - porCodePoints, 2);
// Y que el iterador cuenta menos que .length (la prueba de que .length engaña):
check("[...str].length < str.length por los emojis", porCodePoints < porUnidadesUTF16, true);

// Para CONTAR caracteres reales de cara al usuario (p.ej. límite de un
// campo "comentario"), usa el spread, no .length:
function longitudReal(s: string): number {
  return [...s].length;
}
check("longitud real de '🍕' es 1, no 2", longitudReal("🍕"), 1);
check("'🍕'.length cruda es 2 (surrogate pair)", "🍕".length, 2);

// Con la flag 'u', un '.' cuenta cada emoji como UNA coincidencia (sin 'u',
// '.' partiría el surrogate pair en dos). Demostración:
const soloEmojis = "🍕🎉";
const conU = soloEmojis.match(/./gu); // u: code points → 2 matches
const sinU = soloEmojis.match(/./g); // sin u: unidades UTF-16 → 4 matches
check("'.' con flag u cuenta 2 emojis", conU?.length ?? 0, 2);
check("'.' sin flag u cuenta 4 (parte surrogates)", sinU?.length ?? 0, 4);
