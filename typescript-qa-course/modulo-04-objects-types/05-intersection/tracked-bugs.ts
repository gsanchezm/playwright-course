// ============================================================
// Mini-clase 4.5 — Datos: un bug con timestamps
// ============================================================

import type { TrackedBug } from "./tracked-bug.type";

export const trackedBug: TrackedBug = {
  id: 2001,
  title: "Cart total shows negative value",
  severity: "CRITICAL",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T14:00:00Z",
};
