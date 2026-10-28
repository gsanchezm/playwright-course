// ============================================================
// core/BaseService.ts — base de servicios API (TEMPLATE METHOD)
// ============================================================
// Analogía QA: el "formato obligatorio de reporte" corporativo.
// Tiene secciones obligatorias (métodos abstract) que cada servicio
// concreto DEBE rellenar antes de contar como servicio válido.
//
// TEMPLATE METHOD: url()/dispose() son el esqueleto compartido;
// basePath() es el "hueco" abstracto que cada servicio implementa.
// TypeScript se niega a compilar un hijo que no lo defina.
// ============================================================

import { request, type APIRequestContext } from "@playwright/test";

export abstract class BaseService {
  protected constructor(
    protected readonly api: APIRequestContext,
    protected readonly baseURL: string,
  ) {}

  /**
   * Cada servicio concreto DEBE declarar su base path.
   * Ej: AuthService → "/api/auth", OrderService → "/api/orders".
   */
  protected abstract basePath(): string;

  /**
   * Construye una URL completa: baseURL + basePath + path relativo.
   */
  protected url(path = ""): string {
    return `${this.baseURL}${this.basePath()}${path}`;
  }

  /**
   * Cierra el contexto HTTP. Debe llamarse al final del TC/describe
   * para evitar leaks de conexiones.
   */
  async dispose(): Promise<void> {
    await this.api.dispose();
  }
}

/**
 * Utilidad — crea un APIRequestContext ya autenticado con Bearer.
 * La usan los servicios que requieren auth (PizzaService, OrderService).
 */
export async function createAuthedContext(
  baseURL: string,
  token: string,
  extraHeaders: Record<string, string> = {},
): Promise<APIRequestContext> {
  return request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
  });
}
