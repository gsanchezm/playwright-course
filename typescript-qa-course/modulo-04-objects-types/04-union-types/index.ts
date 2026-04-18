// ============================================================
// Mini-clase 4.4: Union Types ( | )
// ============================================================
// Analogía: Un campo que SOLO acepta ciertas opciones cerradas.
// Como el estado de un botón o el tipo de dato de una respuesta.
//
// Demo: usa ButtonState para una variable y llama a processResult
// con distintos tipos permitidos por ApiResult.
// ============================================================

import type { ButtonState } from "./button-state.type";
import { processResult } from "./process-result";

console.log("\n===== 4.4 union types =====");

let submitButton: ButtonState = "enabled";
console.log(`Button state: ${submitButton}`);
submitButton = "loading";
console.log(`Button state: ${submitButton}`);
// submitButton = "invisible"; // ❌ Error: valor no permitido

processResult("Success");
processResult(200);
processResult(true);
