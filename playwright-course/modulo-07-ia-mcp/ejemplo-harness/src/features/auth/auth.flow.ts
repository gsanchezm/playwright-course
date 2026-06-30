// ============================================================
// features/auth/auth.flow.ts — orquestación de login (FACADE)
// ============================================================
// Analogía QA: el "conserje" del login. El test dice "déjame dentro
// como este usuario en este mercado" y el flow se encarga del cómo.
//
// FACADE: ofrece una API simple (loginAs) y oculta los detalles.
// Combinado con STRATEGY: el flow NO sabe si el login ocurre por UI
// o por API — eso lo decide la LoginStrategy inyectada. Por defecto
// usa UiLoginStrategy; un test puede pasar ApiLoginStrategy para
// sembrar la sesión más rápido sin tocar el flow.
// ============================================================

import type { Page } from "@playwright/test";
import type { CountryCode, User } from "../../shared/types";
import {
  type LoginStrategy,
  UiLoginStrategy,
} from "../../core/auth/LoginStrategy";

export class AuthFlow {
  private readonly strategy: LoginStrategy;

  // El contrato de fixtures construye el flow con un solo `page`;
  // la estrategia es opcional y por defecto es login por UI.
  constructor(page: Page, strategy: LoginStrategy = new UiLoginStrategy(page)) {
    this.strategy = strategy;
  }

  /**
   * Autentica al usuario en el mercado dado delegando en la estrategia.
   * @returns `{ token }` si la estrategia es API; `{}` si es por UI.
   */
  async loginAs(user: User, country: CountryCode): Promise<{ token?: string }> {
    return this.strategy.authenticate(user, country);
  }
}
