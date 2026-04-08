// ============================================================
// Mini-clase 5.2: LoginPage (hereda de BasePage)
// ============================================================
// Analogía: Un Page Object concreto con los localizadores y las
// acciones específicas de la página de login.
// ============================================================

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
    console.log(`Typing "${username}" in ${this.usernameInput}`);
    console.log(`Typing "${password}" in ${this.passwordInput}`);
  }

  clickLogin(): void {
    console.log(`Clicking on ${this.submitButton}`);
  }

  // Método orquestador: combina acciones de BasePage y de esta clase.
  performLogin(username: string, password: string): void {
    this.navigate("/login");      // método heredado de BasePage
    this.waitForLoad();            // método heredado de BasePage
    this.enterCredentials(username, password);
    this.clickLogin();
    console.log("Login action completed.");
  }
}

console.log("\n===== 5.2 LoginPage =====");
const loginPageDemo = new LoginPage("https://qa.myapp.com");
loginPageDemo.performLogin("admin", "Test1234!");
