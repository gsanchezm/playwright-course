// ============================================================
// Mini-clase 3.4: Retro-referencias \1 y \k<nombre>
// ============================================================
// Analogía: una retro-referencia es "lo MISMO que ya capturé, otra vez".
// Como cuando en QA exiges que el campo "contraseña" y "confirmar
// contraseña" sean idénticos: no basta con que ambos sean válidos, deben
// COINCIDIR ENTRE SÍ. La regex puede comparar una parte del texto consigo
// misma, algo que un patrón "normal" (sin memoria) no puede hacer.
// ============================================================
import { check, checkMatch } from "../helpers/check";
import { LINEA_PALABRA_DUPLICADA } from "../data/samples";
console.log("\n===== 3.4 Retro-referencias \\1 y \\k<nombre> =====");

// ------------------------------------------------------------
// 1) \1 = "repite EXACTAMENTE lo que capturó el grupo 1"
// ------------------------------------------------------------
// Detectar palabra duplicada pegada: capturamos una palabra (\w+) y luego
// exigimos un espacio y la MISMA palabra otra vez (\1). \b al inicio y fin
// evita matches parciales dentro de otra palabra.
const reDup = /\b(\w+)\s+\1\b/;
checkMatch(reDup, "el el", true); // misma palabra repetida
checkMatch(reDup, "el la", false); // distintas → no es duplicado
checkMatch(reDup, "se se", true);

// ------------------------------------------------------------
// 2) Aplicado al log real: LINEA_PALABRA_DUPLICADA
// ------------------------------------------------------------
// "el el pedido se se confirmó" tiene DOS duplicados: "el el" y "se se".
// Con la flag g + matchAll los encontramos todos. Cada match tiene en
// m[1] la palabra repetida.
const reDupG = /\b(\w+)\s+\1\b/g;
const duplicados: string[] = [];
for (const m of LINEA_PALABRA_DUPLICADA.matchAll(reDupG)) {
  // m[1] existe porque el patrón tiene exactamente un grupo de captura.
  duplicados.push(m[1]);
}
check("palabras duplicadas encontradas", duplicados, ["el", "se"]);
check("cantidad de duplicados", duplicados.length, 2);

// La primera coincidencia completa (m[0]) incluye AMBAS palabras + espacio.
const primer = LINEA_PALABRA_DUPLICADA.match(reDup);
check("primer match completo", primer ? primer[0] : null, "el el");

// ------------------------------------------------------------
// 3) \k<nombre> = retro-referencia a un grupo NOMBRADO
// ------------------------------------------------------------
// Misma idea que \1 pero legible: capturamos (?<palabra>\w+) y la repetimos
// con \k<palabra>. Útil cuando el patrón crece y los números confunden.
const reDupNombrado = /\b(?<palabra>\w+)\s+\k<palabra>\b/;
const mNom = "se se confirmó".match(reDupNombrado);
// Doble guarda: match puede ser null y .groups puede ser undefined.
const repetida = mNom && mNom.groups ? mNom.groups.palabra : null;
check("palabra repetida (grupo nombrado)", repetida, "se");

// ------------------------------------------------------------
// 4) Caso QA clásico: ¿password === confirmPassword?
// ------------------------------------------------------------
// Un solo patrón valida que ambos campos sean iguales SIN comparar en JS.
// Formato de entrada: "Pizza123!:Pizza123!" (valor:confirmación).
// (?<pw>...) captura el primero y \k<pw> exige que el segundo sea idéntico.
const rePwIgual = /^(?<pw>.+):\k<pw>$/;
checkMatch(rePwIgual, "Pizza123!:Pizza123!", true); // coinciden → ok
checkMatch(rePwIgual, "Pizza123!:Pizza124!", false); // difieren → rechaza

// ------------------------------------------------------------
// 5) Detectar etiqueta HTML mal cerrada (apertura ≠ cierre)
// ------------------------------------------------------------
// Recordatorio honesto: regex NO es la herramienta para parsear HTML real
// (lo veremos en M07). Pero como EJERCICIO de retro-referencias, validar
// que <tag>...</tag> use el MISMO nombre de etiqueta ilustra bien el \k.
const reTag = /^<(?<tag>[a-z]+)>.*<\/\k<tag>>$/;
checkMatch(reTag, "<span>texto</span>", true); // misma etiqueta
checkMatch(reTag, "<span>texto</div>", false); // abre span, cierra div
