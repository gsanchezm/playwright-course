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

// Iterar con forEach: ejecutar una acción por cada elemento
// Analogía: correr el mismo caso de prueba con distintos usuarios
console.log("\n--- Iterando usuarios con forEach ---");
testUsers.forEach((user, index) => {
  console.log(`Usuario #${index + 1}: ${user}`);
});

// ⚠️ ¿Qué pasa si accedo a un índice que NO existe?
// Si el arreglo tiene 3 elementos, los índices válidos son 0, 1 y 2.
// Acceder al índice 3 (el "4to elemento") devuelve `undefined` en runtime.
let colors: string[] = ["red", "green", "blue"]; // 3 elementos
console.log(`\nTotal de colores: ${colors.length}`);
console.log(`Índice 0: ${colors[0]}`); // "red"
console.log(`Índice 3 (no existe): ${colors[3]}`); // undefined

// TypeScript NO marca error en compilación con `string[]` aquí,
// pero en runtime obtienes `undefined`, lo que puede romper tu test
// si intentas usarlo como si fuera un string real.
let fourthColor = colors[3];
console.log(`¿Es undefined?: ${fourthColor === undefined}`); // true
