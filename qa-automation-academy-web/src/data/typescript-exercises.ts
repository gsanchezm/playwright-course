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
  {
    id: "m3-login",
    module: "Módulo 3 · Funciones",
    label: "3.1 función login",
    filename: "modulo-03-functions/01-login.ts",
    description: "Función con parámetros obligatorios tipados y tipo de retorno boolean.",
    code: `// Mini-clase 3.1: función básica con parámetros obligatorios
// Analogía: un "Step" de tu caso de prueba que siempre necesita
// los mismos datos (usuario y contraseña).
console.log("\\n===== 3.1 función básica login() =====");

const VALID_USER = "admin";
const VALID_PASS = "Test1234!";

export function login(username: string, password: string): boolean {
  if (username === VALID_USER && password === VALID_PASS) {
    console.log(\`Login successful for user: \${username}\`);
    return true;
  } else {
    console.log(\`Login failed for user: \${username}\`);
    return false;
  }
}

// Forma simplificada usando operador ternario.
export function loginTernary(username: string, password: string): boolean {
  const isSuccess = username === VALID_USER && password === VALID_PASS;
  console.log(isSuccess
    ? \`Ternary Login successful: \${username}\`
    : \`Ternary Login failed: \${username}\`);
  return isSuccess;
}

const loginDemo1 = login("admin", "Test1234!");
const loginDemo2 = login("guest", "wrong");
console.log(\`Result 1: \${loginDemo1}, Result 2: \${loginDemo2}\`);`,
  },
  {
    id: "m3-login-options",
    module: "Módulo 3 · Funciones",
    label: "3.2 parámetros opcionales",
    filename: "modulo-03-functions/02-login-options.ts",
    description: "El '?' marca un parámetro como opcional. Reutiliza login() del archivo anterior.",
    code: `// Mini-clase 3.2: parámetros opcionales con "?"
// Analogía: un checkbox "Remember me" que puede estar o no.
import { login } from "./01-login";

export function loginWithOptions(
  username: string,
  password: string,
  rememberMe?: boolean
): boolean {
  console.log(\`Logging in as: \${username}\`);

  if (rememberMe) {
    console.log("Remember me: enabled");
  }

  // Reutilizamos login() del archivo anterior.
  return login(username, password);
}

console.log("\\n===== 3.2 parámetros opcionales =====");
loginWithOptions("admin", "Test1234!");          // sin "remember me"
loginWithOptions("admin", "Test1234!", true);    // con "remember me"`,
  },
  {
    id: "m3-navigate",
    module: "Módulo 3 · Funciones",
    label: "3.3 valores por defecto",
    filename: "modulo-03-functions/03-navigate.ts",
    description: "Parámetros con valor default: el ambiente QA aplica si no pasas otro.",
    code: `// Mini-clase 3.3: parámetros con valor por defecto
// Analogía: la mayoría de tus pruebas apuntan al mismo ambiente
// (QA), así que lo ponemos como valor por defecto.
export function navigateTo(
  path: string,
  baseUrl: string = "https://qa.myapp.com"
): string {
  const fullUrl = \`\${baseUrl}\${path}\`;
  console.log(\`Navigating to: \${fullUrl}\`);
  return fullUrl;
}

console.log("\\n===== 3.3 valores por defecto =====");
navigateTo("/login");                               // URL por defecto (QA)
navigateTo("/login", "https://staging.myapp.com");  // URL personalizada`,
  },
  {
    id: "m3-arrow-functions",
    module: "Módulo 3 · Funciones",
    label: "3.4 arrow functions",
    filename: "modulo-03-functions/04-arrow-functions.ts",
    description: "Sintaxis abreviada para validaciones pequeñas (matchers, predicados).",
    code: `// Mini-clase 3.4: arrow functions
// Analogía: una forma abreviada de escribir funciones simples.
// Perfectas para validaciones pequeñas dentro de un test.

// Versión clásica:
//   function isSuccessCode(code: number): boolean { return code >= 200 && code < 300; }
// Versión arrow (más corta):
export const isSuccessCode = (code: number): boolean =>
  code >= 200 && code < 300;

export const isClientError = (code: number): boolean =>
  code >= 400 && code < 500;

console.log("\\n===== 3.4 arrow functions =====");
console.log(\`200 es éxito: \${isSuccessCode(200)}\`);
console.log(\`404 es éxito: \${isSuccessCode(404)}\`);
console.log(\`404 es error de cliente: \${isClientError(404)}\`);`,
  },
  {
    id: "m3-void-functions",
    module: "Módulo 3 · Funciones",
    label: "3.5 funciones void",
    filename: "modulo-03-functions/05-void-functions.ts",
    description: "Funciones que ejecutan acción pero no devuelven nada — loggers de tests.",
    code: `// Mini-clase 3.5: funciones que no retornan nada (void)
// Analogía: loguear el resultado de un test: ejecuta la acción
// de imprimir, pero no te devuelve ningún valor.
import { login } from "./01-login";

export function logTestResult(testName: string, passed: boolean): void {
  const status = passed ? "PASSED" : "FAILED";
  console.log(\`[\${status}] \${testName}\`);
}

// Caso de uso real: ejecuta un "test" combinando funciones de mini-clases
// anteriores.
export function runLoginTest(
  testName: string,
  username: string,
  password: string
): void {
  const passed = login(username, password);
  logTestResult(testName, passed);
}

console.log("\\n===== 3.5 funciones void + integración =====");
runLoginTest("Login con credenciales válidas", "admin", "Test1234!");
runLoginTest("Login con password vacío", "admin", "");`,
  },
  {
    id: "m4-basic-object",
    module: "Módulo 4 · Objetos y Tipos",
    label: "4.1 objeto básico",
    filename: "modulo-04-objects-types/01-basic-object.ts",
    description: "Objeto literal sin tipo personalizado: TypeScript infiere los tipos.",
    code: `// Mini-clase 4.1: objeto básico (sin tipo personalizado)
// Analogía: un payload JSON con datos de un usuario de prueba.
console.log("\\n===== 4.1 objeto básico =====");

const testUser = {
  name: "John Doe",
  age: 30,
  role: "admin",
};

console.log(\`User: \${testUser.name}\`);
console.log(\`Role: \${testUser.role}\`);
console.log(\`Edad: \${testUser.age}\`);

// Problema: si quieres otro usuario con la MISMA estructura,
// tendrías que repetir la forma. Solución → "type" (siguiente archivo).`,
  },
  {
    id: "m4-type-alias",
    module: "Módulo 4 · Objetos y Tipos",
    label: "4.2 type alias",
    filename: "modulo-04-objects-types/02-type-alias/",
    description: "Un molde reutilizable para fixtures: el contrato vive separado de los datos.",
    code: `// Mini-clase 4.2: type alias (molde reutilizable)
// Analogía: definir tu propio esquema, como las columnas de una
// tabla en una base de datos de usuarios de prueba.

// @file modulo-04-objects-types/02-type-alias/test-user.type.ts
export type TestUser = {
  username: string;
  password: string;
  isActive: boolean;
};

// @file modulo-04-objects-types/02-type-alias/test-users.ts
import type { TestUser } from "./test-user.type";

export const adminUser: TestUser = {
  username: "admin@test.com",
  password: "SecurePass123!",
  isActive: true,
};

export const viewerUser: TestUser = {
  username: "viewer@test.com",
  password: "Viewer123!",
  isActive: false,
};

// @file modulo-04-objects-types/02-type-alias/index.ts
import { adminUser, viewerUser } from "./test-users";

console.log("\\n===== 4.2 type alias =====");
console.log(\`Admin: \${adminUser.username}, Active: \${adminUser.isActive}\`);
console.log(\`Viewer: \${viewerUser.username}, Active: \${viewerUser.isActive}\`);`,
  },
  {
    id: "m4-optional-props",
    module: "Módulo 4 · Objetos y Tipos",
    label: "4.3 propiedades opcionales",
    filename: "modulo-04-objects-types/03-optional-props/",
    description: "El '?' modela campos que pueden faltar en un bug report.",
    code: `// Mini-clase 4.3: propiedades opcionales
// Analogía: un bug report con campos obligatorios (id, title)
// y otros opcionales (assignee, screenshot).

// @file modulo-04-objects-types/03-optional-props/bug-report.type.ts
export type BugReport = {
  id: number;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignee?: string;           // puede no estar asignado aún
  screenshot?: string | null;  // opcional Y puede ser null
};

// @file modulo-04-objects-types/03-optional-props/bugs.ts
import type { BugReport } from "./bug-report.type";

export const bug: BugReport = {
  id: 1042,
  title: "Submit button unresponsive on mobile",
  severity: "HIGH",
  // assignee se omite porque es opcional
  screenshot: null,
};

// @file modulo-04-objects-types/03-optional-props/index.ts
import { bug } from "./bugs";

console.log("\\n===== 4.3 propiedades opcionales =====");
console.log(\`Bug #\${bug.id}: \${bug.title} [\${bug.severity}]\`);
console.log(\`Asignado a: \${bug.assignee ?? "sin asignar"}\`);`,
  },
  {
    id: "m4-union-types",
    module: "Módulo 4 · Objetos y Tipos",
    label: "4.4 union types",
    filename: "modulo-04-objects-types/04-union-types/",
    description: "Campos que solo aceptan ciertas opciones cerradas (estados de UI / tests).",
    code: `// Mini-clase 4.4: union types ( | )
// Analogía: un campo que SOLO acepta ciertas opciones cerradas,
// como el estado de un botón o el tipo de dato de una respuesta.

// @file modulo-04-objects-types/04-union-types/api-result.type.ts
export type ApiResult = string | number | boolean;

// @file modulo-04-objects-types/04-union-types/button-state.type.ts
export type ButtonState = "enabled" | "disabled" | "loading";

// @file modulo-04-objects-types/04-union-types/process-result.ts
import type { ApiResult } from "./api-result.type";

export function processResult(result: ApiResult): void {
  console.log(\`Result: \${result} (type: \${typeof result})\`);
}

// @file modulo-04-objects-types/04-union-types/index.ts
import type { ButtonState } from "./button-state.type";
import { processResult } from "./process-result";

console.log("\\n===== 4.4 union types =====");

let submitButton: ButtonState = "enabled";
console.log(\`Button state: \${submitButton}\`);
submitButton = "loading";
console.log(\`Button state: \${submitButton}\`);
// submitButton = "invisible"; // ❌ Error: valor no permitido

processResult("Success");
processResult(200);
processResult(true);`,
  },
  {
    id: "m4-intersection",
    module: "Módulo 4 · Objetos y Tipos",
    label: "4.5 intersection types",
    filename: "modulo-04-objects-types/05-intersection/",
    description: "Combinar dos contratos con '&': BugReport + HasTimestamp.",
    code: `// Mini-clase 4.5: intersection types ( & )
// Analogía: combinar dos contratos: "es un BugReport" Y TAMBIÉN
// "tiene timestamps". Reutilizamos BugReport del 4.3.

// @file modulo-04-objects-types/05-intersection/timestamp.type.ts
export type HasTimestamp = {
  createdAt: string;
  updatedAt: string;
};

// @file modulo-04-objects-types/05-intersection/tracked-bug.type.ts
import type { BugReport } from "../03-optional-props/bug-report.type";
import type { HasTimestamp } from "./timestamp.type";

// Intersection: el tipo resultante cumple AMBOS contratos.
export type TrackedBug = BugReport & HasTimestamp;

// @file modulo-04-objects-types/05-intersection/tracked-bugs.ts
import type { TrackedBug } from "./tracked-bug.type";

export const trackedBug: TrackedBug = {
  id: 2001,
  title: "Cart total shows negative value",
  severity: "CRITICAL",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T14:00:00Z",
};

// @file modulo-04-objects-types/05-intersection/index.ts
import { trackedBug } from "./tracked-bugs";

console.log("\\n===== 4.5 intersection types =====");
console.log(\`Tracked bug: #\${trackedBug.id}\`);
console.log(\`Creado: \${trackedBug.createdAt}\`);
console.log(\`Actualizado: \${trackedBug.updatedAt}\`);`,
  },
  {
    id: "m5-base-page",
    module: "Módulo 5 · Clases (POM)",
    label: "5.1 BasePage",
    filename: "modulo-05-classes/01-base-page.ts",
    description: "Clase base del POM con getter read-only y setter validado.",
    code: `// Mini-clase 5.1: BasePage (clase base del Page Object Model)
// Analogía: la clase padre de todas las páginas de tu app.
// Contiene la configuración común (URL, timeout) y la lógica
// compartida: navegar, esperar a que cargue, etc.
export class BasePage {
  protected _baseUrl: string;
  private _timeout: number = 30000;

  constructor(baseUrl: string) {
    this._baseUrl = baseUrl;
  }

  // Getter SIN setter → la propiedad es de solo lectura desde fuera.
  get baseUrl(): string {
    return this._baseUrl;
  }

  get timeout(): number {
    return this._timeout;
  }

  // Setter con validación: rechaza valores inválidos.
  set timeout(value: number) {
    if (value < 0) {
      console.log("Error: timeout cannot be negative. Keeping previous value.");
      return;
    }
    this._timeout = value;
    console.log(\`Timeout set to: \${value}ms\`);
  }

  navigate(path: string): void {
    console.log(\`Navigating to: \${this._baseUrl}\${path}\`);
  }

  waitForLoad(): void {
    console.log(\`Waiting up to \${this._timeout}ms for page to load...\`);
  }
}

console.log("\\n===== 5.1 BasePage =====");
const basePageDemo = new BasePage("https://qa.myapp.com");
console.log(\`Base URL (getter): \${basePageDemo.baseUrl}\`);
basePageDemo.navigate("/");
basePageDemo.waitForLoad();`,
  },
  {
    id: "m5-login-page",
    module: "Módulo 5 · Clases (POM)",
    label: "5.2 LoginPage",
    filename: "modulo-05-classes/02-login-page.ts",
    description: "Page Object concreto que hereda de BasePage y orquesta el login.",
    code: `// Mini-clase 5.2: LoginPage (hereda de BasePage)
// Analogía: un Page Object con localizadores y acciones específicas
// de la página de login.
import { BasePage } from "./01-base-page";

export class LoginPage extends BasePage {
  // Localizadores privados: solo usables dentro de esta clase.
  private usernameInput: string = "#username";
  private passwordInput: string = "#password";
  private submitButton: string = "#login-btn";

  constructor(baseUrl: string) {
    // "super" llama al constructor de BasePage.
    super(baseUrl);
  }

  enterCredentials(username: string, password: string): void {
    console.log(\`Typing "\${username}" in \${this.usernameInput}\`);
    console.log(\`Typing "\${password}" in \${this.passwordInput}\`);
  }

  clickLogin(): void {
    console.log(\`Clicking on \${this.submitButton}\`);
  }

  // Método orquestador: combina acciones de BasePage y de esta clase.
  performLogin(username: string, password: string): void {
    this.navigate("/login");      // método heredado
    this.waitForLoad();            // método heredado
    this.enterCredentials(username, password);
    this.clickLogin();
    console.log("Login action completed.");
  }
}

console.log("\\n===== 5.2 LoginPage =====");
const loginPageDemo = new LoginPage("https://qa.myapp.com");
loginPageDemo.performLogin("admin", "Test1234!");`,
  },
  {
    id: "m5-home-page",
    module: "Módulo 5 · Clases (POM)",
    label: "5.3 HomePage",
    filename: "modulo-05-classes/03-home-page.ts",
    description: "Otra hija de BasePage: reutiliza navigate() y waitForLoad() sin reescribir.",
    code: `// Mini-clase 5.3: HomePage (otra hija de BasePage)
// Analogía: otra página del sitio que reutiliza navigate() y
// waitForLoad() sin tener que reimplementarlos.
import { BasePage } from "./01-base-page";

export class HomePage extends BasePage {
  private searchBar: string = "#search-input";

  search(term: string): void {
    this.navigate("/home");         // heredado de BasePage
    console.log(\`Typing "\${term}" in \${this.searchBar}\`);
    console.log(\`Search executed for: \${term}\`);
  }
}

console.log("\\n===== 5.3 HomePage =====");
const homePageDemo = new HomePage("https://qa.myapp.com");
homePageDemo.search("wireless keyboard");`,
  },
  {
    id: "m5-getters-setters",
    module: "Módulo 5 · Clases (POM)",
    label: "5.4 getters / setters",
    filename: "modulo-05-classes/04-getters-setters.ts",
    description: "Test Case real (TC-042) usando getters/setters heredados de BasePage.",
    code: `// Mini-clase 5.4: getters y setters aplicados a un Test Case
// Analogía: ejecutamos TC-042 (Login + búsqueda con timeout
// configurado) combinando getters/setters heredados con métodos
// de LoginPage y HomePage.
import { LoginPage } from "./02-login-page";
import { HomePage } from "./03-home-page";

console.log("\\n===== 5.4 Getters y Setters en un Test Case =====");
console.log("TC-042: Login y búsqueda con timeout configurado\\n");

const loginPage = new LoginPage("https://qa.myapp.com");
const homePage = new HomePage("https://qa.myapp.com");

// STEP 1 — Precondición: validar configuración inicial (getters).
console.log("[Step 1] Verificar configuración inicial");
console.log(\`  Base URL (read-only): \${loginPage.baseUrl}\`);
console.log(\`  Timeout default: \${loginPage.timeout}ms\`);
// loginPage.baseUrl = "https://hack.example.com"; // ❌ read-only

// STEP 2 — El setter rechaza valores inválidos (timeout negativo).
console.log("\\n[Step 2] Intentar timeout inválido (-5000ms)");
loginPage.timeout = -5000;
const rejectedOk = loginPage.timeout === 30000;

// STEP 3 — Configurar timeout válido para QA.
console.log("\\n[Step 3] Configurar timeout válido (45000ms)");
loginPage.timeout = 45000;
const loginTimeoutOk = loginPage.timeout === 45000;

// STEP 4 — Ejecutar el login (waitForLoad usa el timeout configurado).
console.log("\\n[Step 4] Ejecutar login");
loginPage.performLogin("admin", "Test1234!");

// STEP 5 — HomePage tiene su propio timeout, independiente.
console.log("\\n[Step 5] Configurar HomePage con timeout corto (10000ms)");
homePage.timeout = 10000;
const homeTimeoutOk = homePage.timeout === 10000;
console.log(\`  loginPage.timeout sigue siendo: \${loginPage.timeout}ms\`);
console.log(\`  homePage.timeout es: \${homePage.timeout}ms\`);

// STEP 6 — Búsqueda en HomePage.
console.log("\\n[Step 6] Ejecutar búsqueda");
homePage.search("wireless keyboard");

// RESULTADO DEL TEST CASE
const testPassed = rejectedOk && loginTimeoutOk && homeTimeoutOk;
console.log(\`\\nTC-042 → \${testPassed ? "PASSED ✅" : "FAILED ❌"}\`);`,
  },
];
