// ============================================================
// helpers/check.ts — aserciones didácticas para el curso de Regex
// ============================================================
// Convierte cada ejemplo en una micro-aserción (mentalidad de testing):
// en vez de solo imprimir un resultado, lo COMPARAMOS contra lo esperado
// y mostramos ✅ o ❌. Cero dependencias: corre con `tsx`.
//
// Lo importan TODAS las mini-clases:
//   import { check, checkMatch } from "../helpers/check";
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
 * ¿La regex coincide (o NO) con el input, según se espera?
 *   debeCoincidir=true  → esperamos que la regex matchee el input.
 *   debeCoincidir=false → esperamos que NO lo matchee.
 *
 * Internamente usa una copia de la regex SIN las flags `g`/`y` para que
 * `.test()` no dependa de `lastIndex` (un check debe ser determinista).
 */
export function checkMatch(re: RegExp, input: string, debeCoincidir: boolean): void {
  const flagsSinEstado = re.flags.replace("g", "").replace("y", "");
  const limpia = new RegExp(re.source, flagsSinEstado);
  const coincide = limpia.test(input);
  const verbo = debeCoincidir ? "matchea" : "rechaza";
  const etiqueta = `/${re.source}/${re.flags} ${verbo} ${JSON.stringify(input)}`;
  if (coincide === debeCoincidir) {
    console.log(`✅ ${etiqueta}`);
  } else {
    console.log(`❌ ${etiqueta} — coincide=${coincide}, se esperaba coincide=${debeCoincidir}`);
  }
}
