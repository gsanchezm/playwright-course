// ============================================================
// Mini-clase 6.4: Validación data-driven (matriz de regresión)
// ============================================================
// Analogía: en vez de escribir un test por cada caso, defines una TABLA
// de casos { input, debeCoincidir, descripcion } y la recorres en bucle.
// Es una "matriz de regresión": agregar un caso nuevo (un bug encontrado)
// es una línea más en la tabla, no un test nuevo entero. Cada fila se
// auto-documenta con su descripción.
// ============================================================
import { checkMatch } from "../helpers/check";
import { SKUS_VALIDOS, SKUS_INVALIDOS } from "../data/samples";

console.log("\n===== 6.4 Validación data-driven (matriz de regresión) =====");

// SKU de pizza OmniPizza: PZ-#### → exactamente 2 letras MAYÚSCULAS,
// guion, y exactamente 4 dígitos. Anclado, porque "PZ-12345" (5 díg) y
// "PZ-12" (2 díg) deben fallar — sin $ , "PZ-1234" colaría dentro de
// "PZ-12345".
const reSku = /^[A-Z]{2}-\d{4}$/;

// ------------------------------------------------------------
// La TABLA de casos. Mezclamos los datos del contrato (samples.ts) con
// la expectativa explícita por fila. Esta es la "fuente de verdad".
// ------------------------------------------------------------
interface CasoValidacion {
  input: string;
  debeCoincidir: boolean;
  descripcion: string;
}

// Construimos la tabla a partir de los arreglos compartidos + una
// descripción razonada de POR QUÉ cada caso es válido o no.
const motivoInvalido: Record<string, string> = {
  "pz-1234": "letras en minúscula (deben ser mayúsculas)",
  "PZ-12": "solo 2 dígitos (se requieren 4)",
  "PZA-1234": "3 letras (se requieren exactamente 2)",
  "PZ-12345": "5 dígitos (se requieren exactamente 4)",
  "PZ1234": "falta el guion separador",
  "P-1234": "solo 1 letra (se requieren exactamente 2)",
};

const TABLA_SKU: CasoValidacion[] = [
  ...SKUS_VALIDOS.map((sku) => ({
    input: sku,
    debeCoincidir: true,
    descripcion: `SKU bien formado: ${sku}`,
  })),
  ...SKUS_INVALIDOS.map((sku) => ({
    input: sku,
    debeCoincidir: false,
    descripcion: `rechazar "${sku}" — ${motivoInvalido[sku] ?? "formato inválido"}`,
  })),
];

// ------------------------------------------------------------
// El RECORRIDO: una sola línea de lógica de test, N casos cubiertos.
// Imprimimos la descripción para que el reporte sea legible por humanos.
// ------------------------------------------------------------
for (const caso of TABLA_SKU) {
  console.log(`· ${caso.descripcion}`);
  checkMatch(reSku, caso.input, caso.debeCoincidir);
}
