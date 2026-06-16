// ============================================================
// data/samples.ts — datos de muestra compartidos del curso de Regex
// ============================================================
// Vocabulario "OmniPizza" (mercados MX / US / CH / JP) + artefactos QA
// universales (logs, payloads, IDs, PII). Las mini-clases importan de
// aquí para que TODOS los ejemplos usen datos coherentes.
//
//   import { SKUS_VALIDOS, EMAILS, LOG_BLOB } from "../data/samples";
//
// ⚠️ NO edites este archivo desde una mini-clase. Si necesitas un caso
//    puntual, decláralo localmente en tu archivo. Este archivo es el
//    "contrato" de datos compartido del curso.
// ============================================================

export type Mercado = "MX" | "US" | "CH" | "JP";

// ------------------------------------------------------------
// Mercados OmniPizza (prefijo telefónico + moneda)
// ------------------------------------------------------------
export const MERCADOS: Record<Mercado, { prefijo: string; moneda: string; nombre: string }> = {
  MX: { prefijo: "+52", moneda: "MXN", nombre: "México" },
  US: { prefijo: "+1", moneda: "USD", nombre: "United States" },
  CH: { prefijo: "+41", moneda: "CHF", nombre: "Schweiz" },
  JP: { prefijo: "+81", moneda: "JPY", nombre: "日本" },
};

// ------------------------------------------------------------
// Ambientes de ejecución (M01 reto: aceptar solo QA / UAT / PROD)
// ------------------------------------------------------------
export const AMBIENTES_VALIDOS = ["QA", "UAT", "PROD"] as const;
export const AMBIENTES_INVALIDOS = ["qa", "STAGE", "PRODUCTION", "DEV", "Qa", "PROD "] as const;

// ------------------------------------------------------------
// SKU de pizza OmniPizza — formato PZ-#### (2 letras may. + guion + 4 díg.)
// ------------------------------------------------------------
export const SKUS_VALIDOS = ["PZ-1234", "PZ-0001", "PZ-9999"] as const;
export const SKUS_INVALIDOS = ["pz-1234", "PZ-12", "PZA-1234", "PZ-12345", "PZ1234", "P-1234"] as const;

// ------------------------------------------------------------
// Emails
// ------------------------------------------------------------
export const EMAILS_VALIDOS = [
  "ana.tester@omnipizza.test",
  "qa+ci@example.com",
  "j.doe@sub.dominio.mx",
] as const;
export const EMAILS_INVALIDOS = [
  "ana@",
  "@example.com",
  "ana@@x.com",
  "plainaddress",
  "ana@dominio",
  "ana .tester@x.com",
] as const;

// ------------------------------------------------------------
// Teléfonos por mercado (formato internacional con prefijo)
// ------------------------------------------------------------
export const TELEFONOS_VALIDOS: Record<Mercado, string> = {
  MX: "+52 55 1234 5678",
  US: "+1 (415) 555-0123",
  CH: "+41 44 668 18 00",
  JP: "+81 3-1234-5678",
};
export const TELEFONOS_INVALIDOS = ["55 1234 5678", "+52", "++52 55 1234 5678", "tel: 5512345678"] as const;

// ------------------------------------------------------------
// Fechas ISO 8601
// ------------------------------------------------------------
export const FECHAS_ISO_VALIDAS = [
  "2026-06-16",
  "2026-06-16T14:30:00Z",
  "2026-06-16T14:30:00-06:00",
  "2026-01-01T00:00:00.123Z",
] as const;
export const FECHAS_ISO_INVALIDAS = ["2026-13-40", "16/06/2026", "2026-6-1", "2026-06-16 14:30"] as const;

// ------------------------------------------------------------
// UUID v4
// ------------------------------------------------------------
export const UUIDS_V4_VALIDOS = [
  "550e8400-e29b-41d4-a716-446655440000",
  "f47ac10b-58cc-4372-a567-0e02b2c3d479",
] as const;
export const UUIDS_V4_INVALIDOS = [
  "550e8400-e29b-11d4-a716-446655440000", // versión 1, no 4
  "f47ac10b-58cc-4372-c567-0e02b2c3d479", // variante inválida (c)
  "not-a-uuid",
  "550e8400e29b41d4a716446655440000",
] as const;

// ------------------------------------------------------------
// JWT de ejemplo (header.payload.signature en base64url) — estructura
// ------------------------------------------------------------
export const JWT_VALIDO =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFuYSBRQSIsImlhdCI6MTUxNjIzOTAyMn0" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
export const JWTS_INVALIDOS = [
  "abc.def", // solo 2 partes
  "eyJhbGciOiJIUzI1NiJ9.payload", // falta firma
  "no-es-un-jwt",
] as const;

// ------------------------------------------------------------
// URLs
// ------------------------------------------------------------
export const URLS_VALIDAS = [
  "https://omnipizza-frontend.onrender.com/catalog?market=MX",
  "http://localhost:3000",
  "https://example.com/path/to/resource#frag",
] as const;
export const URLS_INVALIDAS = ["htp:/bad", "justtext", "://nohost.com", "http://"] as const;

// ------------------------------------------------------------
// Cupones — formato 3 letras may. + 3 dígitos (M04 reto: rechazar "ABC123extra")
// ------------------------------------------------------------
export const CUPONES_VALIDOS = ["ABC123", "XYZ789", "PZA001"] as const;
export const CUPONES_INVALIDOS = ["ABC123extra", "abc123", "AB1234", "ABCD12", "ABC12"] as const;

// ------------------------------------------------------------
// Contraseñas (M05: política ≥8, mayúscula, dígito, símbolo)
// ------------------------------------------------------------
export const PASSWORDS_VALIDAS = ["Pizza123!", "QAteam#2026", "Str0ng$Pass"] as const;
export const PASSWORDS_INVALIDAS = ["pizza", "password", "ALLUPPER1", "NoSymbol123", "short1!"] as const;

// ------------------------------------------------------------
// PII para enmascarar (M05)
// ------------------------------------------------------------
export const TARJETAS = ["4111 1111 1111 1111", "5500 0000 0000 0004"] as const;
export const LINEA_LOG_CON_EMAIL =
  "2026-06-16T14:30:05Z [INFO] user ana.tester@omnipizza.test logged in from MX";

// ------------------------------------------------------------
// Logs y traces (M03 / M04 / M06)
// ------------------------------------------------------------
// Línea de log de ejecución de prueba (M03 reto: extraer campos a objeto).
export const LINEA_LOG_TEST =
  "2026-06-16T14:30:03Z [ERROR] test=checkout.spec.ts:42 name='checkout flow' duration=1530ms status=failed";

// Línea con orderId, timestamp y monto (M03: grupos nombrados).
export const LINEA_LOG_ORDEN =
  "2026-06-16T14:30:01Z [INFO] order ORD-2026-0456 created total=249.00 MXN";

// Blob de varias líneas (M04 flags m/s; M06 parseo de logs).
export const LOG_BLOB = [
  "2026-06-16T14:30:00Z [INFO] suite started: omnipizza-e2e",
  "2026-06-16T14:30:01Z [INFO] order ORD-2026-0456 created total=249.00 MXN",
  "2026-06-16T14:30:02Z [WARN] retry attempt 2 for GET /api/pizzas",
  "2026-06-16T14:30:03Z [ERROR] test 'checkout flow' failed: TimeoutError",
  "2026-06-16T14:30:04Z [WARN] slow response 1200ms for GET /api/orders",
  "2026-06-16T14:30:05Z [INFO] suite finished: 3 passed, 1 failed",
].join("\n");

// Stack trace de ejemplo (M06: parsear traza).
export const STACK_TRACE = [
  "TimeoutError: locator.click: Timeout 15000ms exceeded.",
  "    at CheckoutPage.confirm (pages/CheckoutPage.ts:54:12)",
  "    at checkout.spec.ts:42:9",
  "    at runMicrotasks (<anonymous>)",
].join("\n");

// Línea con palabra duplicada (M03 retroreferencias: detectar repetición).
export const LINEA_PALABRA_DUPLICADA = "el el pedido se se confirmó";

// ------------------------------------------------------------
// Lote de pedidos multi-mercado (M06 / capstone M07)
// Mezcla deliberada de válidos e inválidos para validación data-driven.
// ------------------------------------------------------------
export interface PedidoCrudo {
  mercado: string;
  email: string;
  telefono: string;
  sku: string;
  total: string;
}
export const LOTE_PEDIDOS: PedidoCrudo[] = [
  { mercado: "MX", email: "ana.tester@omnipizza.test", telefono: "+52 55 1234 5678", sku: "PZ-1234", total: "249.00" },
  { mercado: "US", email: "qa+ci@example.com", telefono: "+1 (415) 555-0123", sku: "PZ-0001", total: "19.99" },
  { mercado: "CH", email: "bad-email@", telefono: "+41 44 668 18 00", sku: "PZ-9999", total: "30.00" },
  { mercado: "JP", email: "user@dominio.jp", telefono: "+81 3-1234-5678", sku: "pz-12", total: "1500" },
  { mercado: "XX", email: "plainaddress", telefono: "00000", sku: "PZA-1234", total: "abc" },
];

// ------------------------------------------------------------
// Unicode / internacional (M07)
// ------------------------------------------------------------
export const NOMBRES_UNICODE = ["México", "Zürich", "Tōkyō", "Müller", "São Paulo", "Søren"] as const;
export const TEXTO_CON_EMOJI = "Pedido confirmado 🍕🎉 para México";

// ------------------------------------------------------------
// "No uses regex para esto" (M07): HTML/JSON anidado
// ------------------------------------------------------------
export const HTML_SNIPPET = '<div class="order"><span class="item">Pizza</span><span>x2</span></div>';
export const JSON_SNIPPET = '{"order":{"id":"ORD-1","items":[{"sku":"PZ-1234","qty":2}]}}';

// ------------------------------------------------------------
// ReDoS (M07) — input CORTO y acotado para demostrar backtracking SIN colgar.
// ⚠️ Nunca alargues esto a 30+ caracteres con un patrón como /(a+)+$/.
// ------------------------------------------------------------
export const REDOS_INPUT_CORTO = "aaaaaaaaaa"; // 10 'a' (seguro para demo medida)
