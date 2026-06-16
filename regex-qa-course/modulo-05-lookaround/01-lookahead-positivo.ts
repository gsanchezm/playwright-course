// ============================================================
// Mini-clase 5.1: Lookahead positivo (?=...)
// ============================================================
// Analogía: es el "espejo retrovisor que mira ADELANTE" de tu test.
// Afirmas "esto debe ir SEGUIDO de X" para confirmar el contexto, pero
// sin tocar (sin consumir) ese X — como cuando verificas que un botón
// existe en la página antes de hacer clic, pero no haces clic en él.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 5.1 Lookahead positivo (?=...) =====");

// ------------------------------------------------------------
// ¿Qué es una "aserción de ancho cero"?
// ------------------------------------------------------------
// Un lookahead (?=...) NO consume caracteres: comprueba que lo que viene
// a continuación cumple un patrón, pero deja el cursor donde estaba. Es
// como un assert sin efecto secundario: verifica y sigue. El texto que
// matchea (?=...) NO aparece en el resultado de .match().

// ------------------------------------------------------------
// 1) "Un número SEGUIDO de px" — extraer el número, NO la unidad
// ------------------------------------------------------------
// Queremos el "16" de "16px", pero sin llevarnos "px". El lookahead
// (?=px) afirma "después de estos dígitos viene px", sin consumir "px".
const reAntesDePx = /\d+(?=px)/;
const m1 = "font-size: 16px".match(reAntesDePx);
// Guarda de null OBLIGATORIA en TS estricto: match() devuelve `... | null`.
check("extrae el número antes de 'px'", m1 ? m1[0] : null, "16");
// Prueba de que NO se consumió "px": el match tiene longitud 2 ("16"),
// no 4 ("16px"). El cursor quedó justo antes de la 'p'.
check("el lookahead no consume 'px'", m1 ? m1[0].length : -1, 2);

// Contraste DIDÁCTICO: sin lookahead, sí nos llevaríamos la unidad.
const mSinLook = "font-size: 16px".match(/\d+px/);
check("sin lookahead sí se lleva 'px'", mSinLook ? mSinLook[0] : null, "16px");

// ------------------------------------------------------------
// 2) Insertar separadores de miles SIN borrar dígitos
// ------------------------------------------------------------
// Caso QA clásico: formatear "1234567" → "1,234,567" para comparar contra
// la UI. El truco es poner una coma en cada posición que tenga adelante
// grupos de 3 dígitos hasta el final. (?=(\d{3})+$) = "lo que sigue son
// uno o más bloques de 3 dígitos y luego el fin". \B evita una coma al
// inicio. Como es ancho cero, NO borra ningún dígito: solo INSERTA.
const reMiles = /\B(?=(\d{3})+$)/g;
const formateado = "1234567".replace(reMiles, ",");
check("separador de miles con lookahead", formateado, "1,234,567");

// ------------------------------------------------------------
// 3) Lookahead como "y además" en validación (preview de 5.4)
// ------------------------------------------------------------
// Anclando con ^, el lookahead mira TODA la cadena desde el inicio. Aquí:
// "la cadena (mirando adelante) contiene al menos un dígito en algún
// punto". No consume nada, solo confirma la condición. Esta es la base de
// la política de contraseñas: apilar varios "y además" independientes.
const reTieneDigito = /^(?=.*\d)/;
checkMatch(reTieneDigito, "Pizza1", true);  // contiene un '1'
checkMatch(reTieneDigito, "Pizza", false);  // ningún dígito → falla
