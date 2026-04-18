// ============================================================
// Mini-clase 4.4 — Función: processResult
// ============================================================
// Acepta cualquier variante del union ApiResult y la loguea
// mostrando también su typeof en runtime.
// ============================================================

import type { ApiResult } from "./api-result.type";

export function processResult(result: ApiResult): void {
  console.log(`Result: ${result} (type: ${typeof result})`);
}
