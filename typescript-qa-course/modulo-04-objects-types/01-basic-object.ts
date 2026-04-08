// ============================================================
// Mini-clase 4.1: Objeto básico (sin tipo personalizado)
// ============================================================
// Analogía: Un JSON (payload) con los datos de un usuario de prueba.
// Sin un "contrato" (type), TypeScript infiere los tipos pero no
// puedes reutilizar esa forma en otros lugares.
// ============================================================
console.log("\n===== 4.1 objeto básico =====");

const testUser = {
  name: "John Doe",
  age: 30,
  role: "admin",
};

console.log(`User: ${testUser.name}`);
console.log(`Role: ${testUser.role}`);
console.log(`Edad: ${testUser.age}`);

// Problema: si quieres otro usuario con la MISMA estructura,
// tendrías que repetir la forma. Solución → "type" (siguiente archivo).
