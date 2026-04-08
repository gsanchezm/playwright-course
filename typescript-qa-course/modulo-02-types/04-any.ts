// ============================================================
// Mini-clase 2.4: any (y por qué evitarlo)
// ============================================================
// Analogía: Sería como aceptar CUALQUIER dato en un campo de formulario
// sin validar nada. Pierdes toda la protección que te da TypeScript.
// ============================================================
console.log("\n===== 2.4 any =====");

// ❌ Mala práctica: "any" acepta cualquier cosa sin avisarte de errores.
let data: any = "esto puede ser cualquier cosa";
data = 42;
data = true;
data = { foo: "bar" };

console.log(`Valor actual de 'data': ${JSON.stringify(data)}`);

// El problema: TypeScript no te avisará si usas 'data' como si fuera
// un tipo que no es. Esto se nota en runtime, no en tiempo de compilación.
// data.toUpperCase(); // 💥 crash si data no es string

// ✅ Alternativa segura: "unknown" te obliga a verificar el tipo antes de usarlo.
let safeData: unknown = "hola";
if (typeof safeData === "string") {
  console.log(`En mayúsculas: ${safeData.toUpperCase()}`);
}
