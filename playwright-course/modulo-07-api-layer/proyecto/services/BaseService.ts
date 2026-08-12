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
// PRIMERA APARICIÓN de `abstract` en el curso. No es por tener 3
// servicios — es porque BaseService necesita un CONTRATO real:
// `basePath()` no tiene una implementación por defecto razonable
// (¿qué path le pondrías?), y sin `abstract` nada impide instanciar
// BaseService directo con un basePath roto — TypeScript no se
// quejaría, solo fallarías en runtime con una URL mal construida.
//
// Compara con pages/BasePage.ts (M04): tiene el DOBLE de hijos que
// BaseService y sigue siendo una clase normal, porque ninguno de
// sus métodos necesita que un hijo lo sobreescriba — todos ya
// tienen cuerpo. El criterio no es "cuántos hijos", es "¿hay un
// método sin implementación razonable que el compilador deba
// forzar?". Aquí sí lo hay; en BasePage, no.
//
// (Los 3 servicios sí importan, pero para otra cosa: con 1 solo
// servicio el riesgo de "se me olvidó definir basePath()" es
// abstracto — con 3 compartiendo el mismo molde, es el tipo de bug
// real que `abstract` evita de raíz.)
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
