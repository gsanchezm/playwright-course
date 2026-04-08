// ============================================================
// Mini-clase 3.4: Arrow functions
// ============================================================
// Analogía: Una forma abreviada de escribir funciones simples.
// Perfectas para validaciones pequeñas dentro de un test.
// ============================================================

// Versión clásica:
//   function isSuccessCode(code: number): boolean { return code >= 200 && code < 300; }
// Versión arrow (más corta):
export const isSuccessCode = (code: number): boolean =>
  code >= 200 && code < 300;

export const isClientError = (code: number): boolean =>
  code >= 400 && code < 500;

console.log("\n===== 3.4 arrow functions =====");
console.log(`200 es éxito: ${isSuccessCode(200)}`);
console.log(`404 es éxito: ${isSuccessCode(404)}`);
console.log(`404 es error de cliente: ${isClientError(404)}`);
