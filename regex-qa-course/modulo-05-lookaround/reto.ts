// 🚩 Reto QA — Módulo 5: "Política y enmascarado"
// ============================================================
// Instrucciones:
//   1. Eres responsable de DOS controles de seguridad en OmniPizza:
//        (a) Validar que una contraseña cumpla la política corporativa.
//        (b) Enmascarar el email que aparece en una línea de log.
//   2. Completa las dos partes marcadas con `// TODO:` (ahora son
//      placeholders que NO funcionan): la regex de política `rePassword`
//      y la regex/replace de enmascarado del email.
//   3. Ejecuta: pnpm tsx modulo-05-lookaround/reto.ts
//
//   Es ESPERADO que veas ❌ hasta que completes las dos partes. El reto
//   está RESUELTO cuando:
//     - TODAS las contraseñas válidas pasan y TODAS las inválidas se
//       rechazan, y
//     - el email del log queda enmascarado (sin exponer usuario ni
//       dominio reales).
//   Pistas:
//     - Política: apila lookahead (?=.*X) anclados con ^ ... $ —
//       ≥8 chars, al menos un dígito, una mayúscula y un símbolo.
//     - Enmascarado: usa una regex de email global y reemplázalo por
//       "<EMAIL>" (o conserva la inicial con un lookbehind, si te animas).
// ============================================================
import { check, checkMatch } from "../helpers/check";
import {
  PASSWORDS_VALIDAS,
  PASSWORDS_INVALIDAS,
  LINEA_LOG_CON_EMAIL,
} from "../data/samples";

console.log("\n===== 🚩 Reto 5: Política y enmascarado =====");

// ------------------------------------------------------------
// PARTE A — Política de contraseñas
// ------------------------------------------------------------
// TODO: define la política real apilando lookahead anclados.
//   Requisitos: ≥8 caracteres, ≥1 dígito, ≥1 mayúscula, ≥1 símbolo.
//   Sugerencia de forma: /^(?=.*\d)(?=.*[A-Z])(?=.*[ ... ]).{8,}$/
const rePassword = /CAMBIAME/; // TODO: completar la regex de política

console.log("--- Contraseñas que DEBEN pasar ---");
for (const p of PASSWORDS_VALIDAS) checkMatch(rePassword, p, true);
console.log("--- Contraseñas que DEBEN rechazarse ---");
for (const p of PASSWORDS_INVALIDAS) checkMatch(rePassword, p, false);

// ------------------------------------------------------------
// PARTE B — Enmascarar el email de una línea de log
// ------------------------------------------------------------
// TODO: reemplaza el email incrustado en LINEA_LOG_CON_EMAIL por un texto
//   enmascarado para que el log no filtre PII. Define tu regex y tu
//   reemplazo. (Con el placeholder de abajo, la línea NO cambia, por eso
//   la aserción falla hasta que lo resuelvas.)
const reEmail = /CAMBIAME/; // TODO: regex que detecte el email (usa flag g)
const logEnmascarado = LINEA_LOG_CON_EMAIL.replace(reEmail, "$&"); // TODO: cambia "$&" por tu reemplazo

// El log enmascarado NO debe contener el usuario ni el dominio reales.
check("el log ya no expone el usuario real", logEnmascarado.includes("ana.tester"), false);
check("el log ya no expone el dominio real", logEnmascarado.includes("omnipizza.test"), false);
// ...pero SÍ debe conservar el resto del contexto del log.
check("el log conserva su contexto", logEnmascarado.includes("[INFO]") && logEnmascarado.includes("from MX"), true);

console.log(
  "\nPista: cuando termines, todas las filas deben mostrar ✅ — las " +
    "contraseñas correctamente clasificadas y el email del log enmascarado."
);
