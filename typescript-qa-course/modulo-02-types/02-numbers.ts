// ============================================================
// Mini-clase 2.2: number
// ============================================================
// Analogía: Códigos de estado HTTP, tiempos de respuesta,
// cantidad de tests ejecutados.
// ============================================================
console.log("\n===== 2.2 number =====");

let statusCode: number = 200;
let responseTime: number = 1.35; // segundos
let retries: number = 3;

console.log(`Status: ${statusCode}`);
console.log(`Response time: ${responseTime}s`);
console.log(`Retries configurados: ${retries}`);

// TypeScript permite enteros y decimales en el mismo tipo "number".
const totalTime: number = responseTime * retries;
console.log(`Tiempo total estimado: ${totalTime}s`);
