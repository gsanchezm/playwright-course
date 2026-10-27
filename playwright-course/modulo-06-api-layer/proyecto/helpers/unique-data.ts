// ============================================================
// helpers/unique-data.ts — Data isolation para tests en paralelo
// ============================================================
// Analogía QA: cada tester paralelo lleva su propio libro de
// pedidos. Nunca comparten folios con los demás workers.
//
// Sin esto, `fullyParallel: true` + datos compartidos = colisiones
// (órdenes duplicadas, emails repetidos) que `retries` enmascara
// pero no arregla.
// ============================================================

import type { TestInfo } from "@playwright/test";

/**
 * Email único por worker + timestamp.
 * Ej: `customer+w0-1714000000000@omnipizza.test`
 */
export function uniqueEmail(info: TestInfo, prefix = "customer"): string {
  return `${prefix}+w${info.workerIndex}-${Date.now()}@omnipizza.test`;
}

/**
 * Identificador único de orden — útil para referencias externas.
 * Ej: `ORD-w0-1714000000000-4821`
 */
export function uniqueOrderId(info: TestInfo): string {
  const random = Math.floor(Math.random() * 10_000);
  return `ORD-w${info.workerIndex}-${Date.now()}-${random}`;
}

/**
 * Prefijo determinista por worker — útil cuando no queremos timestamp
 * (ej. seeds reproducibles en tests deterministas de lectura).
 */
export function workerPrefix(info: TestInfo): string {
  return `w${info.workerIndex}`;
}
