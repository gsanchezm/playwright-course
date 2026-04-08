// ============================================================
// Mini-clase 2.5: Arrays
// ============================================================
// Analogía: Listas de datos de prueba, usuarios de prueba,
// códigos de respuesta esperados, etc.
// ============================================================
console.log("\n===== 2.5 arrays =====");

// Array de strings: lista de usuarios de prueba
let testUsers: string[] = [
  "admin@test.com",
  "viewer@test.com",
  "editor@test.com",
];

// Array de numbers: códigos HTTP esperados
let responseCodes: number[] = [200, 201, 404, 500];

console.log(`Test users: ${testUsers.join(", ")}`);
console.log(`Códigos esperados: ${responseCodes.join(", ")}`);
console.log(`Cantidad de usuarios: ${testUsers.length}`);
console.log(`Primer usuario: ${testUsers[0]}`);

// Puedes agregar elementos con push()
testUsers.push("qa@test.com");
console.log(`Después de push: ${testUsers.length} usuarios`);
