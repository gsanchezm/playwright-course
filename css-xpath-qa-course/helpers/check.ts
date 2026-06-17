// ============================================================
// helpers/check.ts — aserciones didacticas para el curso de Selectores
// ============================================================
// Convierte cada ejemplo en una micro-asercion (mentalidad de testing):
// en vez de solo imprimir un resultado, lo COMPARAMOS contra lo esperado
// y mostramos ✅ o ❌. Cero dependencias de testing: corre con `tsx`.
//
// Lo importan TODAS las mini-clases:
//   import { check } from "../helpers/check";
// y se combina con los helpers de DOM:
//   import { countCss, countXpath, text } from "../helpers/dom";
// ============================================================

// Igualdad estructural simple: primitivos por valor; arrays/objetos por
// su JSON. Suficiente para los ejemplos del curso (no es deep-equal real).
function sonIguales(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  return JSON.stringify(a) === JSON.stringify(b);
}

function mostrar(valor: unknown): string {
  return typeof valor === "string" ? JSON.stringify(valor) : JSON.stringify(valor) ?? String(valor);
}

/**
 * ¿El resultado real coincide con el esperado?
 * Imprime `✅ etiqueta` o `❌ etiqueta — esperado: X, obtenido: Y`.
 */
export function check(etiqueta: string, real: unknown, esperado: unknown): void {
  if (sonIguales(real, esperado)) {
    console.log(`✅ ${etiqueta}`);
  } else {
    console.log(`❌ ${etiqueta} — esperado: ${mostrar(esperado)}, obtenido: ${mostrar(real)}`);
  }
}

/**
 * Imprime un encabezado de seccion para separar bloques de checks en la
 * salida (puramente cosmetico, ayuda a leer el output de `ejemplo.ts`).
 */
export function titulo(texto: string): void {
  console.log(`\n— ${texto}`);
}
