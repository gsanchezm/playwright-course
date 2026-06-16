// ============================================================
// Mini-clase 2.5: Validar datos combinando clases + cuantificadores
// ============================================================
// Analogía: aquí dejas de jugar con piezas sueltas y armas el "guardia de
// la puerta" real de tu suite. Un validador = clase (QUÉ caracteres) +
// cuantificador (CUÁNTOS) + anclas ^...$ (sobre TODO el dato). Si falta el
// anclaje, es un test que pasa por la razón equivocada (falso positivo).
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { SKUS_VALIDOS, SKUS_INVALIDOS } from "../data/samples";
console.log("\n===== 2.5 Validar datos =====");

// ------------------------------------------------------------
// REGLA DE ORO: SIEMPRE anclar con ^ ... $
// ------------------------------------------------------------
// checkMatch usa .test(), que busca una SUBCADENA. Casi todo dato inválido
// "casi válido" contiene dentro una porción correcta. Solo ^...$ afirma
// sobre el dato COMPLETO. Por eso TODOS los validadores aquí van anclados.

// ------------------------------------------------------------
// 1) ID NUMÉRICO — solo dígitos, al menos uno
// ------------------------------------------------------------
// [0-9]+ anclado = "uno o más dígitos y NADA más". Equivale a \d+ (ASCII).
const reIdNumerico = /^[0-9]+$/;
checkMatch(reIdNumerico, "42", true);
checkMatch(reIdNumerico, "0", true);
checkMatch(reIdNumerico, "00123", true); // ceros a la izquierda permitidos
checkMatch(reIdNumerico, "", false);     // vacío → '+' exige al menos uno
checkMatch(reIdNumerico, "12a", false);  // la 'a' rompe (gracias al $)
checkMatch(reIdNumerico, "-5", false);   // el signo no es dígito

// ------------------------------------------------------------
// 2) SKU ALFANUMÉRICO — PZ-#### (2 letras MAYÚS + guion + 4 dígitos)
// ------------------------------------------------------------
// Desglose del patrón ^[A-Z]{2}-\d{4}$ :
//   ^        ancla inicio
//   [A-Z]{2} exactamente 2 letras MAYÚSCULAS
//   -        un guion literal
//   \d{4}    exactamente 4 dígitos
//   $        ancla fin
// Usamos los datos compartidos del contrato (SKUS_VALIDOS / INVALIDOS).
const reSku = /^[A-Z]{2}-\d{4}$/;

console.log("--- SKU válidos (data/samples) ---");
for (const sku of SKUS_VALIDOS) checkMatch(reSku, sku, true);
console.log("--- SKU inválidos (data/samples) ---");
for (const sku of SKUS_INVALIDOS) checkMatch(reSku, sku, false);
// Razonamiento de por qué cada inválido cae:
//  "pz-1234"   → minúsculas, [A-Z] exige mayúsculas        → falla
//  "PZ-12"     → 2 dígitos, \d{4} exige 4                   → falla
//  "PZA-1234"  → 3 letras, [A-Z]{2} exige exactamente 2     → falla
//  "PZ-12345"  → 5 dígitos, \d{4}$ no admite el 5.º          → falla
//  "PZ1234"    → falta el guion separador                    → falla
//  "P-1234"    → 1 letra, [A-Z]{2} exige 2                   → falla

// ------------------------------------------------------------
// 3) CÓDIGO DE ESTADO HTTP — rango 100–599 (familias 1xx a 5xx)
// ------------------------------------------------------------
// Un status válido HTTP tiene 3 dígitos y empieza en 1..5 (1xx info,
// 2xx ok, 3xx redirect, 4xx error cliente, 5xx error servidor).
// Patrón: ^[1-5]\d{2}$
//   [1-5]  primer dígito acotado a 1..5 (descarta 0xx y 6xx+)
//   \d{2}  los otros dos dígitos, cualquiera
const reHttpStatus = /^[1-5]\d{2}$/;
checkMatch(reHttpStatus, "200", true);
checkMatch(reHttpStatus, "404", true);
checkMatch(reHttpStatus, "503", true);
checkMatch(reHttpStatus, "099", false); // empieza en 0 → no es familia válida
checkMatch(reHttpStatus, "600", false); // 6xx no existe como familia estándar
checkMatch(reHttpStatus, "20", false);  // solo 2 dígitos
checkMatch(reHttpStatus, "2000", false); // 4 dígitos (el $ lo atrapa)

// ------------------------------------------------------------
// 4) MINI-CASO COMBINADO: etiqueta de versión "vN.N" (ej. release tag)
// ------------------------------------------------------------
// Combina literal + clase + cuantificador + escape del punto.
// ^v\d+\.\d+$  →  'v', uno o más dígitos, un punto LITERAL (\.), más dígitos.
// ⚠️ El \. es clave: un punto sin escapar sería "cualquier caracter".
const reVersion = /^v\d+\.\d+$/;
checkMatch(reVersion, "v1.0", true);
checkMatch(reVersion, "v12.34", true);
checkMatch(reVersion, "v1", false);    // falta ".N"
checkMatch(reVersion, "v1x0", false);  // 'x' no es el punto literal exigido
checkMatch(reVersion, "1.0", false);   // falta la 'v' inicial

// ------------------------------------------------------------
// 5) Verificación de propiedad: TODOS los válidos pasan, NINGÚN inválido
// ------------------------------------------------------------
// Cierre estilo QA: en vez de confiar en la vista, lo afirmamos como dato.
const todosValidosPasan = SKUS_VALIDOS.every((s) => reSku.test(s));
const ningunInvalidoPasa = SKUS_INVALIDOS.every((s) => !reSku.test(s));
check("todos los SKU válidos pasan reSku", todosValidosPasan, true);
check("ningún SKU inválido pasa reSku", ningunInvalidoPasa, true);
