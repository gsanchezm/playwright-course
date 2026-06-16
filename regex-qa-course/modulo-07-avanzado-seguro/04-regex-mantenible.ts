// ============================================================
// Mini-clase 7.4: Regex mantenible (construir por partes, test-driven)
// ============================================================
// Analogía: nadie escribe un test gigante de 200 líneas sin nombres ni
// comentarios; lo divides en pasos legibles. Una regex monstruosa de una
// línea es deuda técnica: nadie se atreve a tocarla. La construimos por
// PIEZAS con nombre, igual que armarías un Page Object: cada parte se
// entiende y se prueba sola, y luego las ensamblas.
// ============================================================
import { check, checkMatch } from "../helpers/check";

console.log("\n===== 7.4 Regex mantenible =====");

// ------------------------------------------------------------
// 1) JS NO tiene flag 'x' (verbose). Pero podemos comentar igual.
// ------------------------------------------------------------
// En PCRE/Python existe la flag 'x' que ignora espacios y permite
// comentarios DENTRO del patrón. JavaScript NO la tiene: una regex literal
// /.../ no admite comentarios ni espacios decorativos. La alternativa
// idiomática es construir el patrón desde STRINGS con nombre y armarlo con
// `new RegExp(...)`. Así cada pieza lleva su comentario en el código.

// ------------------------------------------------------------
// 2) ⚠️ TRAMPA #1 de new RegExp: el doble backslash.
// ------------------------------------------------------------
// En una regex LITERAL escribes /\d/. Pero dentro de un STRING, "\d" no es
// "\d": JavaScript interpreta "\d" como una 'd' (la barra se pierde porque
// \d no es un escape de string válido). Para que el patrón vea "\d" debes
// escribir "\\d" en el string. Regla: en `new RegExp` DUPLICA cada \.
const malString = "\\d"; // CORRECTO: el string contiene los 2 caracteres \ y d
check("el string '\\\\d' tiene 2 caracteres", malString.length, 2);
check("new RegExp('\\\\d') matchea un dígito", new RegExp("^" + malString + "$").test("7"), true);

// ------------------------------------------------------------
// 3) Construir una fecha ISO simple por PIEZAS con nombre.
// ------------------------------------------------------------
// Objetivo: validar "YYYY-MM-DD" con rangos reales (mes 01-12, día 01-31).
// En vez de un churro ilegible, nombramos cada parte. Nota los "\\d".
const ANIO = "\\d{4}"; // 4 dígitos
const MES = "(0[1-9]|1[0-2])"; // 01..12
const DIA = "(0[1-9]|[12]\\d|3[01])"; // 01..31
const SEP = "-"; // separador literal

// Ensamblamos el patrón completo, anclado. Es legible: se LEE como la regla.
const patronFecha = `^${ANIO}${SEP}${MES}${SEP}${DIA}$`;
const reFechaISO = new RegExp(patronFecha);
console.log(`   patrón armado: ${reFechaISO.source}`);

// ------------------------------------------------------------
// 4) Enfoque TEST-DRIVEN: define los casos PRIMERO, la regex después.
// ------------------------------------------------------------
// Igual que TDD en código: escribes los ejemplos esperados (válidos e
// inválidos) y construyes/ajustas la regex hasta que TODOS pasan. Los
// casos son la especificación viva; la regex es la implementación.
const fechasValidas = ["2026-06-16", "2026-01-01", "2026-12-31"];
const fechasInvalidas = [
  "2026-13-01", // mes 13 fuera de rango
  "2026-00-10", // mes 00 inválido
  "2026-06-32", // día 32 fuera de rango
  "2026-6-1", // sin cero a la izquierda
  "26-06-16", // año de 2 dígitos
];

console.log("--- Casos válidos (definidos ANTES de la regex) ---");
for (const f of fechasValidas) checkMatch(reFechaISO, f, true);
console.log("--- Casos inválidos ---");
for (const f of fechasInvalidas) checkMatch(reFechaISO, f, false);

// ------------------------------------------------------------
// 5) Reusar piezas: armar OTRA regex con los mismos bloques.
// ------------------------------------------------------------
// La gran ventaja de las piezas con nombre es la REUTILIZACIÓN. Aquí
// armamos un "año-mes" (YYYY-MM, sin día) reusando ANIO, SEP y MES.
const reAnioMes = new RegExp(`^${ANIO}${SEP}${MES}$`);
checkMatch(reAnioMes, "2026-06", true);
checkMatch(reAnioMes, "2026-13", false); // reusa el rango de mes: 13 cae
checkMatch(reAnioMes, "2026-06-16", false); // tiene día: no calza año-mes

// ------------------------------------------------------------
// 6) Banderas y flags al construir: el 2.º argumento de new RegExp.
// ------------------------------------------------------------
// Las flags ('i', 'g', 'u', 'm', 's') van como SEGUNDO argumento string.
// Útil cuando la regex es dinámica. Ejemplo: un SKU case-insensitive.
const rePieza = "[A-Z]{2}-\\d{4}"; // 2 letras may + guion + 4 dígitos
const reSkuInsensible = new RegExp(`^${rePieza}$`, "i"); // 'i' → ignora mayúsc/minúsc
checkMatch(reSkuInsensible, "PZ-1234", true);
checkMatch(reSkuInsensible, "pz-1234", true); // gracias a la flag 'i'
check("la flag 'i' quedó en la regex construida", reSkuInsensible.flags.includes("i"), true);

// Cierre: una regex armada por piezas se REVISA y se EXTIENDE sin miedo.
// Esa mantenibilidad vale más que ahorrar tres caracteres en una línea.
console.log("   ✅ Regex construida por piezas, comentada y test-driven.");
