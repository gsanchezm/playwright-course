# 5.2 — `LoginPage extends BasePage`

> **Módulo 5 · Clases**

> **Analogía QA:** un Page Object **concreto** con los localizadores y las acciones específicas de la página de login. Reutiliza `navigate()` y `waitForLoad()` heredándolos de `BasePage`.

---

## ¿Qué aprendes?

- Cómo heredar una clase con `extends` y por qué llamar `super(...)` en el constructor.
- Dónde guardar los **localizadores privados** (selectores CSS) para que no se filtren al exterior.
- Cómo orquestar un flujo de test combinando métodos heredados con métodos propios.

---

## Código

```ts
// @file modulo-05-classes/02-login-page.ts
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

const loginPageDemo = new LoginPage("https://qa.myapp.com");
loginPageDemo.performLogin("admin", "Test1234!");
```

---

## Cómo correrlo

```bash
$ pnpm tsx modulo-05-classes/02-login-page.ts
```

---

## Qué observar

- `extends BasePage` le da a `LoginPage` acceso a `navigate()`, `waitForLoad()`, los getters de `baseUrl` y `timeout` y el setter validado — sin reescribir nada.
- `super(baseUrl)` es **obligatorio** porque `BasePage` tiene un constructor que recibe parámetros: si lo omites, TypeScript te lo marca.
- Los localizadores (`#username`, `#password`, ...) viven detrás de `private`. Si cambia el HTML, modificas un solo lugar y el resto del código no se entera — exactamente el valor que aporta el patrón POM.

---

⬅️ Anterior: [5.1 BasePage](/docs/typescript/m5-base-page) · ➡️ Siguiente: [5.3 HomePage](/docs/typescript/m5-home-page)
