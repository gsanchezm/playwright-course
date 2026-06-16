// ============================================================
// Módulo 7: Avanzado y seguro — Runner + CAPSTONE
// ============================================================
//   Corre las 5 mini-clases y luego el pipeline de calidad de datos.
// ============================================================

// --- 1) Corre las 5 mini-clases por efecto secundario (imprimen sus ✅) ---
import "./01-backtracking-y-redos";
import "./02-mitigar-redos";
import "./03-unicode-y-propiedades";
import "./04-regex-mantenible";
import "./05-cuando-no-usar-regex";

// --- 2) CAPSTONE: pipeline AUTOCONTENIDO sobre el lote multi-mercado ---
// Importa SOLO el dato compartido (LOTE_PEDIDOS) y los helpers. Toda la
// lógica (regex, validación, parseo, scrub) vive AQUÍ, sin depender de
// otros módulos. Reúne lo del curso: validar (M01–M06) + parsear (M03) +
// scrub (M06) + seguridad y Unicode (M07).
import { check } from "../helpers/check";
import { LOTE_PEDIDOS, type Mercado, type PedidoCrudo } from "../data/samples";

console.log("\n===== 🎓 CAPSTONE Módulo 7: pipeline de calidad de datos =====");

// ------------------------------------------------------------
// Regex del pipeline — TODAS ancladas, SIN cuantificadores anidados (7.1/7.2),
// Unicode-safe donde aplica (7.3). Definidas localmente (CAPSTONE autónomo).
// ------------------------------------------------------------
const RE_MERCADO = /^(MX|US|CH|JP)$/; // mercado conocido y exacto
const RE_EMAIL = /^[^@\s]+@[^@\s]+(\.[^@\s]+)+$/; // local@dominio.tld, anclado
const RE_SKU = /^[A-Z]{2}-\d{4}$/; // 2 letras may + guion + 4 dígitos
const RE_TOTAL = /^\d+\.\d{2}$/; // número con exactamente 2 decimales
const RE_TEL_POR_MERCADO: Record<Mercado, RegExp> = {
  MX: /^\+52 \d{2} \d{4} \d{4}$/,
  US: /^\+1 \(\d{3}\) \d{3}-\d{4}$/,
  CH: /^\+41 \d{2} \d{3} \d{2} \d{2}$/,
  JP: /^\+81 \d-\d{4}-\d{4}$/,
};

// GUARDA DE LONGITUD (lección 7.2): rechazamos cualquier campo absurdamente
// largo ANTES de pasar la regex. Defensa en profundidad contra ReDoS aunque
// estas regex ya sean seguras: nunca le des input gigante a un validador.
const MAX_CAMPO = 64;
function validar(re: RegExp, valor: string): boolean {
  if (valor.length > MAX_CAMPO) return false; // corto-circuito de seguridad
  return re.test(valor);
}

function esMercadoConocido(m: string): m is Mercado {
  return m === "MX" || m === "US" || m === "CH" || m === "JP";
}

// ------------------------------------------------------------
// PASO A — VALIDAR cada pedido campo por campo (data-driven).
// ------------------------------------------------------------
interface ResultadoValidacion {
  mercado: string;
  esValido: boolean;
  fallos: string[]; // qué campos fallaron (para el reporte QA)
}

function validarPedido(p: PedidoCrudo): ResultadoValidacion {
  const fallos: string[] = [];
  if (!validar(RE_MERCADO, p.mercado)) fallos.push("mercado");
  if (!validar(RE_EMAIL, p.email)) fallos.push("email");
  if (!validar(RE_SKU, p.sku)) fallos.push("sku");
  if (!validar(RE_TOTAL, p.total)) fallos.push("total");
  // El teléfono solo se valida si el mercado es conocido (cada uno su forma):
  if (esMercadoConocido(p.mercado)) {
    if (!validar(RE_TEL_POR_MERCADO[p.mercado], p.telefono)) fallos.push("telefono");
  } else {
    fallos.push("telefono"); // mercado desconocido → no hay regla → inválido
  }
  return { mercado: p.mercado, esValido: fallos.length === 0, fallos };
}

const resultados = LOTE_PEDIDOS.map(validarPedido);

console.log("--- Validación campo por campo del lote ---");
for (const r of resultados) {
  const estado = r.esValido ? "VÁLIDO" : `INVÁLIDO (falla: ${r.fallos.join(", ")})`;
  console.log(`   · ${r.mercado}: ${estado}`);
}

// Tabla de verdad ESPERADA, escrita a mano tras razonar cada fila del lote
// (NO derivada de la propia regex). Honestidad = el ✅ significa
// "clasificado correctamente", no "todo pasó".
//   MX → todo bien                              → VÁLIDO
//   US → todo bien                              → VÁLIDO
//   CH → email "bad-email@" sin dominio         → INVÁLIDO (email)
//   JP → sku "pz-12" minús/corto, total "1500"  → INVÁLIDO (sku, total)
//   XX → mercado desconocido + todo basura      → INVÁLIDO (todo)
check("MX clasificado como válido", resultados[0].esValido, true);
check("US clasificado como válido", resultados[1].esValido, true);
check("CH clasificado como inválido", resultados[2].esValido, false);
check("CH falla exactamente en 'email'", resultados[2].fallos, ["email"]);
check("JP clasificado como inválido", resultados[3].esValido, false);
check("JP falla en sku y total", resultados[3].fallos, ["sku", "total"]);
check("XX clasificado como inválido", resultados[4].esValido, false);
check("XX falla en TODOS los campos", resultados[4].fallos, ["mercado", "email", "sku", "total", "telefono"]);

// Métrica de calidad del lote: cuántos pasaron. 2 de 5.
const validos = resultados.filter((r) => r.esValido).length;
check("el lote tiene 2 pedidos válidos de 5", validos, 2);

// ------------------------------------------------------------
// PASO B — PARSEAR: extraer datos estructurados de los pedidos VÁLIDOS.
// ------------------------------------------------------------
// De cada email válido sacamos local + dominio con grupos (M03). Del total
// derivamos centavos. Solo procesamos los que pasaron PASO A: nunca parsees
// basura no validada.
const RE_EMAIL_PARTES = /^(?<local>[^@\s]+)@(?<dominio>[^@\s]+(?:\.[^@\s]+)+)$/;

interface PedidoParseado {
  mercado: Mercado;
  emailLocal: string;
  emailDominio: string;
  centavos: number;
}

const parseados: PedidoParseado[] = [];
for (let i = 0; i < LOTE_PEDIDOS.length; i++) {
  if (!resultados[i].esValido) continue; // saltar inválidos
  const p = LOTE_PEDIDOS[i];
  const m = RE_EMAIL_PARTES.exec(p.email);
  if (!m || !m.groups) continue; // guarda de null (TS estricto)
  // mercado ya validado como conocido en PASO A, pero re-aseguramos el tipo:
  if (!esMercadoConocido(p.mercado)) continue;
  parseados.push({
    mercado: p.mercado,
    emailLocal: m.groups.local,
    emailDominio: m.groups.dominio,
    centavos: Math.round(parseFloat(p.total) * 100),
  });
}

console.log("--- Pedidos válidos, parseados ---");
for (const pp of parseados) {
  console.log(`   · ${pp.mercado}: local=${pp.emailLocal} dominio=${pp.emailDominio} centavos=${pp.centavos}`);
}
check("se parsearon exactamente los 2 válidos", parseados.length, 2);
check("MX: parte local del email", parseados[0].emailLocal, "ana.tester");
check("MX: dominio del email", parseados[0].emailDominio, "omnipizza.test");
check("MX: 249.00 → 24900 centavos", parseados[0].centavos, 24900);
check("US: parte local con '+' (qa+ci)", parseados[1].emailLocal, "qa+ci");
check("US: 19.99 → 1999 centavos", parseados[1].centavos, 1999);

// ------------------------------------------------------------
// PASO C — SCRUB: enmascarar PII antes de loguear/snapshotear (M06 + 7.3).
// ------------------------------------------------------------
// Construimos un "recibo" por pedido válido y lo limpiamos: el email se
// enmascara (PII) y un timestamp volátil se vuelve placeholder estable.
// Las regex de scrub llevan 'g' (todas las ocurrencias) y, para el nombre,
// son Unicode-safe (7.3): no rompen con acentos.
const RE_EMAIL_SCRUB = /[^@\s]+@[^@\s]+(?:\.[^@\s]+)+/g; // cualquier email → <EMAIL>
const RE_TIMESTAMP = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g; // ISO → <TIMESTAMP>

function scrub(texto: string): string {
  return texto.replace(RE_TIMESTAMP, "<TIMESTAMP>").replace(RE_EMAIL_SCRUB, "<EMAIL>");
}

// Un recibo crudo con datos volátiles + PII, para el primer pedido válido.
const reciboCrudo = `2026-06-16T14:30:00Z [INFO] pedido de ${LOTE_PEDIDOS[0].email} en mercado MX confirmado`;
const reciboLimpio = scrub(reciboCrudo);
console.log(`   crudo:  ${reciboCrudo}`);
console.log(`   limpio: ${reciboLimpio}`);
check(
  "el recibo scrubbeado oculta timestamp y email",
  reciboLimpio,
  "<TIMESTAMP> [INFO] pedido de <EMAIL> en mercado MX confirmado"
);
check("el email original ya NO aparece tras el scrub", reciboLimpio.includes("ana.tester"), false);

// Unicode-safe: un nombre con acento sobrevive intacto al scrub (no es PII
// de email ni timestamp, así que NO debe tocarse).
const conNombreUnicode = scrub("cliente: México 🍕");
check("el scrub no daña texto Unicode/emoji ajeno", conNombreUnicode, "cliente: México 🍕");

// ------------------------------------------------------------
// Cierre del CAPSTONE.
// ------------------------------------------------------------
console.log("\n   🎓 CAPSTONE completo: VALIDAR → PARSEAR → SCRUB sobre lote multi-mercado.");
console.log("   ✅ Todo con regex seguras (sin ReDoS), ancladas y Unicode-safe.");
