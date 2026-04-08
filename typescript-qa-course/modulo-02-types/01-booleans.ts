// ============================================================
// Mini-clase 2.1: boolean
// ============================================================
// Analogía: El resultado de tu caso de prueba: PASSED / FAILED.
// Solo hay dos valores posibles: true o false.
// ============================================================
console.log("\n===== 2.1 boolean =====");

let testPassed: boolean = true;
let hasErrors: boolean = false;

console.log(`Test passed: ${testPassed}`);
console.log(`Tiene errores: ${hasErrors}`);

// Un boolean también puede venir del resultado de una comparación.
const expected: number = 200;
const actual: number = 200;
const assertionResult: boolean = expected === actual;
console.log(`Assertion (${expected} === ${actual}): ${assertionResult}`);
