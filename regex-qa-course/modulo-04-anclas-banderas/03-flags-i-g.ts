// ============================================================
// Mini-clase 4.3: Banderas i (case-insensitive) y g (global)
// ============================================================
// Analogía: `i` es ponerte gafas que ignoran mayúsculas — "ERROR",
// "Error" y "error" se ven igual. `g` es pasar de "encuentra el primero"
// a "encuéntralos TODOS", como un Ctrl+F que cuenta cada ocurrencia.
// Pero `g` tiene memoria (lastIndex): se acuerda de dónde se quedó.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { LOG_BLOB } from "../data/samples";
console.log("\n===== 4.3 Banderas i (case-insensitive) y g (global) =====");

// ------------------------------------------------------------
// 1) Flag i: búsqueda sin distinguir mayúsculas/minúsculas
// ------------------------------------------------------------
// Los logs no siempre normalizan el case del nivel. Con `i`, un solo
// patrón cubre "error", "Error", "ERROR".
const reErrorCI = /error/i;
checkMatch(reErrorCI, "ERROR", true);
checkMatch(reErrorCI, "Error", true);
checkMatch(reErrorCI, "error", true);
// Sin la flag, solo cae la forma EXACTA.
const reErrorCS = /error/;
checkMatch(reErrorCS, "ERROR", false);
checkMatch(reErrorCS, "error", true);

// ------------------------------------------------------------
// 2) Flag g: encontrar TODAS las ocurrencias (find-all / contar)
// ------------------------------------------------------------
// String.match con flag g devuelve el ARRAY de todas las coincidencias
// (no los grupos). Es la forma rápida de CONTAR.
// En LOG_BLOB hay 3 [INFO], 2 [WARN], 1 [ERROR] (6 líneas en total).
const infos = LOG_BLOB.match(/INFO/g); // string[] | null
const warns = LOG_BLOB.match(/WARN/g);
const errores = LOG_BLOB.match(/ERROR/g);
check("conteo de INFO", infos?.length ?? 0, 3);
check("conteo de WARN", warns?.length ?? 0, 2);
check("conteo de ERROR", errores?.length ?? 0, 1);

// matchAll: itera coincidencias CON sus grupos. REQUIERE flag g
// (sin g lanza TypeError). Aquí capturamos el nivel de cada línea.
const reNivel = /\[(INFO|WARN|ERROR)\]/g;
const niveles = [...LOG_BLOB.matchAll(reNivel)].map((m) => m[1]);
check("niveles en orden de aparición", niveles, [
  "INFO",
  "INFO",
  "WARN",
  "ERROR",
  "WARN",
  "INFO",
]);

// ------------------------------------------------------------
// 3) g + i juntas: contar "error" sin importar el case
// ------------------------------------------------------------
const textoMixto = "Error aquí, ERROR allá, error acá, terrorífico";
// ⚠️ Sin \b, "terrorífico" CONTIENE "error" → 4 matches, no 3.
const todosError = textoMixto.match(/error/gi);
check("con g+i (sin \\b) caen 4 (incluye 'tERRORífico')", todosError?.length ?? 0, 4);
// Con \b solo cuentan las 3 palabras sueltas.
const soloPalabra = textoMixto.match(/\berror\b/gi);
check("con g+i+\\b caen solo 3 palabras sueltas", soloPalabra?.length ?? 0, 3);

// ------------------------------------------------------------
// 4) ⚠️ LA TRAMPA DE g: .exec() guarda estado en lastIndex
// ------------------------------------------------------------
// Con flag g, una MISMA instancia de regex recuerda dónde terminó el
// último match en su propiedad `lastIndex`. Cada .exec() avanza desde ahí
// hasta que devuelve null y entonces lastIndex se REINICIA a 0.
// Analogía QA: es un objeto con ESTADO mutable — reusarlo en otra
// búsqueda sin resetear da resultados "fantasma". Demostrémoslo:
const reEstado = /\d+/g;
const entrada = "a1b22c333";

check("lastIndex inicia en 0", reEstado.lastIndex, 0);

const m1 = reEstado.exec(entrada); // encuentra "1"
check("1er exec captura '1'", m1 ? m1[0] : null, "1");
check("lastIndex tras 1er exec", reEstado.lastIndex, 2);

const m2 = reEstado.exec(entrada); // continúa desde lastIndex → "22"
check("2do exec captura '22'", m2 ? m2[0] : null, "22");
check("lastIndex tras 2do exec", reEstado.lastIndex, 5);

const m3 = reEstado.exec(entrada); // continúa → "333"
check("3er exec captura '333'", m3 ? m3[0] : null, "333");
check("lastIndex tras 3er exec", reEstado.lastIndex, 9);

const m4 = reEstado.exec(entrada); // no quedan más → null y RESET
check("4to exec devuelve null", m4, null);
check("lastIndex se reinicia a 0 tras null", reEstado.lastIndex, 0);

// ------------------------------------------------------------
// 5) El bug clásico de reusar una regex /g con .test() en un bucle
// ------------------------------------------------------------
// .test() con flag g TAMBIÉN avanza lastIndex. Si reusas la MISMA
// instancia, el 2º .test() empieza donde quedó el 1º → resultado distinto
// sobre el MISMO input. Por eso checkMatch usa una copia SIN g.
const reBug = /1/g;
const primero = reBug.test("1"); // true, lastIndex → 1
const segundo = reBug.test("1"); // false: ya no hay '1' desde índice 1
check("1er .test('1') con /g", primero, true);
check("2do .test('1') con /g (¡mismo input, otro resultado!)", segundo, false);
check("lección: reiniciar lastIndex evita el fantasma", (reBug.lastIndex = 0), 0);
