// ============================================================
// Mini-clase 5.4: Getters y Setters aplicados a un Caso de Prueba
// ============================================================
// Analogía: ejecutamos un Test Case real ("TC-042: Login y búsqueda
// con timeout configurado") combinando los getters/setters heredados
// de BasePage con los métodos de LoginPage y HomePage.
//
// BasePage ya declara:
//   get baseUrl(): string             → solo lectura (sin setter)
//   get timeout(): number             → lectura
//   set timeout(value: number)        → con validación
//
// LoginPage y HomePage heredan ambos getters/setters y aportan sus
// propios métodos (performLogin, search). Aquí los usamos juntos
// como lo haríamos en un script de automatización.
// ============================================================

import { LoginPage } from "./02-login-page";
import { HomePage } from "./03-home-page";

console.log("\n===== 5.4 Getters y Setters en un Test Case =====");
console.log("TC-042: Login y búsqueda con timeout configurado\n");

// ------------------------------------------------------------
// SETUP: instanciamos los Page Objects apuntando al ambiente QA.
// ------------------------------------------------------------
const loginPage = new LoginPage("https://qa.myapp.com");
const homePage = new HomePage("https://qa.myapp.com");

// ------------------------------------------------------------
// STEP 1 — Precondición: validar configuración inicial (getters).
// ------------------------------------------------------------
console.log("[Step 1] Verificar configuración inicial");
console.log(`  Base URL (read-only): ${loginPage.baseUrl}`);
console.log(`  Timeout default: ${loginPage.timeout}ms`);

// baseUrl es de SOLO LECTURA — descomenta para ver el error:
// loginPage.baseUrl = "https://hack.example.com"; // ❌ Cannot assign to 'baseUrl'

// ------------------------------------------------------------
// STEP 2 — El setter rechaza valores inválidos (timeout negativo).
// ------------------------------------------------------------
console.log("\n[Step 2] Intentar timeout inválido (-5000ms)");
loginPage.timeout = -5000; // rechazado por el setter
const rejectedOk = loginPage.timeout === 30000;
console.log(`  Timeout tras rechazo: ${loginPage.timeout}ms`);

// ------------------------------------------------------------
// STEP 3 — Configurar timeout válido para el ambiente QA.
// ------------------------------------------------------------
console.log("\n[Step 3] Configurar timeout válido (45000ms)");
loginPage.timeout = 45000;
const loginTimeoutOk = loginPage.timeout === 45000;

// ------------------------------------------------------------
// STEP 4 — Ejecutar el login (método propio de LoginPage que
// internamente usa waitForLoad → respeta el timeout que acabamos
// de configurar mediante el setter).
// ------------------------------------------------------------
console.log("\n[Step 4] Ejecutar login");
loginPage.performLogin("admin", "Test1234!");

// ------------------------------------------------------------
// STEP 5 — HomePage es otra hija de BasePage: hereda los mismos
// getters/setters de forma INDEPENDIENTE (su timeout no se ve
// afectado por el de loginPage).
// ------------------------------------------------------------
console.log("\n[Step 5] Configurar HomePage con timeout corto (10000ms)");
homePage.timeout = 10000;
const homeTimeoutOk = homePage.timeout === 10000;
console.log(`  loginPage.timeout sigue siendo: ${loginPage.timeout}ms`);
console.log(`  homePage.timeout es: ${homePage.timeout}ms`);

// ------------------------------------------------------------
// STEP 6 — Ejecutar búsqueda en HomePage.
// ------------------------------------------------------------
console.log("\n[Step 6] Ejecutar búsqueda");
homePage.search("wireless keyboard");

// ------------------------------------------------------------
// RESULTADO DEL TEST CASE
// ------------------------------------------------------------
const testPassed = rejectedOk && loginTimeoutOk && homeTimeoutOk;
console.log("\n---------------------------------------------");
console.log(`TC-042 → ${testPassed ? "PASSED ✅" : "FAILED ❌"}`);
console.log("---------------------------------------------");
