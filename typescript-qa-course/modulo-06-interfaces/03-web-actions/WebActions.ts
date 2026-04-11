// ============================================================
// Contrato: WebActions
// ============================================================
// Define los métodos mínimos que cualquier helper de automatización
// debe exponer. El contrato vive por sí solo (en su propio archivo)
// para dejar claro que NO depende de ninguna herramienta concreta:
// Playwright, Selenium, Cypress... cualquiera puede cumplirlo.
// ============================================================

export interface WebActions {
  click(element: string): void;
  getText(element: string): string;
  isVisible(element: string): boolean;
}
