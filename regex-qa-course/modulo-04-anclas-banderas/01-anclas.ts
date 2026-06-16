// ============================================================
// Mini-clase 4.1: Anclas ^ y $ — "contiene" vs "es exactamente"
// ============================================================
// Analogía: sin anclas, una regex es un detector de metales que pita
// si encuentra UNA moneda en tu maleta. Con ^ y $ es el control de
// aduana que abre TODA la maleta y exige que NADA más esté dentro.
// En QA: un validador sin anclas pasa "por las razones equivocadas".
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 4.1 Anclas ^ y $ =====");

// ------------------------------------------------------------
// ^  = inicio del texto (o de línea, con flag m — ver 4.4)
// $  = fin del texto    (o de línea, con flag m — ver 4.4)
// Por sí solas no consumen ningún caracter: son POSICIONES, no letras.
// ------------------------------------------------------------

// ------------------------------------------------------------
// 1) El BUG de validación clásico: "contiene un número" vs "ES un número"
// ------------------------------------------------------------
// /\d+/ pregunta "¿hay EN ALGÚN LUGAR uno o más dígitos?". El input
// "abc123" contiene "123", así que .test() devuelve true. Eso parece
// validación... pero NO lo es: un campo "cantidad" aceptaría "abc123".
const reContiene = /\d+/; // "contiene al menos un dígito"
const reEsExacto = /^\d+$/; // "el texto COMPLETO son solo dígitos"

// Mismo input, dos veredictos opuestos: ahí vive el bug.
check("/\\d+/ .test('abc123') (contiene)", reContiene.test("abc123"), true);
check("/^\\d+$/ .test('abc123') (exacto)", reEsExacto.test("abc123"), false);

// Con un input que SÍ es solo dígitos, ambas coinciden.
check("/\\d+/ .test('12345')", reContiene.test("12345"), true);
check("/^\\d+$/ .test('12345')", reEsExacto.test("12345"), true);

// ------------------------------------------------------------
// 2) checkMatch deja ver la diferencia en una tabla de casos
// ------------------------------------------------------------
// OJO: checkMatch usa .test() internamente (busca subcadena). Por eso,
// sin anclas, los inputs "casi válidos" (que CONTIENEN dígitos) pasan.
console.log("--- Sin anclas: cualquier cosa con dígitos 'matchea' ---");
checkMatch(reContiene, "123", true);
checkMatch(reContiene, "abc123", true); // ⚠️ falso positivo desde QA
checkMatch(reContiene, "12px", true); // ⚠️ falso positivo desde QA

console.log("--- Con anclas: SOLO el dato 100% dígitos pasa ---");
checkMatch(reEsExacto, "123", true);
checkMatch(reEsExacto, "abc123", false);
checkMatch(reEsExacto, "12px", false);
checkMatch(reEsExacto, "", false); // \d+ exige ≥1 dígito → vacío falla

// ------------------------------------------------------------
// 3) Anclar texto literal: "es exactamente PROD"
// ------------------------------------------------------------
// /PROD/ matchea "PRODUCTION" (lo contiene). /^PROD$/ exige el dato exacto.
const reAmbienteFlojo = /PROD/;
const reAmbienteEstricto = /^PROD$/;
checkMatch(reAmbienteFlojo, "PRODUCTION", true); // contiene "PROD"
checkMatch(reAmbienteEstricto, "PRODUCTION", false); // no es exactamente "PROD"
checkMatch(reAmbienteEstricto, "PROD", true);
// Trampa de espacios: "PROD " (con espacio final) NO es exactamente "PROD".
checkMatch(reAmbienteEstricto, "PROD ", false);

// ------------------------------------------------------------
// 4) ^ y $ son posiciones: no aparecen en lo capturado
// ------------------------------------------------------------
// match() de /^\d+$/ sobre "12345" devuelve la cadena entera, sin que
// las anclas añadan caracteres. Guardamos el null por TypeScript estricto.
const m = "12345".match(/^\d+$/);
check("match no es null", m !== null, true);
check("lo capturado es el texto completo", m ? m[0] : null, "12345");
