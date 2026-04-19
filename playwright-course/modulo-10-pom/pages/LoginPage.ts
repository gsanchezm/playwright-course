// ============================================================
// LoginPage — Page Object para la pantalla de login de OmniPizza
// ============================================================

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/';

  // Locators privados — solo accesibles desde esta clase.
  // El uso de tid() los hace viewport-aware (desktop/mobile).
  private get usernameInput(): Locator {
    return this.tid('username');
  }

  private get passwordInput(): Locator {
    return this.tid('password');
  }

  private get signInButton(): Locator {
    return this.tid('login-button');
  }

  private get errorMessage(): Locator {
    return this.page.getByTestId('login-error');
  }

  private marketFlag(code: 'MX' | 'US' | 'CH' | 'JP'): Locator {
    // Testids estáticos — no pasan por tid()
    return this.page.getByTestId(`market-${code}`);
  }

  private quickLoginButton(username: string): Locator {
    return this.page.getByTestId(`user-${username}`);
  }

  // ─── ACCIONES (métodos públicos) ──────────────────────────────
  // Representan acciones humanas en la pantalla. No retornan locators.

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAsStandardUser() {
    await this.login('standard_user', 'pizza123');
  }

  async useQuickLogin(username: string) {
    await this.quickLoginButton(username).click();
  }

  async selectMarket(code: 'MX' | 'US' | 'CH' | 'JP') {
    await this.marketFlag(code).click();
  }

  // ─── ASSERTIONS (opcionales) ──────────────────────────────────
  // Pequeñas assertions de UI que viven en el POM suelen ser
  // útiles como "smoke" de que la página cargó bien.

  async expectLoaded() {
    await expect(this.signInButton).toBeVisible();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible();
  }
}
