// ============================================================
// Mini-clase 6.5: Replace avanzado (replacer, $<grupo>, matchAll, replaceAll)
// ============================================================
// Analogía: a veces no basta con "buscar y reemplazar texto fijo". Quieres
// REORDENAR (fecha ISO → dd/mm/yyyy), TRANSFORMAR (mayúsculas, cálculos)
// o EXTRAER TODO de un golpe. Estas son las herramientas finas del cinturón:
// la función replacer, la sustitución por grupo nombrado $<nombre>,
// String.matchAll y String.replaceAll.
// ============================================================
import { check } from "../helpers/check";

console.log("\n===== 6.5 Replace avanzado =====");

// ------------------------------------------------------------
// 1) $<nombre> : sustitución usando GRUPOS NOMBRADOS en el reemplazo
// ------------------------------------------------------------
// Reordenamos una fecha ISO (yyyy-mm-dd) a formato local (dd/mm/yyyy)
// SIN escribir código: el string de reemplazo referencia los grupos por
// nombre con la sintaxis $<nombre>. Mucho más legible que $1/$2/$3.
const reFechaNombrada = /(?<anio>\d{4})-(?<mes>\d{2})-(?<dia>\d{2})/;
const fechaLocal = "2026-06-16".replace(reFechaNombrada, "$<dia>/$<mes>/$<anio>");
check("fecha ISO → dd/mm/yyyy con $<grupo>", fechaLocal, "16/06/2026");

// ------------------------------------------------------------
// 2) FUNCIÓN replacer : el reemplazo se CALCULA por cada coincidencia
// ------------------------------------------------------------
// El 2.º argumento de replace puede ser una función. Recibe la
// coincidencia y los grupos, y devuelve el texto a insertar. Aquí
// convertimos cada precio "total=NNN.NN" aplicando un 16% de impuesto.
// (Demuestra cálculo dentro del replace — algo imposible con string fijo.)
const reTotal = /total=(\d+\.\d{2})/g;
const conImpuesto = "a total=100.00 b total=250.00".replace(
  reTotal,
  (_match, monto: string) => {
    const conIva = (Number(monto) * 1.16).toFixed(2);
    return `total=${conIva}`;
  }
);
// 100.00 * 1.16 = 116.00 ; 250.00 * 1.16 = 290.00 (razonado a mano)
check("replacer aplica IVA 16%", conImpuesto, "a total=116.00 b total=290.00");

// Variante: grupos NOMBRADOS llegan a la función en el último argumento
// como objeto `groups`. Útil cuando hay varios grupos y el orden cansa.
const reSku = /(?<letras>[A-Z]{2})-(?<num>\d{4})/g;
const normalizado = "items: PZ-1234 y PZ-0001".replace(
  reSku,
  (...args) => {
    // El último arg es el objeto de grupos nombrados (puede ser undefined
    // en teoría → lo tipamos y verificamos para que tsc strict esté feliz).
    const grupos = args[args.length - 1] as { letras: string; num: string };
    return `${grupos.letras}#${grupos.num}`;
  }
);
check("replacer con grupos nombrados", normalizado, "items: PZ#1234 y PZ#0001");

// ------------------------------------------------------------
// 3) String.matchAll : iterar TODAS las coincidencias con sus grupos
// ------------------------------------------------------------
// ⚠️ matchAll EXIGE flag 'g' o lanza TypeError. Devuelve un iterador de
// matches, cada uno con índice y grupos. Extraemos todos los SKUs de un
// texto a un array de objetos — el patrón clásico de "scraping de logs".
const textoSkus = "pedido con PZ-1234, PZ-0001 y PZ-9999 confirmado";
const reSkuG = /(?<letras>[A-Z]{2})-(?<num>\d{4})/g;
const encontrados: string[] = [];
for (const m of textoSkus.matchAll(reSkuG)) {
  // m.groups es `{...} | undefined` en strict → lo verificamos.
  if (m.groups) encontrados.push(`${m.groups.letras}-${m.groups.num}`);
}
check("matchAll extrae todos los SKUs", encontrados, ["PZ-1234", "PZ-0001", "PZ-9999"]);
check("matchAll encontró 3 SKUs", encontrados.length, 3);

// ------------------------------------------------------------
// 4) String.replaceAll : reemplazo de TODAS las ocurrencias
// ------------------------------------------------------------
// Con STRING literal, replaceAll no necesita regex (reemplaza texto fijo
// en todas partes; replace() solo cambiaría la 1.ª).
const sinComas = "1,234,567".replaceAll(",", "");
check("replaceAll con string literal", sinComas, "1234567");

// ⚠️ Con REGEX, replaceAll EXIGE la flag 'g' (si no, lanza TypeError).
// Enmascaramos todos los emails de una línea con un placeholder.
const reEmailG = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const enmascarado = "contacto: a@x.com y b@y.org".replaceAll(reEmailG, "<EMAIL>");
check("replaceAll con regex+g enmascara emails", enmascarado, "contacto: <EMAIL> y <EMAIL>");
