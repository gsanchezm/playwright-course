// ============================================================
// BaseService — clase abstracta base para servicios de API (M07)
// ============================================================
// Analogía QA: BaseService es el "formato obligatorio de reporte
// de bug" corporativo. Tiene secciones obligatorias (abstract
// methods) que cada servicio concreto DEBE rellenar antes de
// contar como servicio válido. TypeScript se niega a compilar
// un hijo que no las implemente — como el sistema de tickets
// rechaza un reporte sin severidad.
//
// PRIMERA APARICIÓN de `abstract` en el curso. Se difirió hasta
// aquí a propósito — ahora hay 2+ servicios que la justifican.
// ============================================================

import type { APIRequestContext } from "@playwright/test";

export abstract class BaseService {
  protected constructor(
    protected readonly api: APIRequestContext,
    protected readonly baseURL: string,
  ) {}

  /**
   * Cada servicio concreto DEBE declarar su base path.
   * Ej: AuthService → "/api/auth", OrderService → "/api/orders"
   */
  protected abstract basePath(): string;

  /**
   * Construye una URL completa combinando baseURL + basePath + path relativo.
   */
  protected url(path = ""): string {
    return `${this.baseURL}${this.basePath()}${path}`;
  }

  /**
   * Cierra el contexto HTTP. Debe llamarse al final del TC
   * (o del describe) para evitar leaks.
   */
  async dispose(): Promise<void> {
    await this.api.dispose();
  }
}
