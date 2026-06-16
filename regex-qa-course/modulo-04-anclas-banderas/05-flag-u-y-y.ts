// ============================================================
// Mini-clase 4.5: Banderas u (Unicode) y y (sticky) — breve
// ============================================================
// Analogía: `u` enseña a la regex que un emoji 🍕 es UN caracter, no
// dos cachos sueltos de bytes. `y` (sticky/pegajosa) es un cabezal
// lector que solo acepta match EXACTAMENTE donde dejó el cursor — ideal
// para tokenizers/parsers que avanzan caracter por caracter sin huecos.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 4.5 Banderas u (Unicode) y y (sticky) =====");

// ------------------------------------------------------------
// 1) Flag u: trata el patrón y el texto por PUNTOS DE CÓDIGO Unicode
// ------------------------------------------------------------
// Sin `u`, JavaScript ve los caracteres "fuera del BMP" (como 🍕) como
// DOS unidades UTF-16 ("surrogate pair"). Por eso /^.$/ (un solo caracter)
// FALLA con "🍕": el . solo matchea una de las dos mitades.
// Con `u`, el motor entiende que 🍕 es UN punto de código → /^.$/u sí casa.
checkMatch(/^.$/, "🍕", false); // sin u: 🍕 cuenta como 2 → "un caracter" falla
checkMatch(/^.$/u, "🍕", true); // con u: 🍕 es 1 caracter → casa

// La diferencia se ve también en cómo el motor mide la longitud lógica:
// .length de la cadena sigue siendo 2 (unidades UTF-16), pero la regex
// con `u` razona por punto de código.
check("'🍕'.length es 2 unidades UTF-16", "🍕".length, 2);

// `u` también habilita escapes Unicode como \u{...} y las propiedades
// \p{...}. Aquí solo lo mencionamos: el tratamiento profundo de Unicode
// (acentos, \p{L}, normalización, emojis compuestos) se ve en el MÓDULO 7.
const reCodepoint = /^\u{1F355}$/u; // 1F355 = 🍕
checkMatch(reCodepoint, "🍕", true);
// 👉 Profundizamos en Unicode (\p{...}, \w vs letras acentuadas) en M07.

// ------------------------------------------------------------
// 2) Flag y (sticky): match ANCLADO a lastIndex, sin "saltar" huecos
// ------------------------------------------------------------
// Recordatorio (4.3): con `g`, .exec() BUSCA hacia adelante desde
// lastIndex (puede saltarse caracteres que no calzan). Con `y`, el match
// debe ocurrir JUSTO en lastIndex; si ahí no calza, devuelve null (no
// busca más adelante). Esa rigidez es exactamente lo que necesita un
// tokenizer: "consume el siguiente token AQUÍ o falla".
const entrada = "12ab34";

// --- Con g: salta el "ab" y encuentra ambos grupos de dígitos ---
const reG = /\d+/g;
const g1 = reG.exec(entrada);
check("g: 1er exec captura '12'", g1 ? g1[0] : null, "12");
const g2 = reG.exec(entrada); // SALTA "ab" y sigue buscando → "34"
check("g: 2do exec SALTA 'ab' y captura '34'", g2 ? g2[0] : null, "34");

// --- Con y: tras "12", en lastIndex hay 'a' → NO calza → null ---
const reY = /\d+/y;
const y1 = reY.exec(entrada); // calza en índice 0 → "12", lastIndex → 2
check("y: 1er exec captura '12'", y1 ? y1[0] : null, "12");
check("y: lastIndex avanzó a 2", reY.lastIndex, 2);
const y2 = reY.exec(entrada); // en índice 2 hay 'a', no \d → null (NO salta)
check("y: 2do exec devuelve null (no salta 'ab')", y2, null);
check("y: lastIndex se reinicia a 0 tras null", reY.lastIndex, 0);

// ------------------------------------------------------------
// 3) Mini-tokenizer con y: avanzar SIN huecos desde el cursor
// ------------------------------------------------------------
// "K=12;V=34" → leemos tokens contiguos. y garantiza que no haya basura
// silenciosamente saltada: cada token empieza donde terminó el anterior.
const fuente = "K=12;V=34";
const reToken = /([A-Z])=(\d+);?/y; // letra, '=', dígitos, ';' opcional
const tokens: Array<{ clave: string; valor: string }> = [];
let m: RegExpExecArray | null;
while ((m = reToken.exec(fuente)) !== null) {
  tokens.push({ clave: m[1], valor: m[2] });
}
check("tokenizado con y", tokens, [
  { clave: "K", valor: "12" },
  { clave: "V", valor: "34" },
]);
// Tras consumir todo, exec devolvió null y lastIndex volvió a 0.
check("y: lastIndex en 0 al terminar el tokenizado", reToken.lastIndex, 0);
