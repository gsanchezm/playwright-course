// ============================================================
// Mini-clase 7.1: Backtracking y ReDoS (la regex que tumba el servidor)
// ============================================================
// Analogía: imagina un QA que prueba TODAS las combinaciones posibles de
// un formulario para encontrar una que "encaje". Si las combinaciones
// crecen de forma exponencial, nunca termina. Eso es el backtracking
// catastrófico: el motor de regex reintenta tantas particiones del texto
// que un input de ~30 caracteres puede colgar el proceso. Si ese input
// viene de un usuario (un email, un nombre), acabas de regalar un DoS.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { REDOS_INPUT_CORTO } from "../data/samples";

console.log("\n===== 7.1 Backtracking y ReDoS =====");

// ⚠️⚠️ SEGURIDAD: en TODO este archivo el input máximo es 11 caracteres.
//    NUNCA corras un patrón vulnerable contra un texto largo: a partir de
//    ~30 'a' el motor entra en backtracking exponencial y CUELGA el proceso.
//    Aquí demostramos el peligro de forma SEGURA, midiendo en inputs cortos.

// ------------------------------------------------------------
// 1) ¿Qué es el backtracking? El motor "se arrepiente" y reintenta.
// ------------------------------------------------------------
// Un cuantificador greedy como \d+ primero se traga TODO lo que puede, y
// si el resto del patrón no calza, "devuelve" caracteres uno a uno y
// reintenta. En patrones sanos eso son unos pocos reintentos. El problema
// aparece cuando hay AMBIGÜEDAD: muchas formas distintas de repartir el
// mismo texto entre cuantificadores anidados.
//
// Ejemplo SANO (sin anidar): /^\d+$/ sobre "12a" falla rápido. \d+ se
// come "12", ve la 'a', no calza $, retrocede una vez, sigue fallando y
// se rinde. Lineal. Sin drama.
checkMatch(/^\d+$/, "12345", true);
checkMatch(/^\d+$/, "123a5", false);

// ------------------------------------------------------------
// 2) El patrón VULNERABLE clásico: /(a+)+$/  — cuantificador ANIDADO.
// ------------------------------------------------------------
// El (a+)+ tiene DOS cuantificadores apilados sobre la misma 'a'. Para una
// cadena de N 'a' hay ~2^N maneras de repartir esas 'a' entre el grupo
// interno (a+) y el externo (...)+. Mientras el input TERMINE en 'a' y
// luego haya $, el motor encuentra una partición y para. Pero si el input
// FALLA al final (una 'a' seguida de un caracter que no es 'a'), el motor
// se ve OBLIGADO a probar TODAS las ~2^N particiones antes de rendirse.
// Eso es el backtracking catastrófico → ReDoS (Regex Denial of Service).
const REGEX_VULNERABLE = /^(a+)+$/;

// ⚠️ Lo corremos SOLO contra inputs CORTOS y ACOTADOS (≤ 11 chars).
// "aaaaaaaaaa" (10 'a' de REDOS_INPUT_CORTO) SÍ matchea: el motor toma el
// primer reparto greedy y para de inmediato, sin backtracking. Instantáneo.
checkMatch(REGEX_VULNERABLE, REDOS_INPUT_CORTO, true);

// El caso PELIGROSO es el que FALLA: añadimos un caracter que no es 'a'
// al final. Ahora el motor debe agotar las particiones... pero con solo
// 11 caracteres son ~2^10 ≈ 1024 pasos: sigue siendo instantáneo y SEGURO.
const INPUT_QUE_FALLA = REDOS_INPUT_CORTO + "!"; // "aaaaaaaaaa!" = 11 chars
checkMatch(REGEX_VULNERABLE, INPUT_QUE_FALLA, false);

// ------------------------------------------------------------
// 3) Medir el tiempo SIN colgar: probamos que en input corto es rápido.
// ------------------------------------------------------------
// Medimos el caso peor (el que falla y fuerza backtracking) pero acotado a
// 11 caracteres. A este tamaño tarda < 1 ms. La aserción es honesta: NO
// afirmamos "el vulnerable es más lento que el seguro" (a 11 chars son
// ambos instantáneos y esa comparación sería ruido), afirmamos lo único
// que es deterministamente cierto: en input CORTO sigue siendo rápido.
const t0 = process.hrtime.bigint();
REGEX_VULNERABLE.test(INPUT_QUE_FALLA);
const t1 = process.hrtime.bigint();
const msVulnerableCorto = Number(t1 - t0) / 1e6;
console.log(`   ⏱️  /(a+)+$/ sobre 11 chars que fallan: ${msVulnerableCorto.toFixed(3)} ms`);
// Umbral GENEROSO (< 100 ms) para que la aserción no sea "flaky" en CI.
check("backtracking en 11 chars es rápido (< 100 ms)", msVulnerableCorto < 100, true);

// 🔷 LO QUE NO HACEMOS (y por qué):
//    El coste crece como ~2^N. Empíricamente: 24 'a' que fallan ya tardan
//    ~100 ms, y cada 2 caracteres MÁS lo cuadruplican. Con ~35 'a' que
//    fallan el proceso se cuelga durante segundos o minutos. Por eso este
//    archivo JAMÁS construye un input largo (nada de "a".repeat(40)).
//    Reconocer el peligro NO requiere reproducir el cuelgue.

// ------------------------------------------------------------
// 4) Cómo RECONOCER una regex potencialmente vulnerable (checklist QA).
// ------------------------------------------------------------
// La señal #1 es un cuantificador APLICADO A ALGO QUE YA TIENE OTRO
// cuantificador, sobre clases de caracteres que SE SOLAPAN. Patrones de
// alarma (todos del mismo ADN que /(a+)+$/):
//    (a+)+        (a*)*        (a+)*        ([a-z]+)+
//    (\d+)+       (\w*)*       (.*)*        (\s+)*
// Y la variante con alternancia que se solapa:
//    (a|aa)+      (a|a?)+
// Regla de bolsillo: si DOS cuantificadores pueden "pelearse" por los
// mismos caracteres, hay riesgo de backtracking exponencial.
function pareceVulnerable(fuente: string): boolean {
  // Heurística DIDÁCTICA (no un analizador real): ¿hay un grupo que termina
  // en cuantificador y va seguido de otro cuantificador? p.ej. "+)+", "*)*".
  return /[+*]\)[+*]/.test(fuente);
}
check("detecta (a+)+ como sospechoso", pareceVulnerable("^(a+)+$"), true);
check("detecta (a*)* como sospechoso", pareceVulnerable("(a*)*"), true);
check("detecta ([a-z]+)+ como sospechoso", pareceVulnerable("([a-z]+)+"), true);
// Una regex SANA equivalente (ver 7.2) no dispara la heurística:
check("una regex anclada y simple NO es sospechosa", pareceVulnerable("^a+$"), false);

// ------------------------------------------------------------
// 5) Impacto en QA / seguridad: por qué esto te importa.
// ------------------------------------------------------------
// Si una regex vulnerable valida input de usuario en un endpoint (email,
// teléfono, "username"), un atacante manda una cadena diseñada para fallar
// al final y el hilo se queda atascado backtracking. Un solo request puede
// consumir 100% de CPU durante minutos → denegación de servicio.
// Como QA: cualquier regex que toque input externo debe (a) estar anclada,
// (b) NO tener cuantificadores anidados solapados, y (c) validarse contra
// un límite de LONGITUD antes de ejecutarse. Eso es 7.2.
console.log("   ✅ Demo de ReDoS completada SIN colgar (input máximo: 11 chars).");
