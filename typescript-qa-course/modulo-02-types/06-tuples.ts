// ============================================================
// Mini-clase 2.6: Tuples
// ============================================================
// Analogía: Un par fijo de valores con tipos conocidos.
// Como un par "código HTTP + mensaje" de una respuesta.
// ============================================================
console.log("\n===== 2.6 tuples =====");

// Una tupla tiene CANTIDAD y TIPOS fijos en un orden específico.
let httpResponse: [number, string, boolean] = [404, "Not Found", true];
let loginResult: [boolean, string] = [true, "Login successful"];

console.log(`HTTP Response: ${httpResponse[0]} - ${httpResponse[1]}`);
console.log(`Login result: passed=${loginResult[0]}, msg=${loginResult[1]}`);

// ❌ Esto daría error de compilación:
// httpResponse = ["Not Found", 404]; // orden incorrecto
// httpResponse = [404]; // falta el segundo elemento

// ------------------------------------------------------------
// Arreglo de tuplas: una lista de respuestas HTTP esperadas
// ------------------------------------------------------------
// Analogía: una tabla de casos de prueba donde cada fila tiene
// [código, mensaje] con tipos fijos.
let httpResponses: [number, string][] = [
  [200, "OK"],
  [201, "Created"],
  [400, "Bad Request"],
  [404, "Not Found"],
  [500, "Internal Server Error"],
];

console.log("\n--- Iterando arreglo de tuplas ---");
httpResponses.forEach(([code, message], index) => {
  console.log(`Caso #${index + 1}: ${code} → ${message}`);
});
