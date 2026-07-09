// ============================================================
// core/auth/LoginStrategy.ts — autenticación intercambiable (STRATEGY)
// ============================================================
// Analogía QA: "puedo entrar al sistema por la puerta (UI) o con
// llave maestra (API)". El TC pide "autentícame" sin saber por cuál.
//
// STRATEGY + DIP: el test depende de la ABSTRACCIÓN LoginStrategy,
// no de una implementación concreta. Cambiar de login por UI a
// login por API (más rápido para precondiciones) es cambiar la
// estrategia inyectada — los tests no se tocan. Inversión de
// dependencias: el detalle (UI/API) depende del contrato, no al revés.
// ============================================================

import type { Page } from "@playwright/test";
import type { CountryCode, User } from "../../shared/types";
// Las slices las generan otros agentes con estos nombres FIJOS.
import { AuthPage } from "../../features/auth/auth.page";
import { AuthService } from "../../features/auth/auth.service";

/** Contrato común: autenticar a un usuario en un mercado. */
export interface LoginStrategy {
  /**
   * @returns `{ token }` cuando la estrategia obtiene un JWT (API);
   *          `{}` cuando autentica por UI (la sesión vive en el browser).
   */
  authenticate(user: User, country: CountryCode): Promise<{ token?: string }>;
}

/**
 * Estrategia por UI: maneja la pantalla de login real con un AuthPage.
 * Útil cuando el propio login es lo que se está probando.
 */
export class UiLoginStrategy implements LoginStrategy {
  constructor(private readonly page: Page) {}

  async authenticate(user: User, country: CountryCode): Promise<{ token?: string }> {
    const authPage = new AuthPage(this.page);
    // loginInMarket hace goto + seleccionar mercado + login y espera /catalog.
    await authPage.loginInMarket(user, country);
    // El login por UI no expone token: la sesión queda en el navegador.
    return {};
  }
}

/**
 * Estrategia por API: pega directo a /api/auth/login y devuelve el token.
 * Útil para sembrar precondiciones rápido, sin pasar por la UI.
 */
export class ApiLoginStrategy implements LoginStrategy {
  constructor(private readonly apiURL: string) {}

  async authenticate(user: User, _country: CountryCode): Promise<{ token?: string }> {
    const service = await AuthService.create(this.apiURL);
    try {
      const res = await service.login(user);
      return { token: res.access_token };
    } finally {
      await service.dispose();
    }
  }
}
