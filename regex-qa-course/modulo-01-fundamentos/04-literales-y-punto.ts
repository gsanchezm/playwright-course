// ============================================================
// Mini-clase 1.4: Caracteres literales, el punto (.) y escapar metacaracteres
// ============================================================
// Analogía: en una regex la mayoría de los caracteres son LITERALES (se
// matchean a sí mismos, como texto exacto en un assertion), pero un puñado
// son "metacaracteres" con poderes especiales — son los operadores del
// lenguaje. Confundir un metacaracter con texto literal es como olvidar
// escapar comillas en un CSV: el dato se interpreta como sintaxis y rompe.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 1.4 Caracteres literales, el punto y escapar metacaracteres =====");

// ------------------------------------------------------------
// 1) Caracteres LITERALES: la mayoría se matchea a sí mismo.
// ------------------------------------------------------------
// Letras, dígitos y muchos símbolos no tienen poderes: "PROD" matchea el
// texto "PROD" tal cual. Es el comportamiento "obvio" y el más común.
checkMatch(/PROD/, "deploy a PROD", true);
checkMatch(/PROD/, "deploy a QA", false);

// ------------------------------------------------------------
// 2) El metacaracter PUNTO (.) = "cualquier carácter (menos salto de línea)".
// ------------------------------------------------------------
// Es un COMODÍN. /PZ./ significa "PZ seguido de UN carácter cualquiera".
const rePuntoComodin = /PZ./;
checkMatch(rePuntoComodin, "PZ-", true); // el '.' matchea el guion
checkMatch(rePuntoComodin, "PZ9", true); // ...o un dígito
checkMatch(rePuntoComodin, "PZ", false); // pero EXIGE un carácter: "PZ" solo, no
// ⚠️ Trampa de QA: si quieres validar un punto LITERAL (p.ej. en "v1.2") y
// usas '.' sin escapar, tu validación es demasiado PERMISIVA: aceptará
// basura. Mira cómo /v1.2/ acepta "v1X2", que NO es una versión válida:
checkMatch(/v1.2/, "v1X2", true); // ❌ semánticamente: coló un impostor

// ------------------------------------------------------------
// 3) ESCAPAR un metacaracter con barra invertida → lo vuelve literal.
// ------------------------------------------------------------
// Para matchear un punto REAL, escríbelo como \. Ahora /v1\.2/ exige el
// punto exacto y rechaza "v1X2". Esta es la versión CORRECTA del check.
const reVersion = /v1\.2/;
checkMatch(reVersion, "v1.2", true); // punto literal: ✅
checkMatch(reVersion, "v1X2", false); // ya NO cuela el impostor: ✅

// ------------------------------------------------------------
// 4) Los metacaracteres que SIEMPRE hay que escapar si los quieres literales:
//      . \ * + ? ( ) [ ] { } ^ $ |
// ------------------------------------------------------------
// Cada uno tiene un poder especial; con barra invertida se "apagan" y se
// matchean como texto. Validemos algunos artefactos típicos de QA:

// El '$' es ancla de "fin de línea"; escapado matchea el símbolo de dólar.
checkMatch(/\$\d+\.\d{2}/, "$19.99", true); // precio en USD literal
// El '+' significa "uno o más"; escapado matchea el signo de prefijo telef.
checkMatch(/\+52/, "+52 55 1234 5678", true); // prefijo de México literal
// Los paréntesis agrupan; escapados matchean paréntesis de un teléfono US.
checkMatch(/\(415\)/, "+1 (415) 555-0123", true);
// El '?' significa "opcional"; escapado matchea un signo de pregunta en una
// query string. El '|' (alternancia) lo dejamos literal con \|.
checkMatch(/catalog\?market=MX/, "/catalog?market=MX", true);

// ------------------------------------------------------------
// 5) Escapar datos dinámicos: la utilidad "escapeRegExp".
// ------------------------------------------------------------
// Cuando construyes una regex a partir de un DATO (1.2), debes escapar sus
// metacaracteres o se interpretarán como sintaxis. Esta función reemplaza
// cada metacaracter por su versión escapada (\ + el carácter).
function escapeRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& = la coincidencia
}
// Queremos buscar el TEXTO literal "total=249.00 (MXN)", que trae '.', '(' y
// ')'. Sin escapar, esos chars romperían el patrón. Con escapeRegExp es seguro.
const dato = "total=249.00 (MXN)";
const reSegura = new RegExp(escapeRegExp(dato));
check("escapeRegExp neutraliza los metacaracteres", reSegura.source, "total=249\\.00 \\(MXN\\)");
checkMatch(reSegura, "log: total=249.00 (MXN) ok", true);
// Y NO cuela un impostor donde el '.' fuera un comodín (p.ej. "249X00"):
checkMatch(reSegura, "log: total=249X00 (MXN) ok", false);
