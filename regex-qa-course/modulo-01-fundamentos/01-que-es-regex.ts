// ============================================================
// Mini-clase 1.1: ¿Qué es una expresión regular?
// ============================================================
// Analogía: una regex es una REGLA DE VALIDACIÓN reutilizable, igual que un
// criterio de aceptación de un campo de formulario. En vez de escribir
// "el código de cupón debe tener 3 letras y 3 dígitos" en prosa, lo
// escribes en un mini-lenguaje que la máquina puede ejecutar y reusar.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 1.1 ¿Qué es una expresión regular? =====");

// ------------------------------------------------------------
// La idea central: una regex describe un PATRÓN de texto.
// ------------------------------------------------------------
// `RegExp.test(texto)` es la pregunta más básica que le puedes hacer a una
// regex: "¿este texto cumple el patrón?" → responde true / false.
// Es el "¿pasa o no pasa?" de un caso de prueba: un veredicto binario.
//
// Patrón: la palabra literal "QA" en alguna parte del texto.
const reContieneQA = /QA/;

// `.test()` devuelve un boolean. Lo comparamos con check() (mentalidad de
// aserción: no solo imprimimos, VERIFICAMOS contra lo esperado).
check("'equipo QA' contiene 'QA'", reContieneQA.test("equipo QA"), true);
check("'equipo dev' NO contiene 'QA'", reContieneQA.test("equipo dev"), false);

// ------------------------------------------------------------
// Una regex es CASE-SENSITIVE por defecto.
// ------------------------------------------------------------
// Justo como un assertion estricto: "QA" y "qa" son textos distintos.
// Esto importa en QA: validar un ambiente "PROD" no es lo mismo que "prod".
check("'qa' en minúsculas NO matchea /QA/", reContieneQA.test("qa"), false);

// ------------------------------------------------------------
// checkMatch(): el mismo veredicto, pero con etiqueta legible.
// ------------------------------------------------------------
// checkMatch(re, input, debeCoincidir) internamente hace .test() y compara
// con lo que esperas. Es nuestro azúcar para casos sí/no.
//   debeCoincidir=true  → esperamos que SÍ matchee
//   debeCoincidir=false → esperamos que NO matchee
checkMatch(reContieneQA, "release a QA", true);
checkMatch(reContieneQA, "release a STAGE", false);

// ------------------------------------------------------------
// Reutilizable: una sola regla, muchos textos.
// ------------------------------------------------------------
// El valor de una regex (como el de un criterio de aceptación) es que la
// defines UNA vez y la aplicas a N entradas. Aquí validamos un lote.
const entradas = ["build QA #12", "build QA #13", "build DEV #14"];
const cuantasMencionanQA = entradas.filter((t) => reContieneQA.test(t)).length;
// Razonado a mano: 2 de las 3 contienen "QA" (las dos primeras).
check("2 de 3 entradas mencionan QA", cuantasMencionanQA, 2);
