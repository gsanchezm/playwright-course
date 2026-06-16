// ============================================================
// Mini-clase 2.1: Clases de caracteres — [abc], rangos y negación
// ============================================================
// Analogía: una clase de caracteres es la "lista de invitados" de UNA
// posición del texto. Igual que un test parametrizado acepta solo ciertos
// valores en un campo, [abc] dice "en este hueco solo dejo pasar a, b o c".
// El rango [a-z] es esa lista escrita de forma compacta, y [^...] es la
// lista negra: "todos MENOS estos".
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 2.1 Clases de caracteres =====");

// ------------------------------------------------------------
// 1) [abc] — un caracter de un CONJUNTO explícito
// ------------------------------------------------------------
// [gato] NO significa "la palabra gato": significa "una de las letras
// g, a, t u o". Una clase siempre representa UN solo caracter.
// ⚠️ Recordatorio del contrato: checkMatch usa .test(), que busca una
//    SUBCADENA. Por eso /[abc]/ "matchea" cualquier texto que CONTENGA
//    una a, b o c en algún lado. Para afirmar sobre TODO el dato, anclamos.
const reVocalSimple = /[abc]/;
checkMatch(reVocalSimple, "a", true);   // contiene 'a'
checkMatch(reVocalSimple, "xby", true); // contiene 'b' en medio
checkMatch(reVocalSimple, "xyz", false); // ninguna de a/b/c

// Anclado: ahora exigimos que el dato sea EXACTAMENTE un caracter de [abc].
const reUnaSolaLetra = /^[abc]$/;
checkMatch(reUnaSolaLetra, "a", true);
checkMatch(reUnaSolaLetra, "ab", false); // dos caracteres → no calza ^...$
checkMatch(reUnaSolaLetra, "d", false);

// ------------------------------------------------------------
// 2) RANGOS — [a-z], [0-9], [A-Za-z0-9]
// ------------------------------------------------------------
// El guion DENTRO de una clase y ENTRE dos caracteres significa "rango".
// [a-z] = las 26 minúsculas. [0-9] = los 10 dígitos. Puedes combinar
// varios rangos en la misma clase: [a-z0-9] = "minúscula o dígito".
const reLetraMinuscula = /^[a-z]$/;
checkMatch(reLetraMinuscula, "q", true);
checkMatch(reLetraMinuscula, "Q", false); // mayúscula NO está en a-z
checkMatch(reLetraMinuscula, "5", false);

const reAlfanumerico = /^[a-z0-9]$/;
checkMatch(reAlfanumerico, "k", true);
checkMatch(reAlfanumerico, "7", true);
checkMatch(reAlfanumerico, "-", false); // el guion (fuera de rango) no entra

// Caso QA típico: un "slug" de ambiente como "qa1" = minúsculas y dígitos.
// Aquí SÍ usamos un cuantificador (adelanto de 2.3) para varios caracteres.
const reSlugAmbiente = /^[a-z0-9]+$/;
checkMatch(reSlugAmbiente, "qa1", true);
checkMatch(reSlugAmbiente, "prod-2", false); // el guion rompe el slug

// ------------------------------------------------------------
// 3) NEGACIÓN — [^...] significa "cualquier caracter EXCEPTO estos"
// ------------------------------------------------------------
// El ^ AL INICIO de la clase la invierte. ⚠️ Trampa clásica: el ^ solo
// niega cuando está como PRIMER caracter de la clase. [a^b] es la lista
// a, ^, b (el ^ es literal ahí). En cambio [^ab] = "ni a ni b".
const reNoVocalAbc = /^[^abc]$/;
checkMatch(reNoVocalAbc, "z", true);  // z no es a/b/c → pasa
checkMatch(reNoVocalAbc, "a", false); // a está prohibida

// ⚠️ Sin anclar, [^abc] solo pide UN caracter que no sea a/b/c EN ALGÚN
//    lugar del texto. Por eso "abcd" SÍ coincide (la 'd' cumple). Es el
//    error de QA de "el test pasó por la razón equivocada": creías validar
//    todo el dato y solo encontraste un caracter suelto.
const reContieneNoAbc = /[^abc]/;
checkMatch(reContieneNoAbc, "abcd", true);  // la 'd' cumple → coincide
checkMatch(reContieneNoAbc, "abc", false);  // todo es a/b/c → no hay "otro"

// Uso real: detectar un campo "no vacío y sin espacios". [^\s] (ver 2.2)
// es lo común, pero con clase explícita: "todo menos espacio ni tab".
const reSinEspacios = /^[^ \t]+$/;
checkMatch(reSinEspacios, "OmniPizza", true);
checkMatch(reSinEspacios, "Omni Pizza", false); // tiene espacio → falla

// ------------------------------------------------------------
// 4) Caracteres "especiales" que se vuelven literales dentro de []
// ------------------------------------------------------------
// Dentro de una clase, muchos metacaracteres pierden su poder: el punto
// '.' es un punto literal, no "cualquier cosa". Útil para validar, p.ej.,
// los separadores permitidos en un identificador.
const rePuntoLiteral = /^[.]$/;
checkMatch(rePuntoLiteral, ".", true);
checkMatch(rePuntoLiteral, "x", false); // dentro de [] el punto NO es comodín

// El guion al FINAL (o inicio) de la clase es literal, no rango.
// [a-] = "la letra a, o un guion". Truco para incluir '-' sin ambigüedad.
const reLetraAoGuion = /^[a-]$/;
checkMatch(reLetraAoGuion, "a", true);
checkMatch(reLetraAoGuion, "-", true);
checkMatch(reLetraAoGuion, "b", false);

// ------------------------------------------------------------
// 5) Extraer con clases: contar dígitos de un ID con .match() + g
// ------------------------------------------------------------
// .match() con flag 'g' devuelve TODAS las coincidencias o null. En strict
// hay que guardar el null antes de usar .length.
const idRuidoso = "ID#A7-B3-C9";
const digitos = idRuidoso.match(/[0-9]/g); // cada dígito por separado
check("dígitos encontrados en el ID", digitos ? digitos.length : 0, 3); // 7,3,9
