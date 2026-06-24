// ============================================================
// BasePage — clase base del Page Object Model (M03)
// ============================================================
// Analogía QA: plantilla genérica que todo Page hereda.
//
// Esta versión implementa un FLUENT INTERFACE ENCADENABLE: las
// acciones NO se ejecutan al llamarlas — se ENCOLAN en `chain` y
// devuelven `this`, así puedes escribir en una sola expresión:
//
//     await loginPage.goto().selectMarket("MX").loginAs(user);
//
// El Page es "awaitable" (implementa `then`): el `await` final drena
// la cola en orden. Las QUERIES (que devuelven datos) terminan la
// cadena vía `query()`.
//
// ⚠️ Patrón AVANZADO y poco idiomático en Playwright (lo normal es un
// `await` por acción). Regla de oro: SIEMPRE haz `await` de la cadena.
//
// IMPORTANTE (M03): esta clase NO es abstracta. `abstract` llega en M05.
// ============================================================

import type { Page, Locator } from "@playwright/test";

export class BasePage {
  // Cola interna de acciones encadenadas. Cada `step()` se encola aquí;
  // el `await` sobre el Page (vía `then`) la drena en orden.
  protected chain: Promise<unknown> = Promise.resolve();

  // `protected readonly page` — herramienta interna, amarrada a una pestaña.
  // `seedChain` — permite que una transición de pantalla (p. ej. loginInMarket)
  // entregue su cola pendiente al siguiente Page.
  constructor(protected readonly page: Page, seedChain?: Promise<unknown>) {
    if (seedChain) this.chain = seedChain;
  }

  /**
   * Helper viewport-aware para resolver testids de OmniPizza.
   * Añade "-desktop" (≥768px) o "-responsive" (<768px); si el testid no
   * tiene variante por viewport, cae al testid base.
   */
  protected tid(base: string): Locator {
    const size = this.page.viewportSize();
    const suffix = size && size.width < 768 ? "-responsive" : "-desktop";
    return this.page.getByTestId(`${base}${suffix}`).or(this.page.getByTestId(base)).first();
  }

  // ---------- Núcleo del Fluent Interface encadenable ----------

  /** Encola una acción async y devuelve `this` para encadenar. */
  protected step(action: () => Promise<unknown>): this {
    this.chain = this.chain.then(() => action());
    return this;
  }

  /**
   * Hace al Page "awaitable" (thenable): al `await`, drena la cola en orden.
   * Resuelve a `undefined`, NUNCA a `this`: resolver con un thenable haría
   * que el `await` se readopte a sí mismo y se cuelgue para siempre.
   */
  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: void) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.chain.then<void>(() => undefined).then(onfulfilled, onrejected);
  }

  /**
   * Para QUERIES que devuelven datos: primero drena la cola pendiente,
   * luego computa y devuelve el valor. Es terminal — no es encadenable.
   */
  protected async query<T>(compute: () => Promise<T> | T): Promise<T> {
    await this.chain;
    return compute();
  }

  // ---------- Helpers compartidos (encolados) ----------

  /**
   * DRY (Don't Repeat Yourself): clear + fill en un solo lugar. Encola la
   * escritura y devuelve `this` para encadenar.
   */
  protected typeInput(base: string, text: string): this {
    return this.step(async () => {
      await this.tid(base).clear();
      await this.tid(base).fill(text);
    });
  }

  /** Esperar a que la URL coincida con un patrón (encolado). */
  protected waitForUrl(pattern: RegExp, timeout = 15_000): this {
    return this.step(() => this.page.waitForURL(pattern, { timeout }));
  }

  /** Screenshot con nombre semántico para debug (encolado). */
  screenshot(name: string): this {
    return this.step(() => this.page.screenshot({ path: `test-results/${name}.png` }));
  }
}
