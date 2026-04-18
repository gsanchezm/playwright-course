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

// ============================================================
// Enums numéricos (con o sin inicialización)
// ============================================================

// 1. Enum numérico por defecto (comienza en 0 y se autoincrementa)
enum StatusCode {
  SUCCESS,       // 0
  NOT_FOUND,     // 1
  SERVER_ERROR,  // 2
}

let code: StatusCode = StatusCode.SUCCESS;
console.log(`Default numeric enum (SUCCESS): ${code}`);
console.log(`Default numeric enum (NOT_FOUND): ${StatusCode.NOT_FOUND}`);

// 2. Enum numérico con un valor inicial específico (se autoincrementan desde ese valor)
enum Priority {
  LOW = 1,
  MEDIUM, // 2
  HIGH,   // 3
}

console.log(`Custom numeric enum (LOW): ${Priority.LOW}`);
console.log(`Custom numeric enum (HIGH): ${Priority.HIGH}`);

// ============================================================
// Extraer el texto de un enum
// ============================================================

// 1. En Enums de String: El valor en sí mismo es el texto.
console.log(`\nTexto de BugStatus.IN_PROGRESS: ${BugStatus.IN_PROGRESS}`);

// 2. En Enums Numéricos: Podemos usar "Reverse Mapping" (Mapeo Inverso)
// Puedes acceder al string (nombre de la llave) pasándole el número de su valor.
let textCode: string = StatusCode[0];
console.log(`El texto paraStatusCode[0] es: ${textCode}`); // Imprime: "SUCCESS"

let priorityText: string = Priority[3];
console.log(`El texto para Priority[3] es: ${priorityText}`); // Imprime: "HIGH"
