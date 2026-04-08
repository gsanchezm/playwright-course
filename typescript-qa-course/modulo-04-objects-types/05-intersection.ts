// ============================================================
// Mini-clase 4.5: Intersection Types ( & )
// ============================================================
// Analogía: Combinar dos contratos: "es un BugReport" Y TAMBIÉN
// "tiene timestamps". Reutilizamos BugReport de la mini-clase 4.3.
// ============================================================

import type { BugReport } from "./03-optional-props";

export type HasTimestamp = {
  createdAt: string;
  updatedAt: string;
};

// Intersection: el tipo resultante cumple AMBOS contratos.
export type TrackedBug = BugReport & HasTimestamp;

export const trackedBug: TrackedBug = {
  id: 2001,
  title: "Cart total shows negative value",
  severity: "CRITICAL",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T14:00:00Z",
};

console.log("\n===== 4.5 intersection types =====");
console.log(`Tracked bug: #${trackedBug.id}`);
console.log(`Creado: ${trackedBug.createdAt}`);
console.log(`Actualizado: ${trackedBug.updatedAt}`);
