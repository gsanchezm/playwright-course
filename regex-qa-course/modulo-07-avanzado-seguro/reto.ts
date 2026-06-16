// 🚩 Reto QA — Módulo 7: "Repara la regex insegura"
// ============================================================
// Contexto:
//   OmniPizza valida los "handles" (nombres de usuario público) que la
//   gente teclea al registrarse. El validador actual usa una regex
//   VULNERABLE a ReDoS y, además, rechaza nombres internacionales válidos
//   (no es Unicode-safe). Un atacante puede mandar un handle diseñado para
//   colgar el servidor; y un cliente de México o Tōkyō no puede registrarse.
//
// Tu misión (3 partes):
//   1. SEGURIDAD: reemplaza la regex vulnerable por una EQUIVALENTE y
//      SEGURA (sin cuantificadores anidados solapados; anclada; acotada).
//   2. UNICODE: que acepte letras acentuadas / de otros alfabetos usando
//      \p{L} con la flag 'u' (NO el \w ASCII).
//   3. DATA-DRIVEN: deja que pasen TODOS los `HANDLES_VALIDOS` y se
//      rechacen TODOS los `HANDLES_INVALIDOS` de abajo.
//
// ⚠️⚠️ SEGURIDAD AL PROBAR (no negociable):
//   NUNCA corras la regex vulnerable contra un input largo. Los inputs de
//   demo de este archivo son CORTOS (≤ 12 caracteres) a propósito. Si
//   experimentas, mantén cualquier cadena de prueba en ≤ 12 caracteres.
//   Reproducir el cuelgue NO es parte del reto: reconocerlo y arreglarlo sí.
//
// Cómo correr:
//   pnpm tsx modulo-07-avanzado-seguro/reto.ts
//   (Es ESPERADO ver ❌ hasta que completes los TODO. El archivo corre sin
//    crashear y SIN colgarse desde el primer momento.)
// ============================================================
import { checkMatch } from "../helpers/check";

console.log("\n===== 🚩 Reto 7: Repara la regex insegura =====");

// ------------------------------------------------------------
// LA REGEX VULNERABLE (NO la uses en producción; está aquí como "antes").
// ------------------------------------------------------------
// Problemas:
//   (a) (\w+)+  → cuantificador ANIDADO solapado = backtracking exponencial
//       (ReDoS) cuando el input falla al final. Mismo ADN que /(a+)+$/ de 7.1.
//   (b) \w es ASCII → rechaza 'é', 'ō', 'ü'... (no Unicode-safe).
//   (c) sin techo de longitud → nada acota cuántos caracteres procesa.
const REGEX_VULNERABLE = /^(\w+)+$/;

// ------------------------------------------------------------
// CASOS (la especificación viva — NO los edites; haz que tu regex los cumpla).
// ------------------------------------------------------------
// Reglas del handle OmniPizza:
//   • Solo LETRAS (de cualquier idioma) y dígitos. Sin espacios ni símbolos.
//   • Entre 3 y 12 caracteres.
// Todos los inputs de demo son CORTOS (≤ 12 chars) → seguros incluso contra
// la regex vulnerable.
const HANDLES_VALIDOS = [
  "ana123", // ASCII clásico
  "México", // acento → exige \p{L} (6 chars)
  "Tōkyō", // macrones japoneses (5 chars)
  "Zürich2", // umlaut + dígito (7 chars)
  "qaTeam", // mixto (6 chars)
];
const HANDLES_INVALIDOS = [
  "ab", // 2 chars: muy corto (mín. 3)
  "ana qa", // espacio: no permitido
  "ana!", // símbolo '!': no permitido
  "trececharsss1", // 13 chars: excede el máximo de 12
  "handle_corto", // 12 chars pero el '_' NO es letra ni dígito → inválido
];

// ------------------------------------------------------------
// TODO (1+2+3): tu versión SEGURA + Unicode-safe + acotada.
// ------------------------------------------------------------
// Pistas:
//   • Letra Unicode O dígito:   [\p{L}\p{N}]   (recuerda la flag 'u')
//   • Sin anidar: una sola repetición acotada {3,12}, NADA de (...)+
//   • Anclada de punta a punta: ^ ... $
//   • Forma objetivo (descúbrela tú):  /^[ ... ]{ ... , ... }$/u
const REGEX_SEGURA = /CAMBIAME/; // TODO: reemplaza por tu regex segura y Unicode-safe

// ------------------------------------------------------------
// Runner del reto (NO lo toques). Mientras REGEX_SEGURA sea /CAMBIAME/
// verás ❌; cuando la completes bien, TODO debe quedar en ✅.
// ------------------------------------------------------------
console.log("--- (referencia) la regex vulnerable, probada SOLO en inputs cortos ---");
// Demostración segura (inputs ≤ 6 chars): la vieja regex acepta ASCII pero
// RECHAZA Unicode (el bug de i18n) y, encima, es ReDoS. Por eso debe morir.
checkMatch(REGEX_VULNERABLE, "ana123", true); // ASCII: la vieja regex sí lo acepta
checkMatch(REGEX_VULNERABLE, "México", false); // \w es ASCII: la 'é' hace que la RECHACE (bug)

console.log("--- Tu REGEX_SEGURA debe ACEPTAR estos (válidos) ---");
for (const h of HANDLES_VALIDOS) checkMatch(REGEX_SEGURA, h, true);

console.log("--- Tu REGEX_SEGURA debe RECHAZAR estos (inválidos) ---");
for (const h of HANDLES_INVALIDOS) checkMatch(REGEX_SEGURA, h, false);

console.log(
  "\nPista final: cuando termines, los 5 válidos salen ✅ y los inválidos " +
    "también ✅ (porque se rechazan como se espera). Y tu regex NO tiene " +
    "ningún (X+)+ : esa es la prueba de que mataste el ReDoS."
);
