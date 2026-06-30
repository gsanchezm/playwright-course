// ============================================================
// features/auth/auth.page.ts — Page Object del login (POM)
// ============================================================
// Analogía QA: el "mapa de navegación" de la pantalla de login.
// Los tests NUNCA tocan locators directamente — sólo llaman
// métodos de negocio como loginAs() o loginInMarket().
//
// POM: esta clase concentra los locators y las acciones de la
// pantalla. Extiende BasePage (Template Method) para reusar tid()
// y waitForUrl() sin reimplementarlos.
// ============================================================

import { expect, type Locator } from "@playwright/test";
import { BasePage } from "../../core/BasePage";
import type { CountryCode, User } from "../../shared/types";

export class AuthPage extends BasePage {
  // Ruta de la pantalla de login (la raíz de OmniPizza).
  private readonly path = "/";

  // Testids base (sin sufijo de viewport; tid() lo añade donde aplica).
  private readonly txtUsername = "username";
  private readonly txtPassword = "password";
  private readonly btnSignIn = "login-button";
  private readonly lblError = "login-error";
  private readonly btnMarket = "market-";

  // --- Locators privados: documentación interna del Page ---

  // username/password/botón usan sufijo de viewport → helper tid().
  private get usernameInput(): Locator {
    return this.tid(this.txtUsername);
  }

  private get passwordInput(): Locator {
    return this.tid(this.txtPassword);
  }

  private get signInButton(): Locator {
    return this.tid(this.btnSignIn);
  }

  // login-error NO lleva sufijo → getByTestId directo.
  private get errorMessage(): Locator {
    return this.page.getByTestId(this.lblError);
  }

  // market-<code> NO lleva sufijo → getByTestId directo.
  private marketFlag(code: CountryCode): Locator {
    return this.page.getByTestId(`${this.btnMarket}${code}`);
  }

  // --- Acciones públicas: la interfaz del POM ---

  /** Navega a la pantalla de login. */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Selecciona el mercado (bandera) por código de país. */
  async selectMarket(code: CountryCode): Promise<void> {
    await this.marketFlag(code).click();
  }

  /** Llena credenciales y envía el formulario de login. */
  async loginAs(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
    await this.signInButton.click();
  }

  /**
   * Flujo completo de login: goto + seleccionar mercado + login y
   * espera a aterrizar en /catalog. Lo consume UiLoginStrategy.
   */
  async loginInMarket(user: User, code: CountryCode): Promise<void> {
    await this.goto();
    await this.selectMarket(code);
    await this.loginAs(user);
    await this.waitForUrl(/\/catalog/);
  }

  // --- Assertions de estado (web-first, sin sleeps) ---

  /** La pantalla de login cargó (el botón Sign In es visible). */
  async expectLoaded(): Promise<void> {
    await expect(this.signInButton).toBeVisible();
  }

  /** Se muestra el mensaje de error de login. */
  async expectLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
