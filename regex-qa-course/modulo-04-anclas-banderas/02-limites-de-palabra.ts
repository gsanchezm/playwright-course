// ============================================================
// Mini-clase 4.2: Límites de palabra \b y \B
// ============================================================
// Analogía: \b es el botón "coincidir palabra completa" de tu editor.
// Buscar ERROR sin él te resalta también "ERRORLEVEL" y "terror"; con
// \bERROR\b solo cae la palabra suelta. En logs eso es la diferencia
// entre "1 error real" y "47 falsos positivos".
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { LOG_BLOB } from "../data/samples";
console.log("\n===== 4.2 Límites de palabra \\b y \\B =====");

// ------------------------------------------------------------
// \b = "borde de palabra": frontera entre un caracter de palabra
//      [A-Za-z0-9_] y un NO-caracter de palabra (o el inicio/fin del texto).
// \B = lo contrario: una posición que NO es borde de palabra.
// Igual que ^/$, son POSICIONES (cero ancho): no consumen letras.
// ------------------------------------------------------------

// ------------------------------------------------------------
// 1) El caso de logs: \bERROR\b NO matchea "ERRORLEVEL"
// ------------------------------------------------------------
const rePalabraSuelta = /\bERROR\b/;
const reSubcadena = /ERROR/;

// "ERRORLEVEL": entre la 'R' de ERROR y la 'L' NO hay borde (ambas son
// caracteres de palabra), así que \b después de "ERROR" NO existe ahí.
checkMatch(rePalabraSuelta, "ERRORLEVEL", false); // la lección del módulo
checkMatch(reSubcadena, "ERRORLEVEL", true); // sin \b sí "matchea" (falso positivo)

// "ERROR" suelta sí tiene bordes a ambos lados (inicio/fin de texto).
checkMatch(rePalabraSuelta, "ERROR", true);
// Rodeada de NO-letras también: en "[ERROR]" los corchetes son bordes.
checkMatch(rePalabraSuelta, "[ERROR] algo falló", true);
// Pegada a otra letra por la izquierda tampoco: "XERROR".
checkMatch(rePalabraSuelta, "XERROR", false);

// ------------------------------------------------------------
// 2) Sobre el LOG_BLOB real: contar líneas con la palabra ERROR
// ------------------------------------------------------------
// En el blob, la única ocurrencia es "[ERROR]". Los corchetes son
// no-palabra, así que \bERROR\b cae justo ahí. Con flag g contamos todas.
const reErrorGlobal = /\bERROR\b/g;
const erroresEncontrados = LOG_BLOB.match(reErrorGlobal); // string[] | null
// Guardamos el null (TypeScript estricto): si no hubiera matches sería null.
check("hay matches de \\bERROR\\b en el blob", erroresEncontrados !== null, true);
check("ERROR aparece exactamente 1 vez", erroresEncontrados?.length ?? 0, 1);

// Contraste: WARN aparece 2 veces como palabra suelta ("[WARN]").
const warnsEncontrados = LOG_BLOB.match(/\bWARN\b/g);
check("WARN aparece exactamente 2 veces", warnsEncontrados?.length ?? 0, 2);

// ------------------------------------------------------------
// 3) \B: el "anti-borde" — útil para encontrar fragmentos INTERNOS
// ------------------------------------------------------------
// /\Bcat\B/ exige que "cat" esté rodeado de letras por AMBOS lados
// (en medio de una palabra), no como palabra suelta.
const reInterna = /\Bcat\B/;
checkMatch(reInterna, "education", true); // ...du[cat]ion... → cat interno
checkMatch(reInterna, "cat", false); // palabra suelta → tiene bordes, no \B
checkMatch(reInterna, "cats", false); // 'cat' al inicio → ^ es borde a la izq.

// ------------------------------------------------------------
// 4) Por qué importa: 'pass' suelto vs 'pass' dentro de 'password'
// ------------------------------------------------------------
// Buscar "pass" sin \b en un reporte resaltaría "password", "passed",
// "bypass"... \bpass\b solo cae en la palabra exacta "pass".
const rePass = /\bpass\b/;
checkMatch(rePass, "3 tests pass", true);
checkMatch(rePass, "wrong password", false);
checkMatch(rePass, "all tests passed", false);
