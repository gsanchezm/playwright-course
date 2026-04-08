// ============================================================
// Mini-clase 1.2: Variables básicas con tipo
// ============================================================
console.log("\n===== 1.2 variables =====");
// Analogía: Una variable es como un "campo" dentro de tu reporte
// de pruebas: tiene un nombre y guarda un valor.
// ============================================================

// const = valor que NO cambia (constante). Lo recomendado por defecto.
const suiteName: string = "Smoke Test Suite";
const totalTests: number = 5;

console.log(`Starting: ${suiteName}`);
console.log(`Total tests to run: ${totalTests}`);

// También existe "let" para valores que SÍ cambian durante la prueba.
let testsExecuted: number = 0;
testsExecuted = testsExecuted + 1;
console.log(`Tests ejecutados hasta ahora: ${testsExecuted}`);
