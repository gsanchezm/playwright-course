// ============================================================
// Mini-clase 7.5: Cuándo NO usar regex (HTML/JSON anidado = parser)
// ============================================================
// Analogía: una llave inglesa es genial para tuercas, pero si la usas para
// clavar acabas con un desastre. La regex es genial para patrones PLANOS y
// regulares (un email, un SKU, una línea de log). Para estructuras
// ANIDADAS y recursivas (HTML, JSON) es la herramienta equivocada: se
// rompe en el primer caso real. Un QA senior sabe cuándo soltar la regex.
// ============================================================
import { check } from "../helpers/check";
import { HTML_SNIPPET, JSON_SNIPPET } from "../data/samples";

console.log("\n===== 7.5 Cuándo NO usar regex =====");

// ------------------------------------------------------------
// 1) Por qué la regex no puede con anidamiento: no es "regular".
// ------------------------------------------------------------
// HTML y JSON pueden anidarse a profundidad ARBITRARIA: un <div> dentro de
// otro <div>, un objeto dentro de un array dentro de un objeto. Las
// expresiones regulares (en el sentido teórico) NO pueden contar niveles
// de anidamiento equilibrados; eso requiere una gramática (un parser).
// Por eso cualquier regex "para extraer X de HTML" funciona en el demo y
// explota con datos reales. El clásico de StackOverflow: "no parsees HTML
// con regex".

// ------------------------------------------------------------
// 2) DEMOSTRACIÓN: una regex "ingenua" se ROMPE con HTML anidado.
// ------------------------------------------------------------
// HTML_SNIPPET = '<div class="order"><span class="item">Pizza</span><span>x2</span></div>'
// Intento ingenuo: "el texto dentro de un <span>...</span>" con .*?
// (lazy). Parece razonable... pero hay DOS <span> y el resultado depende
// de detalles del backtracking, no de la estructura. Veamos el fallo.
const reSpanIngenuo = /<span[^>]*>(.*?)<\/span>/; // SIN flag g: primer match

const m = reSpanIngenuo.exec(HTML_SNIPPET);
// Guarda de null (TS estricto): exec puede devolver null.
const primerSpan = m ? m[1] : null;
console.log(`   primer <span> capturado por la regex: ${JSON.stringify(primerSpan)}`);
// La regex captura SOLO "Pizza" (el primer span). El segundo <span>x2</span>
// se ignora por completo. Si tu intención era "leer el contenido del
// pedido", ya perdiste datos. La regex no entiende que hay DOS hijos.
check("la regex ingenua solo ve el PRIMER span (pierde 'x2')", primerSpan, "Pizza");

// Y con flag 'g' "para capturar todos" el problema empeora con anidamiento:
// si un <span> contuviera otro <span>, el .*? lazy cortaría en el </span>
// EQUIVOCADO (el interno), partiendo el contenido. Lo mostramos con un caso
// anidado declarado localmente (caso puntual, no toco samples.ts):
const htmlAnidado = "<span>外<span>内</span></span>"; // un span dentro de otro
const todos = [...htmlAnidado.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map((x) => x[1]);
console.log(`   spans capturados en HTML anidado: ${JSON.stringify(todos)}`);
// La regex devuelve ["外<span>内"] (cortó en el </span> interno): basura.
// Un parser devolvería el árbol correcto: span externo cuyo hijo es otro span.
check("la regex parte mal el span anidado (captura basura)", todos, ["外<span>内"]);

// ------------------------------------------------------------
// 3) La forma CORRECTA para HTML: un parser de DOM (comentario, NO ejecutar).
// ------------------------------------------------------------
// 🔷 En un NAVEGADOR usarías DOMParser:
//        const doc = new DOMParser().parseFromString(html, "text/html");
//        const spans = doc.querySelectorAll("span");        // ← estructura real
//        const textos = [...spans].map(s => s.textContent); // ["Pizza","x2"]
//    En Node (donde corre este curso con tsx) NO existe `DOMParser` global:
//    llamarlo lanzaría ReferenceError y tumbaría TODO el runner. Por eso
//    aquí lo dejamos como COMENTARIO. En un proyecto real instalarías
//    `jsdom`, `cheerio` o `node-html-parser`. La lección no es la librería,
//    es el CRITERIO: HTML → parser, no regex.

// ------------------------------------------------------------
// 4) JSON: la regex también se rompe; JSON.parse es la respuesta (y SÍ corre).
// ------------------------------------------------------------
// JSON_SNIPPET = '{"order":{"id":"ORD-1","items":[{"sku":"PZ-1234","qty":2}]}}'
// Intento ingenuo: sacar el "sku" con una regex. Parece funcionar en ESTE
// dato, pero es frágil: depende del orden de las claves, de los espacios,
// de que no haya un "sku" anidado en otro nivel, de comillas escapadas...
const reSkuIngenuo = /"sku"\s*:\s*"([^"]+)"/;
const mj = reSkuIngenuo.exec(JSON_SNIPPET);
const skuPorRegex = mj ? mj[1] : null;
check("regex 'casi' acierta el sku en ESTE JSON puntual", skuPorRegex, "PZ-1234");

// Pero la regex NO entiende la ESTRUCTURA. Reordena las claves y mira:
const jsonReordenado = '{"order":{"items":[{"qty":2,"sku":"PZ-1234"}],"id":"ORD-1"}}';
const otro = '{"meta":{"sku":"NO-ES-ESTE"},"order":{"items":[{"sku":"PZ-1234"}]}}';
// En 'otro', la regex agarra el PRIMER "sku" que ve, que es el equivocado:
const mWrong = reSkuIngenuo.exec(otro);
check("regex agarra el sku EQUIVOCADO si hay otro 'sku' antes", mWrong ? mWrong[1] : null, "NO-ES-ESTE");

// La forma CORRECTA: JSON.parse devuelve un OBJETO y navegas por la ruta
// REAL. Esto SÍ se ejecuta (JSON.parse es nativo, sin dependencias).
interface Pedido {
  order: { id?: string; items: { sku: string; qty?: number }[] };
}
function skuPorParser(jsonTexto: string): string | null {
  try {
    const data = JSON.parse(jsonTexto) as Pedido;
    return data.order?.items?.[0]?.sku ?? null; // ruta explícita y robusta
  } catch {
    return null; // JSON malformado: lo manejamos, no crasheamos
  }
}
check("parser saca el sku correcto del JSON original", skuPorParser(JSON_SNIPPET), "PZ-1234");
check("parser saca el sku correcto aunque reordenen claves", skuPorParser(jsonReordenado), "PZ-1234");
check("parser ignora el 'sku' señuelo de meta y va a order.items", skuPorParser(otro), "PZ-1234");
check("parser devuelve null con JSON malformado (no crashea)", skuPorParser('{"order": BAD}'), null);

// ------------------------------------------------------------
// 5) Criterio SENIOR: ¿cuándo el costo de la regex supera el beneficio?
// ------------------------------------------------------------
// Suelta la regex y usa un parser/librería cuando:
//   • La estructura ANIDA o es recursiva (HTML, XML, JSON, código).
//   • Necesitas la JERARQUÍA, no solo un dato plano de una línea.
//   • El patrón crece con lookaheads/grupos hasta volverse ilegible.
//   • Hay un parser estándar y probado (JSON.parse, DOMParser, una lib).
// Sigue usando regex cuando el dato es PLANO y regular:
//   • Validar formato de un email/SKU/UUID/fecha (M01–M06).
//   • Extraer campos de UNA línea de log.
//   • Scrubbing de tokens volátiles en un texto.
// Regla de bolsillo: "si para entenderlo necesito contar paréntesis
// equilibrados, no es trabajo de regex".
console.log("   ✅ Demostrado: regex se rompe con anidamiento; el parser acierta.");
