// ============================================================
// Mini-clase 3.5: Funciones que no retornan nada (void)
// ============================================================
// Analogía: Loguear el resultado de un test: ejecuta la acción
// de imprimir, pero no te devuelve ningún valor.
// Combinamos login() + logTestResult() para simular un test real.
// ============================================================

import { login } from "./01-login";

export function logTestResult(testName: string, passed: boolean): void {
  const status = passed ? "PASSED" : "FAILED";
  console.log(`[${status}] ${testName}`);
}

// Caso de uso real: ejecuta un "test" completo usando las funciones
// de las mini-clases anteriores.
export function runLoginTest(
  testName: string,
  username: string,
  password: string
): void {
  const passed = login(username, password);
  logTestResult(testName, passed);
}

console.log("\n===== 3.5 funciones void + integración =====");
runLoginTest("Login con credenciales válidas", "admin", "Test1234!");
runLoginTest("Login con password vacío", "admin", "");
