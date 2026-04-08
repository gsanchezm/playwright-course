// ============================================================
// Mini-clase 4.4: Union Types ( | )
// ============================================================
// Analogía: Un campo que SOLO acepta ciertas opciones cerradas.
// Como el estado de un botón o el tipo de dato de una respuesta.
// ============================================================

// Opciones cerradas tipo string:
export type ButtonState = "enabled" | "disabled" | "loading";

// Varios tipos primitivos en un mismo campo:
export type ApiResult = string | number | boolean;

export function processResult(result: ApiResult): void {
  console.log(`Result: ${result} (type: ${typeof result})`);
}

console.log("\n===== 4.4 union types =====");

let submitButton: ButtonState = "enabled";
console.log(`Button state: ${submitButton}`);
submitButton = "loading";
console.log(`Button state: ${submitButton}`);
// submitButton = "invisible"; // ❌ Error: valor no permitido

processResult("Success");
processResult(200);
processResult(true);
