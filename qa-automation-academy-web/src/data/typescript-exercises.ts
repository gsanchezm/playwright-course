// Código real extraído de typescript-qa-course/
// Se mantiene como string plano y se tokeniza en runtime con
// src/lib/tokenize-ts.ts para evitar escribir tokens a mano.

export type Exercise = {
  id: string;
  module: string;
  label: string;
  filename: string;
  description: string;
  code: string;
};

export const typescriptExercises: Exercise[] = [
  {
    id: "m1-console-log",
    module: "Módulo 1 · Hello World",
    label: "1.1 console.log",
    filename: "modulo-01-hello-world/01-console-log.ts",
    description:
      "Tu primer 'test': imprimir resultados en consola para depurar.",
    code: `// Mini-clase 1.1: Nuestro primer "Test" con console.log
// Analogía: escribir un caso de prueba y ver en consola que
// el resultado esperado coincide con el real.
console.log("\\n===== 1.1 console.log =====");

// console.log() es la forma más simple de "imprimir" un resultado.
// Lo usarás mucho para depurar tus tests de automatización.
console.log("Hello, Automation!");

// Puedes imprimir varios valores en la misma línea.
console.log("Test ejecutado correctamente");`,
  },
  {
    id: "m1-variables",
    module: "Módulo 1 · Hello World",
    label: "1.2 variables",
    filename: "modulo-01-hello-world/02-variables.ts",
    description: "const vs let: nombres y valores de tus campos de reporte.",
    code: `// Mini-clase 1.2: Variables básicas con tipo
// Analogía: una variable es un "campo" de tu reporte de pruebas.
console.log("\\n===== 1.2 variables =====");

// const = valor que NO cambia. Lo recomendado por defecto.
const suiteName: string = "Smoke Test Suite";
const totalTests: number = 5;

console.log(\`Starting: \${suiteName}\`);
console.log(\`Total tests to run: \${totalTests}\`);

// let para valores que SÍ cambian durante la prueba.
let testsExecuted: number = 0;
testsExecuted = testsExecuted + 1;
console.log(\`Tests ejecutados: \${testsExecuted}\`);`,
  },
  {
    id: "m2-booleans",
    module: "Módulo 2 · Tipos",
    label: "2.1 boolean",
    filename: "modulo-02-types/01-booleans.ts",
    description: "PASSED / FAILED: el resultado binario de todo caso de prueba.",
    code: `// Mini-clase 2.1: boolean
// Analogía: el resultado de tu caso de prueba: PASSED / FAILED.
console.log("\\n===== 2.1 boolean =====");

let testPassed: boolean = true;
let hasErrors: boolean = false;

console.log(\`Test passed: \${testPassed}\`);
console.log(\`Tiene errores: \${hasErrors}\`);

// Un boolean también puede venir de una comparación.
const expected: number = 200;
const actual: number = 200;
const assertionResult: boolean = expected === actual;
console.log(\`Assertion (\${expected} === \${actual}): \${assertionResult}\`);`,
  },
  {
    id: "m2-numbers",
    module: "Módulo 2 · Tipos",
    label: "2.2 number",
    filename: "modulo-02-types/02-numbers.ts",
    description: "Códigos HTTP, tiempos de respuesta y contadores.",
    code: `// Mini-clase 2.2: number
// Analogía: códigos HTTP, tiempos de respuesta, cantidad de tests.
console.log("\\n===== 2.2 number =====");

let statusCode: number = 200;
let responseTime: number = 1.35;
let retries: number = 3;

console.log(\`Status: \${statusCode}\`);
console.log(\`Response time: \${responseTime}s\`);
console.log(\`Retries configurados: \${retries}\`);

// TypeScript acepta enteros y decimales en el mismo tipo "number".
const totalTime: number = responseTime * retries;
console.log(\`Tiempo total estimado: \${totalTime}s\`);`,
  },
  {
    id: "m2-strings",
    module: "Módulo 2 · Tipos",
    label: "2.3 string",
    filename: "modulo-02-types/03-strings.ts",
    description: "URLs, selectores y mensajes: casi todo en un test es string.",
    code: `// Mini-clase 2.3: string
// Analogía: URLs, mensajes de error, ambientes, selectores CSS.
console.log("\\n===== 2.3 string =====");

let baseUrl: string = "https://qa.myapp.com";
let errorMessage: string = "Element not found";
let cssSelector: string = "#submit-btn";

console.log(\`Base URL: \${baseUrl}\`);
console.log(\`Error: \${errorMessage}\`);
console.log(\`Selector: \${cssSelector}\`);

// Template literals: interpolan variables con backticks y \${...}.
const testName: string = "Login válido";
const duration: number = 850;
console.log(\`[PASSED] \${testName} en \${duration}ms\`);`,
  },
  {
    id: "m2-any",
    module: "Módulo 2 · Tipos",
    label: "2.4 any",
    filename: "modulo-02-types/04-any.ts",
    description: "Por qué evitar 'any' y cuándo usar 'unknown' en su lugar.",
    code: `// Mini-clase 2.4: any (y por qué evitarlo)
// Analogía: aceptar CUALQUIER dato en un campo sin validar nada.
console.log("\\n===== 2.4 any =====");

// Mala práctica: "any" acepta cualquier cosa sin avisar de errores.
let data: any = "esto puede ser cualquier cosa";
data = 42;
data = true;
data = { foo: "bar" };

console.log(\`Valor actual de 'data': \${JSON.stringify(data)}\`);

// Alternativa segura: "unknown" te obliga a verificar el tipo.
let safeData: unknown = "hola";
if (typeof safeData === "string") {
  console.log(\`En mayúsculas: \${safeData.toUpperCase()}\`);
}`,
  },
  {
    id: "m2-arrays",
    module: "Módulo 2 · Tipos",
    label: "2.5 arrays",
    filename: "modulo-02-types/05-arrays.ts",
    description: "Listas de datos, forEach y el peligro de acceder fuera de rango.",
    code: `// Mini-clase 2.5: Arrays
// Analogía: listas de usuarios de prueba, códigos esperados, etc.
console.log("\\n===== 2.5 arrays =====");

let testUsers: string[] = [
  "admin@test.com",
  "viewer@test.com",
  "editor@test.com",
];
let responseCodes: number[] = [200, 201, 404, 500];

console.log(\`Test users: \${testUsers.join(", ")}\`);
console.log(\`Cantidad de usuarios: \${testUsers.length}\`);
testUsers.push("qa@test.com");

// Iterar con forEach: un caso de prueba por usuario.
testUsers.forEach((user, index) => {
  console.log(\`Usuario #\${index + 1}: \${user}\`);
});

// Acceder a un índice que NO existe devuelve undefined en runtime.
let colors: string[] = ["red", "green", "blue"];
console.log(\`Índice 3 (no existe): \${colors[3]}\`);`,
  },
  {
    id: "m2-tuples",
    module: "Módulo 2 · Tipos",
    label: "2.6 tuples",
    filename: "modulo-02-types/06-tuples.ts",
    description: "Pares fijos [código, mensaje] y cómo iterar arreglos de tuplas.",
    code: `// Mini-clase 2.6: Tuples
// Analogía: un par fijo "código HTTP + mensaje" de una respuesta.
console.log("\\n===== 2.6 tuples =====");

// Una tupla tiene CANTIDAD y TIPOS fijos en un orden específico.
let httpResponse: [number, string, boolean] = [404, "Not Found", true];
let loginResult: [boolean, string] = [true, "Login successful"];

console.log(\`HTTP: \${httpResponse[0]} - \${httpResponse[1]}\`);
console.log(\`Login: passed=\${loginResult[0]}, msg=\${loginResult[1]}\`);

// Arreglo de tuplas: una tabla de casos esperados.
let httpResponses: [number, string][] = [
  [200, "OK"],
  [201, "Created"],
  [400, "Bad Request"],
  [404, "Not Found"],
  [500, "Internal Server Error"],
];

httpResponses.forEach(([code, message], index) => {
  console.log(\`Caso #\${index + 1}: \${code} -> \${message}\`);
});`,
  },
];
