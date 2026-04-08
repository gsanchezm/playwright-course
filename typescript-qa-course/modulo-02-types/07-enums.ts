// ============================================================
// Mini-clase 2.7: Enums
// ============================================================
// Analogía: Opciones cerradas que NO deberían cambiar:
// los ambientes de prueba o los estados de un bug.
// ============================================================
console.log("\n===== 2.7 enums =====");

enum Environment {
  QA = "QA",
  STAGING = "STAGING",
  PROD = "PROD",
}

enum BugStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

let currentEnv: Environment = Environment.QA;
let bugState: BugStatus = BugStatus.NEW;

console.log(`Current environment: ${currentEnv}`);
console.log(`Bug status: ${bugState}`);

// Un enum protege contra typos: solo se aceptan los valores declarados.
// currentEnv = "DEV"; // ❌ Error: "DEV" no existe en Environment
