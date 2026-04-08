// ============================================================
// Mini-clase 2.6: Tuples
// ============================================================
// Analogía: Un par fijo de valores con tipos conocidos.
// Como un par "código HTTP + mensaje" de una respuesta.
// ============================================================
console.log("\n===== 2.6 tuples =====");

// Una tupla tiene CANTIDAD y TIPOS fijos en un orden específico.
let httpResponse: [number, string] = [404, "Not Found"];
let loginResult: [boolean, string] = [true, "Login successful"];

console.log(`HTTP Response: ${httpResponse[0]} - ${httpResponse[1]}`);
console.log(`Login result: passed=${loginResult[0]}, msg=${loginResult[1]}`);

// ❌ Esto daría error de compilación:
// httpResponse = ["Not Found", 404]; // orden incorrecto
// httpResponse = [404]; // falta el segundo elemento
