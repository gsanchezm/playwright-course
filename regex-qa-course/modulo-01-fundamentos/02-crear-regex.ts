// ============================================================
// Mini-clase 1.2: Dos formas de crear una regex
// ============================================================
// Analogía: un literal /.../ es un caso de prueba HARDCODEADO (lo escribes
// fijo en el código); new RegExp("...") es un caso PARAMETRIZADO/data-driven
// (lo construyes en runtime a partir de datos). Igual que en un framework de
// pruebas: a veces el dato va en el test, a veces viene de un fixture.
// ============================================================
import { check, checkMatch } from "../helpers/check";
console.log("\n===== 1.2 Dos formas de crear una regex =====");

// ------------------------------------------------------------
// FORMA 1: literal  /patrón/flags
// ------------------------------------------------------------
// Es la forma preferida cuando el patrón es FIJO y lo conoces al escribir el
// código. Ventaja: no hay doble escapado y el editor lo resalta como regex.
const reLiteral = /PZ-\d{4}/; // SKU de pizza: "PZ-" + 4 dígitos
checkMatch(reLiteral, "PZ-1234", true);
checkMatch(reLiteral, "PZ-12", false); // solo 2 dígitos, no 4

// ------------------------------------------------------------
// FORMA 2: constructor  new RegExp("patrón", "flags")
// ------------------------------------------------------------
// Útil cuando el patrón se CONSTRUYE en runtime (desde datos de prueba,
// configuración, parámetros). El patrón es un STRING normal.
const reConstruida = new RegExp("PZ-\\d{4}");
// ⚠️ OJO CON EL ESCAPADO: en un string, la barra invertida es especial, así
// que para que la regex reciba "\d" debes escribir "\\d" en el string.
// Por eso el literal de arriba dice \d pero aquí decimos \\d. Confirmemos
// que ambas producen EXACTAMENTE el mismo patrón (.source):
check("literal y constructor producen el mismo .source", reConstruida.source, reLiteral.source);
checkMatch(reConstruida, "PZ-0001", true);

// Demostración del peligro de NO escapar: si en el string ponemos "\d" (una
// sola barra), JavaScript interpreta "\d" como... solo "d" (no es un escape
// válido de string, así que la barra se pierde). El patrón resultante sería
// "PZ-dddd" (cuatro letras 'd' literales), que NO es lo que queríamos.
const reMalEscapada = new RegExp("PZ-\\d".replace("\\d", "d")); // simula el error: "PZ-d"
check("patrón mal escapado quedó como 'PZ-d'", reMalEscapada.source, "PZ-d");
checkMatch(reMalEscapada, "PZ-1234", false); // "PZ-d" NO matchea un dígito
checkMatch(reMalEscapada, "PZ-dato", true); // pero SÍ matchea una 'd' literal

// ------------------------------------------------------------
// El caso de USO real del constructor: regex DINÁMICA desde datos.
// ------------------------------------------------------------
// Imagina un test parametrizado que valida que un texto contenga el nombre
// del ambiente bajo prueba. El ambiente viene de una variable, no es fijo.
const ambienteBajoPrueba = "UAT";
const reAmbienteDinamico = new RegExp(`ambiente: ${ambienteBajoPrueba}\\b`);
checkMatch(reAmbienteDinamico, "log: ambiente: UAT activo", true);
checkMatch(reAmbienteDinamico, "log: ambiente: PROD activo", false);

// ⚠️ Advertencia profesional: si interpolas datos NO confiables en una regex,
// caracteres como '.' o '(' del dato se interpretan como metacaracteres y
// rompen el patrón (o abren agujeros de validación). Para datos arbitrarios
// hay que "escaparlos" primero — lo veremos en 1.4 con los metacaracteres.
