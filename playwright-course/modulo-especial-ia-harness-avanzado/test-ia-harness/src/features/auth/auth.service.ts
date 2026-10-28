// ============================================================
// features/auth/auth.service.ts — cliente de /api/auth (SERVICE)
// ============================================================
// Analogía QA: el "adaptador" hacia el backend. Aísla el detalle
// HTTP (rutas, headers, parseo) detrás de métodos de negocio como
// login(). Quien lo usa pide "autentícame", no arma requests.
//
// SERVICE/ADAPTER: extiende BaseService (Template Method) y rellena
// los huecos del contrato: basePath() y la factory create().
// ============================================================

import { request } from "@playwright/test";
import { BaseService } from "../../core/BaseService";
import type { LoginResponse, User } from "../../shared/types";

export class AuthService extends BaseService {
  /** Hueco del Template Method: base path de este servicio. */
  protected basePath(): string {
    return "/api/auth";
  }

  /**
   * Factory — crea la instancia con un APIRequestContext listo.
   * El constructor de BaseService es protected: se construye aquí.
   */
  static async create(baseURL: string): Promise<AuthService> {
    const api = await request.newContext({ baseURL });
    return new AuthService(api, baseURL);
  }

  /**
   * Login con usuario/contraseña → POST /api/auth/login.
   * Devuelve el LoginResponse (con access_token) o lanza si falla.
   */
  async login(user: User): Promise<LoginResponse> {
    const res = await this.api.post(this.url("/login"), {
      data: { username: user.username, password: user.password },
    });
    if (!res.ok()) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status()}): ${body}`);
    }
    return (await res.json()) as LoginResponse;
  }
}
