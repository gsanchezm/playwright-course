// ============================================================
// Mini-clase 5.4: Getters y Setters en el Page Object Model
// ============================================================
// Analogía: validar un valor ANTES de aceptarlo, como cuando tu
// framework no permite un timeout negativo o no te deja cambiar
// el baseUrl una vez configurado.
//
// BasePage ya declara:
//   get baseUrl(): string             → solo lectura (sin setter)
//   get timeout(): number             → lectura
//   set timeout(value: number)        → con validación
//
// Como LoginPage extiende BasePage, HEREDA ambos getters/setters.
// Aquí lo demostramos sin tocar una línea de LoginPage.
// ============================================================

import { LoginPage } from "./02-login-page";

console.log("\n===== 5.4 Getters y Setters (integrados con POM) =====");

const loginPage = new LoginPage("https://qa.myapp.com");

// 1) Getter heredado de BasePage: lectura de baseUrl.
console.log(`Base URL heredado: ${loginPage.baseUrl}`);

// 2) baseUrl es de SOLO LECTURA (no tiene setter).
//    Descomenta la línea siguiente para ver el error de TypeScript:
// loginPage.baseUrl = "https://hack.example.com"; // ❌ Cannot assign to 'baseUrl' because it is a read-only property.

// 3) Getter de timeout: leemos el valor por defecto.
console.log(`Timeout default: ${loginPage.timeout}ms`);

// 4) Setter con validación: intentamos un valor inválido.
loginPage.timeout = -5000; // rechazado por el setter
console.log(`Timeout tras rechazo: ${loginPage.timeout}ms`);

// 5) Setter con un valor válido.
loginPage.timeout = 60000;
console.log(`Timeout aplicado: ${loginPage.timeout}ms`);

// 6) El método heredado waitForLoad() usa internamente this._timeout,
//    así que la asignación anterior ya se refleja aquí.
loginPage.waitForLoad();

// --- Misma historia con HomePage (otra hija de BasePage) ---
import { HomePage } from "./03-home-page";

const homePage = new HomePage("https://qa.myapp.com");
homePage.timeout = 10000;  // setter heredado
homePage.waitForLoad();    // usa el nuevo timeout
