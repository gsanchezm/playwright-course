// ============================================================
// LoginPage — Page Object de la pantalla de login de OmniPizza
// ============================================================
// Demuestra las 3 técnicas del curso:
//   1) DRY      → el helper `typeInput()` de BasePage (clear + fill).
//   2) 2 formas → cada locator como testid en string (Forma A) Y como
//                 getter `Locator` (Forma B).
//   3) Fluent   → acciones encadenables (devuelven `this`, encolan); la
//                 acción que CRUZA de pantalla devuelve el Page destino
//                 (loginInMarket → CatalogPage). Encadenas todo en una
//                 sola expresión y cierras con un `await`:
//                   await loginPage.goto().selectMarket("MX").loginAs(user);
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { CatalogPage } from "./CatalogPage";
import type { CountryCode, User } from "../types";

export class LoginPage extends BasePage {
  readonly path = "/";

  // --- Forma A: locators como testid en string (single source of truth) ---
  private readonly txtUsername = "username";
  private readonly txtPassword = "password";
  private readonly btnSignIn = "login-button";
  private readonly btnMarketPrefix = "market-";
  private readonly lblError = "login-error";

  // --- Forma B: los mismos locators como getters `Locator` (privados) ---
  private get usernameInput(): Locator {
    return this.tid(this.txtUsername);
  }

  private get passwordInput(): Locator {
    return this.tid(this.txtPassword);
  }

  private get signInButton(): Locator {
    return this.tid(this.btnSignIn);
  }

  private get errorMessage(): Locator {
    return this.page.getByTestId(this.lblError);
  }

  // Las banderas de mercado usan testid plano `market-XX` (sin sufijo de
  // viewport) → `page.getByTestId`, no `tid()`.
  private marketFlag(code: CountryCode): Locator {
    return this.page.getByTestId(`${this.btnMarketPrefix}${code}`);
  }

  // --- Acciones encadenables (devuelven `this`, encolan su trabajo) ---

  goto(): this {
    return this.step(() => this.page.goto(this.path));
  }

  selectMarket(code: CountryCode): this {
    return this.step(() => this.marketFlag(code).click());
  }

  // Forma A — escribe vía el helper DRY `typeInput()` (testid string).
  loginAs(user: User): this {
    return this
      .typeInput(this.txtUsername, user.username)
      .typeInput(this.txtPassword, user.password)
      .step(() => this.tid(this.btnSignIn).click());
  }

  // Forma B — la MISMA acción usando los getters `Locator`. Demuestra que
  // ambas formas conviven; en un proyecto real elige UNA por consistencia.

  loginAsUser(user: User): this {
    return this.step(async () => {
      await this.usernameInput.clear();
      await this.usernameInput.fill(user.username);
      await this.passwordInput.clear();
      await this.passwordInput.fill(user.password);
      await this.signInButton.click();
    });
  }

  // Orquestador de alto nivel. Encola el login y CRUZA de pantalla:
  // devuelve el Page destino (Fluent page-transition) heredando la cola,
  // para que el test siga encadenando sobre el CatalogPage.
  loginInMarket(user: User, code: CountryCode): CatalogPage {
    this.goto().selectMarket(code).loginAs(user).waitForUrl(/\/catalog/);
    return new CatalogPage(this.page, this.chain);
  }

  // --- Fluent builder expresivo ---
  // Cada paso hace UNA cosa, devuelve `this` y se lee como una frase.
  // Reutiliza los primitivos de arriba (typeInput / selectMarket):
  //   await loginPage.goto()
  //     .withUsername(user.username)
  //     .withPassword(user.password)
  //     .andMarket(code)
  //     .login();

  withUsername(username: string): this {
    return this.typeInput(this.txtUsername, username);
  }

  withPassword(password: string): this {
    return this.typeInput(this.txtPassword, password);
  }

  andMarket(code: CountryCode): this {
    return this.selectMarket(code);
  }

  login(): this {
    return this.step(() => this.tid(this.btnSignIn).click());
  }

  // --- Assertions de estado (también encadenables) ---

  expectLoaded(): this {
    return this.step(() => expect(this.signInButton).toBeVisible());
  }

  expectLoginError(): this {
    return this.step(() => expect(this.errorMessage).toBeVisible());
  }
}
