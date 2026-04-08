// ============================================================
// Mini-clase 2.3: string
// ============================================================
// Analogía: URLs, mensajes de error, nombres de ambientes,
// selectores CSS... casi todo lo que ves en un test es un string.
// ============================================================
console.log("\n===== 2.3 string =====");

let baseUrl: string = "https://qa.myapp.com";
let errorMessage: string = "Element not found";
let cssSelector: string = "#submit-btn";

console.log(`Base URL: ${baseUrl}`);
console.log(`Error: ${errorMessage}`);
console.log(`Selector: ${cssSelector}`);

// Template literals: permiten interpolar variables dentro de un string
// usando backticks (`) y ${variable}. Muy útil para logs de tests.
const testName: string = "Login válido";
const duration: number = 850;
console.log(`[PASSED] ${testName} en ${duration}ms`);
