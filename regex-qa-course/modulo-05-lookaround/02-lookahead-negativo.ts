// ============================================================
// Mini-clase 5.2: Lookahead negativo (?!...)
// ============================================================
// Analogía: es la lista negra de tu validador. Dices "esto debe ir
// seguido de CUALQUIER COSA MENOS X". Como el guardia que deja pasar a
// todos excepto a los que traen cierto distintivo: confirma una AUSENCIA
// en el contexto que viene, sin consumir nada.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 5.2 Lookahead negativo (?!...) =====");

// ------------------------------------------------------------
// (?!...) afirma "lo que viene a continuación NO cumple este patrón".
// También es de ancho cero: comprueba la ausencia, no consume texto.
// ------------------------------------------------------------

// ------------------------------------------------------------
// 1) Un número que NO va seguido de "px" (rechazar un contexto)
// ------------------------------------------------------------
// Queremos el número solo cuando NO sea un tamaño en px. En "z-index: 10"
// el 10 no va seguido de px → coincide. En "16px" el 16 SÍ va seguido de
// px → el lookahead negativo lo rechaza en esa posición.
const reNumSinPx = /\d+(?!\d*px)/;
const okZ = "z-index: 10".match(reNumSinPx);
check("número que NO precede 'px' coincide", okZ ? okZ[0] : null, "10");
// En "16px": ¿por qué (?!\d*px)? Porque \d+ es codicioso y haría
// backtracking dígito a dígito buscando una posición que satisfaga el
// lookahead. El \d*px dentro del lookahead cierra esa puerta: desde el
// "1", lo que sigue es "6px" → hay px adelante → rechazado; desde el "6",
// lo que sigue es "px" → rechazado. Así NINGÚN dígito de "16px" pasa.
checkMatch(/^\d+(?!\d*px)$/, "16px", false); // anclado: "16px" entero NO valida
checkMatch(/^\d+(?!\d*px)$/, "10", true);    // "10" suelto sí valida

// ------------------------------------------------------------
// 2) Palabra prohibida: rechazar ambientes que empiecen con "PROD"
// ------------------------------------------------------------
// Caso QA: un script de limpieza JAMÁS debe correr contra producción.
// (?!PROD) al inicio afirma "NO empieza con PROD". Lo combinamos con \w+
// para exigir que sí sea un nombre de ambiente. Nota: PROD-EU también cae,
// porque la prohibición es sobre el prefijo, no la palabra exacta.
const reNoProd = /^(?!PROD)\w+/;
checkMatch(reNoProd, "QA", true);
checkMatch(reNoProd, "UAT", true);
checkMatch(reNoProd, "PROD", false);     // empieza con PROD → bloqueado
checkMatch(reNoProd, "PRODUCTION", false); // también empieza con PROD

// ------------------------------------------------------------
// 3) "Contiene una palabra pero NO otra" en la misma cadena
// ------------------------------------------------------------
// Patrón muy útil para filtrar logs: "líneas que mencionan 'order' pero
// que NO contienen 'failed'". El (?!.*failed) ancla en ^ y escanea TODA
// la línea afirmando que la subcadena 'failed' no aparece en ningún lado.
const reOrderOk = /^(?!.*failed).*order.*$/;
checkMatch(reOrderOk, "INFO order ORD-1 created", true);   // tiene order, sin failed
checkMatch(reOrderOk, "ERROR order ORD-2 failed", false);  // tiene failed → rechazada
checkMatch(reOrderOk, "INFO retry GET /api/pizzas", false); // no menciona order

// Verificación extra del concepto de ancho cero: el lookahead negativo no
// añade nada a lo capturado. Capturamos el id de orden con un grupo y
// confirmamos que (?!.*failed) no contaminó la captura.
const mId = "INFO order ORD-1 created".match(/^(?!.*failed).*(ORD-\d+).*$/);
check("captura el id pese al lookahead negativo", mId ? mId[1] : null, "ORD-1");
