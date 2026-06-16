// ============================================================
// Mini-clase 1.3: Métodos básicos (test, match, replace, split, search)
// ============================================================
// Analogía: una regex es la "regla"; los métodos son las distintas PREGUNTAS
// que le haces, como las distintas aserciones de tu kit de testing:
//   test   → ¿pasa sí/no?        (como expect(...).toBeTruthy())
//   search → ¿en qué posición?   (como un indexOf con patrón)
//   match  → ¿qué capturó?       (como leer el valor de un campo)
//   replace→ corrige/normaliza   (como sanear un dato antes de comparar)
//   split  → trocea por patrón   (como parsear una línea en columnas)
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 1.3 Métodos básicos =====");

const linea = "test=checkout.spec.ts:42 status=failed";

// ------------------------------------------------------------
// 1) RegExp.test(texto) → boolean (¿hay match? sí/no)
// ------------------------------------------------------------
// El veredicto binario. Lo más usado para validar "cumple / no cumple".
const reFailed = /status=failed/;
check("test(): la línea reporta status=failed", reFailed.test(linea), true);
checkMatch(reFailed, linea, true);

// ------------------------------------------------------------
// 2) String.search(regex) → number (índice del 1.er match, o -1)
// ------------------------------------------------------------
// Como indexOf, pero con patrón. Devuelve la POSICIÓN, no el texto.
// "status=" empieza en el índice 25 de `linea` (contado a mano: "test=" (0)
// ... el bloque "test=checkout.spec.ts:42 " ocupa 0..24, así que "status"
// arranca en 25). Si no hubiera match, search() devolvería -1.
check("search(): posición de 'status='", linea.search(/status=/), 25);
check("search(): patrón ausente devuelve -1", linea.search(/aborted/), -1);

// ------------------------------------------------------------
// 3) String.match(regex) → array | null
// ------------------------------------------------------------
// SIN flag 'g': devuelve [coincidenciaCompleta, ...gruposCapturados] o null.
// Aquí capturamos archivo y línea con dos grupos ( ).
const reUbicacion = /(\w+\.spec\.ts):(\d+)/;
const m = linea.match(reUbicacion);
// .match() puede ser null en strict → guardamos antes de indexar.
//   m[0] = coincidencia completa  → "checkout.spec.ts:42"
//   m[1] = grupo 1 (archivo)      → "checkout.spec.ts"
//   m[2] = grupo 2 (línea)        → "42"  (siempre STRING, aunque sean dígitos)
check("match(): coincidencia completa", m ? m[0] : null, "checkout.spec.ts:42");
check("match(): grupo 1 = archivo", m?.[1] ?? null, "checkout.spec.ts");
check("match(): grupo 2 = línea (string)", m?.[2] ?? null, "42");
// Sin coincidencia, match() devuelve null (NO un array vacío). Verifícalo:
check("match(): sin coincidencia devuelve null", "abc".match(reUbicacion), null);

// ------------------------------------------------------------
// 4) String.replace(regex, reemplazo) → string nuevo
// ------------------------------------------------------------
// Útil para NORMALIZAR/SANEAR datos antes de compararlos. replace() NO muta
// el string original (los strings son inmutables); devuelve uno nuevo.
// Reemplazamos el resultado "failed" por "passed" (corrección simbólica).
const corregida = linea.replace(/failed/, "passed");
check("replace(): cambia failed→passed", corregida, "test=checkout.spec.ts:42 status=passed");
// El original sigue intacto: prueba de que replace() no muta.
check("replace(): el original NO se mutó", linea.endsWith("status=failed"), true);

// ------------------------------------------------------------
// 5) String.split(regex) → string[] (trocea por el patrón)
// ------------------------------------------------------------
// Como parsear una línea CSV, pero el separador es un PATRÓN, no un char fijo.
// Aquí partimos por "uno o más espacios en blanco" (\s+), robusto ante
// espacios dobles. Resultado: dos pares clave=valor.
const partes = "test=checkout.spec.ts:42   status=failed".split(/\s+/);
check("split(): trocea por espacios", partes, ["test=checkout.spec.ts:42", "status=failed"]);
check("split(): devolvió 2 trozos", partes.length, 2);
