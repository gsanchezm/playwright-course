// ============================================================
// Mini-clase 5.4: Política de contraseñas con múltiples lookahead
// ============================================================
// Analogía: es la "checklist del formulario de registro". Cada lookahead
// es una casilla que DEBE quedar marcada (tiene mayúscula ✔, tiene dígito
// ✔, tiene símbolo ✔, mide ≥8 ✔). Como un test con varios asserts: si
// uno falla, la contraseña entera se rechaza. EL caso QA por excelencia.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { PASSWORDS_VALIDAS, PASSWORDS_INVALIDAS } from "../data/samples";
console.log("\n===== 5.4 Política de contraseñas con múltiples lookahead =====");

// ------------------------------------------------------------
// La IDEA clave: lookahead apilado = condiciones INDEPENDIENTES y "AND"
// ------------------------------------------------------------
// Validar "tiene mayúscula Y dígito Y símbolo" en UN solo paso es difícil
// con regex normal, porque esos caracteres pueden estar en CUALQUIER
// orden. La solución elegante: anclar en ^ y apilar varios lookahead de
// ancho cero. Cada (?=.*X) dice "mirando desde el inicio, en algún punto
// aparece una X". Como NO consumen, todos miran la MISMA cadena completa,
// independientes entre sí. Es una conjunción lógica (AND) hecha de asserts.
//
// Desglose pieza por pieza:
//   ^                  empieza al inicio (los lookahead miran todo)
//   (?=.*\d)           ...en algún lugar hay un dígito
//   (?=.*[A-Z])        ...en algún lugar hay una mayúscula (ASCII)
//   (?=.*[^A-Za-z0-9]) ...en algún lugar hay un símbolo (no-alfanumérico)
//   .{8,}              y la cadena mide al menos 8 caracteres
//   $                  hasta el final
const rePassword = /^(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

// ------------------------------------------------------------
// Caso QA por excelencia: validar los lotes del contrato de datos
// ------------------------------------------------------------
console.log("--- Contraseñas VÁLIDAS (deben pasar TODAS las casillas) ---");
for (const p of PASSWORDS_VALIDAS) checkMatch(rePassword, p, true);
// Por qué pasan (razonado a mano):
//  "Pizza123!"    → 'P' may, '1' díg, '!' símbolo, 9 chars  → ✔
//  "QAteam#2026"  → 'Q' may, '2' díg, '#' símbolo, 11 chars → ✔
//  "Str0ng$Pass"  → 'S' may, '0' díg, '$' símbolo, 11 chars → ✔

console.log("--- Contraseñas INVÁLIDAS (cada una rompe una casilla) ---");
for (const p of PASSWORDS_INVALIDAS) checkMatch(rePassword, p, false);
// Por qué fallan (qué casilla NO marcan):
//  "pizza"       → sin díg, sin may, sin símbolo, <8       → falla
//  "password"    → sin díg, sin may, sin símbolo           → falla
//  "ALLUPPER1"   → tiene may y díg, pero NINGÚN símbolo    → falla
//  "NoSymbol123" → tiene may y díg, pero NINGÚN símbolo    → falla
//  "short1!"     → tiene díg y símbolo, pero sin may y <8  → falla

// ------------------------------------------------------------
// Diagnóstico granular: un test bueno dice QUÉ regla falló
// ------------------------------------------------------------
// En QA real, "contraseña inválida" no basta: el usuario quiere saber
// QUÉ le falta. Cada regla se prueba por separado (lookahead aislado o,
// para la longitud, una comparación directa). Esto modela el típico
// "mensaje de error campo por campo" de un formulario.
function diagnosticar(pwd: string) {
  return {
    largo: /^.{8,}$/.test(pwd),       // ≥ 8 caracteres
    digito: /(?=.*\d)/.test(pwd),     // al menos un dígito
    mayuscula: /(?=.*[A-Z])/.test(pwd), // al menos una mayúscula
    simbolo: /(?=.*[^A-Za-z0-9])/.test(pwd), // al menos un símbolo
  };
}

// "ALLUPPER1": cumple largo (9), dígito ('1') y mayúscula, pero le falta
// el símbolo. El diagnóstico debe señalar exactamente eso.
check("diagnóstico de 'ALLUPPER1'", diagnosticar("ALLUPPER1"), {
  largo: true,
  digito: true,
  mayuscula: true,
  simbolo: false, // ← la única casilla sin marcar
});

// "short1!": tiene dígito y símbolo, pero es corta (7) y sin mayúscula.
check("diagnóstico de 'short1!'", diagnosticar("short1!"), {
  largo: false,     // mide 7
  digito: true,
  mayuscula: false, // todo minúsculas
  simbolo: true,
});

// ------------------------------------------------------------
// Sutileza importante: el ORDEN de los lookahead no cambia el resultado
// ------------------------------------------------------------
// Como cada lookahead es independiente y de ancho cero, reordenarlos da
// EXACTAMENTE el mismo veredicto. Lo verificamos con una variante que
// apila las mismas reglas en otro orden: idéntica decisión.
const reReordenada = /^(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*\d).{8,}$/;
for (const p of PASSWORDS_VALIDAS) {
  check(
    `orden de lookahead no afecta a '${p}'`,
    reReordenada.test(p),
    rePassword.test(p)
  );
}
