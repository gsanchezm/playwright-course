// ============================================================
// Mini-clase 6.1: Validar datos de prueba del mundo real
// ============================================================
// Analogía: eres el "guardia de la puerta" de tu suite. Antes de que un
// dato entre a un test (un email, un teléfono, un UUID), lo revisas con
// una regex igual que un validador de formulario revisa la entrada del
// usuario. Si el formato es basura, lo rechazas ANTES de que rompa algo.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import {
  EMAILS_VALIDOS,
  EMAILS_INVALIDOS,
  TELEFONOS_VALIDOS,
  TELEFONOS_INVALIDOS,
  FECHAS_ISO_VALIDAS,
  FECHAS_ISO_INVALIDAS,
  UUIDS_V4_VALIDOS,
  UUIDS_V4_INVALIDOS,
  JWT_VALIDO,
  JWTS_INVALIDOS,
  URLS_VALIDAS,
  URLS_INVALIDAS,
  MERCADOS,
  type Mercado,
} from "../data/samples";

console.log("\n===== 6.1 Validar datos de prueba del mundo real =====");

// ------------------------------------------------------------
// REGLA DE ORO de la validación: SIEMPRE anclar con ^ ... $
// ------------------------------------------------------------
// `checkMatch` usa internamente .test(), que busca una SUBCADENA. Casi
// todos los datos INVÁLIDOS de samples.ts son "casi válidos": contienen
// dentro de sí una porción que sí cumple el patrón. Sin ^ y $, la regex
// diría "sí coincide" porque encontró esa porción en medio del texto.
// Ejemplo: "++52 ..." CONTIENE "+52 ...". Solo ^...$ lo rechaza.
// En QA: un validador sin anclas es un test que pasa por las razones
// equivocadas (falso positivo). Anclar = afirmar sobre TODO el dato.

// ------------------------------------------------------------
// 1) EMAILS
// ------------------------------------------------------------
// Trampa: NO usar \S+ para las partes. \S incluye '@', así que "ana@@x.com"
// pasaría (\S+ se traga el segundo @). Usamos [^@\s]+ : "uno o más
// caracteres que NO sean @ ni espacio". Y el dominio necesita al menos
// un punto seguido de un TLD, por eso (\.[^@\s]+)+.
const reEmail = /^[^@\s]+@[^@\s]+(\.[^@\s]+)+$/;

console.log("--- Emails válidos ---");
for (const email of EMAILS_VALIDOS) checkMatch(reEmail, email, true);
console.log("--- Emails inválidos ---");
for (const email of EMAILS_INVALIDOS) checkMatch(reEmail, email, false);
// Razonamiento de por qué cada inválido cae:
//  "ana@"            → no hay dominio tras @            → falla
//  "@example.com"    → no hay parte local antes de @    → falla
//  "ana@@x.com"      → [^@\s]+ no admite el 2º @        → falla
//  "plainaddress"    → no hay @                         → falla
//  "ana@dominio"     → falta \. + TLD                   → falla
//  "ana .tester@x.com" → el espacio en la local rompe   → falla

// ------------------------------------------------------------
// 2) TELÉFONOS POR MERCADO (MX +52, US +1, CH +41, JP +81)
// ------------------------------------------------------------
// Los 4 formatos son MUY distintos: "+1 (415) 555-0123" no se parece a
// "+81 3-1234-5678". En vez de un mega-regex frágil, construimos UN regex
// POR MERCADO, anclado y específico a su forma real. Es más legible y más
// honesto: cada mercado tiene su contrato.
//
// ⚠️ \d en JS es ASCII por defecto (no incluiría dígitos de otros
//    alfabetos), pero aquí los teléfonos son ASCII, así que \d está bien.
const RE_TELEFONO_POR_MERCADO: Record<Mercado, RegExp> = {
  // +52 55 1234 5678  → +52, espacio, 2 díg, espacio, 4 díg, espacio, 4 díg
  MX: /^\+52 \d{2} \d{4} \d{4}$/,
  // +1 (415) 555-0123 → +1, (3 díg), 3 díg-4 díg
  US: /^\+1 \(\d{3}\) \d{3}-\d{4}$/,
  // +41 44 668 18 00  → +41, 2 díg, 3 díg, 2 díg, 2 díg
  CH: /^\+41 \d{2} \d{3} \d{2} \d{2}$/,
  // +81 3-1234-5678   → +81, 1 díg, -4 díg-4 díg
  JP: /^\+81 \d-\d{4}-\d{4}$/,
};

console.log("--- Teléfonos válidos (uno por mercado) ---");
(Object.keys(TELEFONOS_VALIDOS) as Mercado[]).forEach((m) => {
  checkMatch(RE_TELEFONO_POR_MERCADO[m], TELEFONOS_VALIDOS[m], true);
});

// Para los INVÁLIDOS necesitamos un validador "internacional general":
// debe empezar con UN solo '+', un prefijo de 1–3 dígitos, y luego al
// menos 6 caracteres de "relleno telefónico" (dígitos, espacios, guiones
// y paréntesis). El [\d ()-] tolera las 4 formas reales (incluido el
// "(415)" de US) sin volverse un mega-regex frágil, y el mínimo {6,}
// descarta un prefijo suelto como "+52".
const reTelInternacional = /^\+\d{1,3}[\d ()-]{6,}$/;
console.log("--- Teléfonos inválidos (validador internacional general) ---");
for (const tel of TELEFONOS_INVALIDOS) checkMatch(reTelInternacional, tel, false);
// Razonamiento:
//  "55 1234 5678"          → no empieza con +        → falla
//  "+52"                   → solo prefijo, sin grupos → falla
//  "++52 55 1234 5678"     → doble +, ^\+\d exige 1   → falla
//  "tel: 5512345678"       → empieza con 'tel:'       → falla
// Y verificamos que los válidos también pasan el validador general:
console.log("--- (Sanidad) válidos también pasan el validador general ---");
(Object.keys(TELEFONOS_VALIDOS) as Mercado[]).forEach((m) => {
  checkMatch(reTelInternacional, TELEFONOS_VALIDOS[m], true);
});
// Pequeña aserción de datos: el prefijo del regex MX coincide con el contrato.
check("prefijo MX en MERCADOS es +52", MERCADOS.MX.prefijo, "+52");

// ------------------------------------------------------------
// 3) FECHAS ISO 8601
// ------------------------------------------------------------
// Trampa: \d{2}-\d{2} aceptaría mes 13 y día 40. Validamos RANGOS:
//   mes  = 0[1-9] | 1[0-2]
//   día  = 0[1-9] | [12]\d | 3[01]
// La parte de hora es OPCIONAL (con (...)? ), y dentro de ella:
//   - segundos fraccionarios opcionales (\.\d+)?
//   - zona: Z, o ±hh:mm
// Por eso "2026-06-16" (solo fecha) es válido y "2026-06-16 14:30" NO
// (usa espacio en vez de 'T', y le falta segundos → no calza el bloque T).
const reFechaISO =
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])(T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(\.\d+)?(Z|[+-](0\d|1[0-4]):[0-5]\d))?$/;

console.log("--- Fechas ISO válidas ---");
for (const f of FECHAS_ISO_VALIDAS) checkMatch(reFechaISO, f, true);
console.log("--- Fechas ISO inválidas ---");
for (const f of FECHAS_ISO_INVALIDAS) checkMatch(reFechaISO, f, false);
// Razonamiento:
//  "2026-13-40"        → mes 13 y día 40 fuera de rango        → falla
//  "16/06/2026"        → separador '/' y orden D/M/Y           → falla
//  "2026-6-1"          → mes y día sin cero a la izquierda (1 díg) → falla
//  "2026-06-16 14:30"  → espacio en vez de 'T' + sin segundos  → falla

// ------------------------------------------------------------
// 4) UUID v4
// ------------------------------------------------------------
// La clave de "v4" está en dos nibbles fijos:
//   - el 1.º dígito del 3.er bloque debe ser '4'      (versión)
//   - el 1.º dígito del 4.º bloque debe ser [89ab]    (variante RFC 4122)
// Un regex flojo [0-9a-f-]{36} aceptaría una v1 o una variante mala.
// Usamos 'i' para tolerar mayúsculas (UUID puede venir en upper/lower).
const reUuidV4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

console.log("--- UUID v4 válidos ---");
for (const u of UUIDS_V4_VALIDOS) checkMatch(reUuidV4, u, true);
console.log("--- UUID v4 inválidos ---");
for (const u of UUIDS_V4_INVALIDOS) checkMatch(reUuidV4, u, false);
// Razonamiento:
//  "...-11d4-..."  → versión '1' donde exigimos '4'     → falla
//  "...-c567-..."  → variante 'c' fuera de [89ab]        → falla
//  "not-a-uuid"    → no es hex con esa estructura        → falla
//  "...sin guiones" → faltan los '-' separadores         → falla

// ------------------------------------------------------------
// 5) ESTRUCTURA DE JWT (header.payload.signature en base64url)
// ------------------------------------------------------------
// No validamos la FIRMA criptográfica (eso no es trabajo de regex), solo
// la ESTRUCTURA: tres segmentos base64url separados por punto. base64url
// usa el alfabeto [A-Za-z0-9_-] (guion y guion-bajo en vez de + y /), y
// normalmente sin relleno '='. Cada segmento debe tener ≥1 caracter.
const reJwt = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

console.log("--- JWT válido (estructura de 3 partes) ---");
checkMatch(reJwt, JWT_VALIDO, true);
console.log("--- JWT inválidos ---");
for (const j of JWTS_INVALIDOS) checkMatch(reJwt, j, false);
// Razonamiento:
//  "abc.def"               → solo 2 partes                → falla
//  "eyJ...J9.payload"      → solo 2 partes (falta firma)  → falla
//  "no-es-un-jwt"          → 0 puntos, una sola parte     → falla

// ------------------------------------------------------------
// 6) URLs
// ------------------------------------------------------------
// Esquema http/https, "://", un host con al menos un punto o "localhost",
// puerto opcional, y un resto opcional (path/query/fragment).
// Trampa: "http://" sin host debe fallar → exigimos al menos un host.
const reUrl =
  /^https?:\/\/(localhost|[A-Za-z0-9.-]+\.[A-Za-z]{2,})(:\d+)?(\/[^\s]*)?$/;

console.log("--- URLs válidas ---");
for (const u of URLS_VALIDAS) checkMatch(reUrl, u, true);
console.log("--- URLs inválidas ---");
for (const u of URLS_INVALIDAS) checkMatch(reUrl, u, false);
// Razonamiento:
//  "htp:/bad"     → esquema mal escrito y un solo '/'   → falla
//  "justtext"     → no hay esquema ni '://'             → falla
//  "://nohost.com"→ falta el esquema antes de '://'     → falla
//  "http://"      → no hay host tras '://'              → falla
