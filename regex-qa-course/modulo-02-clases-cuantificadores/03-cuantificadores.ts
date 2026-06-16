// ============================================================
// Mini-clase 2.3: Cuantificadores — * + ? {n} {n,} {n,m}
// ============================================================
// Analogía: un cuantificador dice CUÁNTAS VECES se repite lo de su
// izquierda, igual que el "número de reintentos" de un test flaky. ?=0 o 1
// reintento, +=al menos 1, *=cero o muchos, {3}=exactamente 3, {2,5}=entre
// 2 y 5. Elegir mal el rango es como poner retries:0 a un test que sí los
// necesitaba (falla de más) o retries:99 a uno determinista (oculta bugs).
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 2.3 Cuantificadores =====");

// ⚠️ RECORDATORIO: checkMatch usa .test() (busca SUBCADENA). Para demostrar
//    que un cuantificador RECHAZA un exceso/defecto, hay que ANCLAR con
//    ^...$; si no, una subcadena válida haría "coincidir" igual. Cada
//    bloque marca claramente cuándo el anclaje es imprescindible.

// ------------------------------------------------------------
// 1) *  → CERO o más (puede no aparecer)
// ------------------------------------------------------------
// "ab*" = una 'a' seguida de cero o más 'b'. La 'a' sola también vale.
const reAbEstrella = /^ab*$/;
checkMatch(reAbEstrella, "a", true);     // cero 'b'
checkMatch(reAbEstrella, "ab", true);    // una 'b'
checkMatch(reAbEstrella, "abbbb", true); // muchas 'b'
checkMatch(reAbEstrella, "b", false);    // falta la 'a' inicial

// ------------------------------------------------------------
// 2) +  → UNA o más (debe aparecer al menos una vez)
// ------------------------------------------------------------
// Diferencia clave con *: + exige presencia. "ab+" rechaza la 'a' sola.
const reAbMas = /^ab+$/;
checkMatch(reAbMas, "ab", true);
checkMatch(reAbMas, "abbb", true);
checkMatch(reAbMas, "a", false); // cero 'b' NO basta para '+'

// ------------------------------------------------------------
// 3) ?  → CERO o uno (opcional)
// ------------------------------------------------------------
// "colou?r" matchea las dos ortografías: "color" (US) y "colour" (UK).
// La 'u' es opcional. Ejemplo QA: tolerar variantes de un mismo texto.
const reColor = /^colou?r$/;
checkMatch(reColor, "color", true);   // sin 'u'
checkMatch(reColor, "colour", true);  // con 'u'
checkMatch(reColor, "colouur", false); // dos 'u' → '?' solo admite 0 o 1

// ------------------------------------------------------------
// 4) {n}  → EXACTAMENTE n veces
// ------------------------------------------------------------
// "\d{4}" = exactamente 4 dígitos (p.ej. el año, o el bloque del SKU).
// Aquí el ANCLAJE es crítico: sin ^...$, "\d{4}" coincidiría con "12345"
// (encuentra 4 dígitos dentro). Anclado, exige que TODO sean 4 dígitos.
const reCuatroDigitos = /^\d{4}$/;
checkMatch(reCuatroDigitos, "2026", true);
checkMatch(reCuatroDigitos, "123", false);   // solo 3 → falta uno
checkMatch(reCuatroDigitos, "12345", false); // 5 → sobra uno (gracias a $)
// Demostración del peligro de NO anclar: la versión suelta SÍ "coincide"
// con 5 dígitos porque encuentra 4 adentro (falso positivo de QA).
checkMatch(/\d{4}/, "12345", true);

// ------------------------------------------------------------
// 5) {n,}  → n o MÁS (mínimo n, sin tope)
// ------------------------------------------------------------
// "\d{2,}" = al menos 2 dígitos. Útil para "mínimo de longitud".
const reMinDosDigitos = /^\d{2,}$/;
checkMatch(reMinDosDigitos, "12", true);
checkMatch(reMinDosDigitos, "123456", true);
checkMatch(reMinDosDigitos, "7", false); // 1 dígito < mínimo 2

// ------------------------------------------------------------
// 6) {n,m}  → ENTRE n y m (rango inclusivo)
// ------------------------------------------------------------
// "a{2,3}" = dos o tres 'a'. ⚠️ Para ver que RECHAZA 4 'a' hay que anclar:
// /a{2,3}/.test("aaaa") es TRUE (encuentra "aaa" como subcadena). Solo
// /^a{2,3}$/ rechaza "aaaa" correctamente.
const reDosOTresA = /^a{2,3}$/;
checkMatch(reDosOTresA, "aa", true);
checkMatch(reDosOTresA, "aaa", true);
checkMatch(reDosOTresA, "a", false);    // muy pocas
checkMatch(reDosOTresA, "aaaa", false); // demasiadas (el $ lo atrapa)
// El contraste que justifica el anclaje:
checkMatch(/a{2,3}/, "aaaa", true); // SIN anclar: "aaa" adentro → coincide

// ------------------------------------------------------------
// 7) Mini-aplicación QA: un PIN de 4 a 6 dígitos
// ------------------------------------------------------------
// Combina clase predefinida + rango de cuantificador + anclaje.
const rePin = /^\d{4,6}$/;
checkMatch(rePin, "1234", true);    // 4 → mínimo
checkMatch(rePin, "123456", true);  // 6 → máximo
checkMatch(rePin, "123", false);    // 3 → corto
checkMatch(rePin, "1234567", false); // 7 → largo

// ------------------------------------------------------------
// 8) Cuantificador sobre un GRUPO () (adelanto de M03)
// ------------------------------------------------------------
// El cuantificador aplica a TODO lo que tiene a su izquierda inmediata.
// Si es un grupo (...), repite el grupo entero. "(ab)+" = "ab" repetido.
const reGrupoRepetido = /^(ab)+$/;
checkMatch(reGrupoRepetido, "ab", true);
checkMatch(reGrupoRepetido, "abab", true);
checkMatch(reGrupoRepetido, "aba", false); // "abab" sí, "aba" no completa el par

// Verificación de razonamiento: contar repeticiones con match()+g.
const repetido = "abababab";
const pares = repetido.match(/ab/g); // cada "ab" por separado
check("cuántos 'ab' hay en 'abababab'", pares ? pares.length : 0, 4);
