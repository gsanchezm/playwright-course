// ============================================================
// Mini-clase 7.2: Mitigar ReDoS (cómo escribir regex que NO se cuelguen)
// ============================================================
// Analogía: en testing no esperas a que el bug llegue a producción para
// reaccionar; pones "guardas" antes (validación de entrada, límites,
// timeouts). Con ReDoS es igual: en vez de arriesgarte al backtracking
// catastrófico, DISEÑAS el patrón para que no exista esa ambigüedad y
// pones una guarda de LONGITUD antes de siquiera ejecutar la regex.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { REDOS_INPUT_CORTO } from "../data/samples";

console.log("\n===== 7.2 Mitigar ReDoS =====");

// ⚠️ Igual que en 7.1: aquí el input máximo es 12 caracteres. Demostramos
//    versiones SEGURAS, no reproducimos cuelgues.

// ------------------------------------------------------------
// Estrategia 1: ELIMINAR el cuantificador anidado solapado.
// ------------------------------------------------------------
// /(a+)+$/ es vulnerable. Pero "una o más 'a'" se expresa SIN anidar:
// simplemente /^a+$/. Mismo lenguaje aceptado, CERO ambigüedad → cero
// backtracking exponencial. Esta es la mitigación #1 y casi siempre basta:
// si ves (X+)+ , pregúntate si X+ solo no hace lo mismo (casi siempre sí).
const REGEX_INSEGURA = /^(a+)+$/; // NO la corras contra texto largo.
const REGEX_SEGURA = /^a+$/; // equivalente, lineal, a prueba de ReDoS.

// Aceptan lo mismo en los casos válidos...
checkMatch(REGEX_SEGURA, REDOS_INPUT_CORTO, true);
// ...y rechazan lo mismo en los inválidos, pero SIN explosión combinatoria:
checkMatch(REGEX_SEGURA, REDOS_INPUT_CORTO + "!", false);
// Confirmamos (en input corto y seguro) que ambas dan el MISMO veredicto:
check(
  "insegura y segura coinciden en el caso válido",
  REGEX_INSEGURA.test(REDOS_INPUT_CORTO),
  REGEX_SEGURA.test(REDOS_INPUT_CORTO)
);
check(
  "insegura y segura coinciden en el caso inválido",
  REGEX_INSEGURA.test(REDOS_INPUT_CORTO + "!"),
  REGEX_SEGURA.test(REDOS_INPUT_CORTO + "!")
);

// ------------------------------------------------------------
// Estrategia 2: ANCLAR (^ ... $) y ser ESPECÍFICO.
// ------------------------------------------------------------
// Una regex sin anclas busca subcadenas, lo que multiplica los puntos de
// inicio que el motor prueba. Anclar reduce el espacio de búsqueda y, de
// paso, evita falsos positivos (ver M06). Especificar clases estrechas
// ([0-9] en vez de .) también recorta caminos que el motor exploraría.
// Ejemplo: validar un código "letra + dígitos" anclado y específico.
const reCodigo = /^[A-Z]\d{1,6}$/; // 1 letra + 1..6 dígitos, acotado.
checkMatch(reCodigo, "A123", true);
checkMatch(reCodigo, "A1234567", false); // 7 dígitos: el {1,6} lo corta.
checkMatch(reCodigo, "a123", false); // minúscula: rechazada por anclaje.

// ------------------------------------------------------------
// Estrategia 3: ACOTAR los cuantificadores ({0,n} en vez de * o +).
// ------------------------------------------------------------
// Un * o + abierto invita a reintentos sin techo. Si conoces el máximo
// real del dominio, ponlo: {0,n}. No solo es más seguro, también documenta
// la regla de negocio. Ejemplo: un "username" de hasta 20 caracteres.
const reUsernameAbierto = /^[a-z0-9_]+$/; // sin techo (riesgo si el grupo se anida)
const reUsernameAcotado = /^[a-z0-9_]{1,20}$/; // techo explícito: máx. 20
checkMatch(reUsernameAcotado, "ana_qa_2026", true);
checkMatch(reUsernameAcotado, "aaaaaaaaaaaaaaaaaaaaa", false); // 21 'a' (literal corto) → excede el {1,20}
// (Nota de seguridad: este patrón NO tiene cuantificadores anidados, así que
//  un input de 21 chars es totalmente inofensivo aquí; aun así, lo escribimos
//  como literal corto y NUNCA con .repeat(N) grande, por higiene anti-ReDoS.)
check("acotado y abierto coinciden en input válido", reUsernameAbierto.test("ana_qa"), reUsernameAcotado.test("ana_qa"));

// ------------------------------------------------------------
// Estrategia 4: VALIDAR LA LONGITUD ANTES de ejecutar la regex.
// ------------------------------------------------------------
// La guarda más barata y robusta: si el input excede un máximo razonable,
// recházalo SIN pasar la regex. Aunque el patrón fuera vulnerable, nunca
// le das un input suficientemente largo para que explote. Es defensa en
// profundidad: primero la longitud, luego el formato.
function validarConGuardaDeLongitud(re: RegExp, input: string, maxLen: number): boolean {
  if (input.length > maxLen) return false; // corto-circuito: ni ejecuta la regex
  return re.test(input);
}
// Con un máximo de 12, "aaaaaaaaaa" (10) pasa la guarda y la regex segura lo acepta:
check("guarda longitud: 10 chars pasan y matchean", validarConGuardaDeLongitud(REGEX_SEGURA, REDOS_INPUT_CORTO, 12), true);
// Un input de 13 'a' (corto y seguro) es rechazado por la GUARDA, sin ejecutar la regex:
check("guarda longitud: 13 chars se rechazan antes de la regex", validarConGuardaDeLongitud(REGEX_SEGURA, "a".repeat(13), 12), false);

// ------------------------------------------------------------
// 🔷 Nota sobre OTROS lenguajes (puente, NO disponible en JS):
// ------------------------------------------------------------
// Algunos motores (PCRE, Java, .NET, Ruby) ofrecen:
//   - Grupos ATÓMICOS:  (?>a+)   → una vez que matchean, NO retroceden.
//   - Cuantificadores POSESIVOS: a++ , a*+ , (a+)++ → tampoco retroceden.
// Ambos eliminan el backtracking de raíz. JavaScript (el motor V8/Node)
// NO los soporta: no existe a++ ni (?>...). Por eso en JS la mitigación es
// DISEÑO (sin anidar + anclar + acotar) + GUARDA DE LONGITUD. Saberlo te
// hace mejor QA cuando revises regex escritas para back-ends en otro stack.
console.log("   ✅ Versiones seguras verificadas (sin anidamiento, ancladas, acotadas).");
